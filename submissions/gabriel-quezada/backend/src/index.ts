import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

import { Account, Product, SalesTeam, PipelineItem, ScoreBreakdown } from './types';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory data store
const db = {
  accounts: [] as Account[],
  products: [] as Product[],
  salesTeams: [] as SalesTeam[],
  salesPipeline: [] as PipelineItem[]
};

// Hash maps for fast lookup (O(1))
const dbMaps = {
  accounts: new Map<string, Account>(),
  products: new Map<string, Product>(),
  salesTeams: new Map<string, SalesTeam>()
};

// Data loading function
const loadCSV = <T>(filename: string, arrayReference: T[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    // path adjusts because index.ts is inside /src
    const filePath = path.join(__dirname, '..', 'data', filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return resolve();
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: any) => arrayReference.push(data as T))
      .on('end', () => resolve())
      .on('error', (error) => reject(error));
  });
};

// Scoring Logic (0 to 100)
function calculateScore(deal: PipelineItem, accountInfo: Account | null, productInfo: Product | null): { score: number, breakdown: ScoreBreakdown } {
  if (deal.deal_stage === 'Won') {
    return { score: 100, breakdown: { stage: 100, financial: 0, time: 0, explanation: "Deal already won." } };
  }
  if (deal.deal_stage === 'Lost') {
    return { score: 0, breakdown: { stage: 0, financial: 0, time: 0, explanation: "Deal lost." } };
  }

  let score = 0;
  const breakdown: ScoreBreakdown = { stage: 0, financial: 0, time: 0, explanation: "" };

  // 1. Deal Stage (Max 30)
  if (deal.deal_stage === 'Engaging') {
    breakdown.stage = 30;
  } else if (deal.deal_stage === 'Prospecting') {
    breakdown.stage = 15;
  }
  score += breakdown.stage;

  // 2. Financial Value (Max 40)
  const revenue = accountInfo?.revenue ? parseFloat(accountInfo.revenue) : 0;
  const closeValue = deal.close_value ? parseFloat(deal.close_value) : 0;
  
  let finScore = 0;
  if (closeValue > 10000) finScore += 20;
  else if (closeValue > 1000) finScore += 10;
  else if (closeValue > 0) finScore += 5;

  if (revenue > 1000000) finScore += 20;
  else if (revenue > 100000) finScore += 10;
  else if (revenue > 0) finScore += 5;

  breakdown.financial = Math.min(finScore, 40);
  score += breakdown.financial;

  // 3. Time in Pipeline (Max 30)
  let timeScore = 0;
  if (deal.engage_date) {
    const engageDate = new Date(deal.engage_date);
    const compareDate = deal.close_date ? new Date(deal.close_date) : new Date();
    const diffTime = Math.abs(compareDate.getTime() - engageDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Recent deals are hotter, stale deals lose momentum
    if (diffDays <= 30) timeScore = 30;
    else if (diffDays <= 90) timeScore = 15;
    else timeScore = 5; 
  } else {
    // Baseline for prospecting without engage date
    timeScore = 10;
  }
  breakdown.time = timeScore;
  score += breakdown.time;

  // Cap at 99 for ongoing deals
  score = Math.min(score, 99); 

  breakdown.explanation = `Total Score: ${score}. Breakdown -> Stage: ${breakdown.stage}/30, Financial: ${breakdown.financial}/40, Time: ${breakdown.time}/30.`;

  return { score, breakdown };
}

// Join helper
function enrichDeal(deal: PipelineItem): PipelineItem {
  const accountInfo = dbMaps.accounts.get(deal.account) || null;
  const productInfo = dbMaps.products.get(deal.product) || null;
  const teamInfo = dbMaps.salesTeams.get(deal.sales_agent) || null;
  
  const { score, breakdown } = calculateScore(deal, accountInfo, productInfo);
  
  return {
    ...deal,
    account_details: accountInfo,
    product_details: productInfo,
    team_details: teamInfo,
    score,
    score_breakdown: breakdown
  };
}

// API Endpoints

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Server is running (TypeScript)',
    dataStats: {
      accountsCount: db.accounts.length,
      productsCount: db.products.length,
      salesTeamsCount: db.salesTeams.length,
      salesPipelineCount: db.salesPipeline.length
    }
  });
});

app.get('/api/pipeline', (req: Request, res: Response) => {
  const { deal_stage, sales_agent, manager, regional_office } = req.query;
  
  let results = db.salesPipeline.map(enrichDeal);
  
  if (deal_stage) results = results.filter(d => d.deal_stage === deal_stage as string);
  if (sales_agent) results = results.filter(d => d.sales_agent === sales_agent as string);
  if (manager) results = results.filter(d => d.team_details?.manager === manager as string);
  if (regional_office) results = results.filter(d => d.team_details?.regional_office === regional_office as string);
  
  // Sort by score descending
  results.sort((a, b) => (b.score || 0) - (a.score || 0));
  
  res.json({ count: results.length, data: results });
});

app.get('/api/stats', (req: Request, res: Response) => {
  const enriched = db.salesPipeline.map(enrichDeal);
  
  const totalDeals = enriched.length;
  const wonDeals = enriched.filter(d => d.deal_stage === 'Won').length;
  const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
  
  const hotDealsCount = enriched.filter(d => (d.score || 0) > 75 && d.deal_stage !== 'Won').length;
  
  const totalPipelineValue = enriched.reduce((sum, d) => sum + (parseFloat(d.close_value) || 0), 0);
  
  res.json({
    totalDeals,
    wonDeals,
    conversionRate: conversionRate.toFixed(2) + '%',
    hotDealsCount,
    totalPipelineValue
  });
});

app.get('/api/deal/:id', (req: Request, res: Response) => {
  const deal = db.salesPipeline.find(d => d.opportunity_id === req.params.id);
  if (!deal) {
    res.status(404).json({ error: 'Deal not found' });
    return;
  }
  
  res.json(enrichDeal(deal));
});

// Initialize server
const startServer = async () => {
  try {
    console.log('Loading CSV data...');
    await Promise.all([
      loadCSV<Account>('accounts.csv', db.accounts),
      loadCSV<Product>('products.csv', db.products),
      loadCSV<SalesTeam>('sales_teams.csv', db.salesTeams),
      loadCSV<PipelineItem>('sales_pipeline.csv', db.salesPipeline)
    ]);
    
    // Create indexing maps for fast O(1) lookups
    db.accounts.forEach(acc => dbMaps.accounts.set(acc.account, acc));
    db.products.forEach(prod => dbMaps.products.set(prod.product, prod));
    db.salesTeams.forEach(team => dbMaps.salesTeams.set(team.sales_agent, team));

    console.log('CSV data loaded and indexed successfully!');

    app.listen(port, () => {
      console.log(`Server is running on port ${port} (TypeScript)`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();

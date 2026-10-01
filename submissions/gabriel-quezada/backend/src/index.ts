import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

import {
  Account,
  Product,
  SalesTeam,
  PipelineItem,
  ScoreBreakdown,
} from "./types";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory data store
const db = {
  accounts: [] as Account[],
  products: [] as Product[],
  salesTeams: [] as SalesTeam[],
  salesPipeline: [] as PipelineItem[],
};

// Hash maps for fast lookup (O(1))
const dbMaps = {
  accounts: new Map<string, Account>(),
  products: new Map<string, Product>(),
  salesTeams: new Map<string, SalesTeam>(),
};

// Data loading function
const loadCSV = <T>(filename: string, arrayReference: T[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    // path adjusts because index.ts is inside /src
    const filePath = path.join(__dirname, "..", "data", filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return resolve();
    }
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data: any) => arrayReference.push(data as T))
      .on("end", () => resolve())
      .on("error", (error) => reject(error));
  });
};

// ─── Scoring Reference Date ───────────────────────────────────────────────────
// The dataset spans 2016-2017. Using the dataset's own max close_date as the
// reference point ensures time-in-pipeline scoring is relative to the data era,
// not the wall clock (which would make every deal look "stale").
const SCORE_REFERENCE_DATE = new Date("2017-03-31");

// Scoring Logic (0 to 100)
// ─── Weight breakdown ─────────────────────────────────────────────────────────
// Stage     → max 35 pts  (Engaging=35, Prospecting=15)
// Financial → max 40 pts  (uses account revenue as proxy; close_value is empty
//                          for active deals in this dataset)
// Recency   → max 25 pts  (how recently the deal entered the pipeline relative
//                          to the reference date; older = more stale)
// ─────────────────────────────────────────────────────────────────────────────
function calculateScore(
  deal: PipelineItem,
  accountInfo: Account | null,
  productInfo: Product | null,
): { score: number; breakdown: ScoreBreakdown } {
  if (deal.deal_stage === "Won") {
    return {
      score: 100,
      breakdown: {
        stage: 35,
        financial: 0,
        time: 0,
        explanation: "Deal already won.",
      },
    };
  }
  if (deal.deal_stage === "Lost") {
    return {
      score: 0,
      breakdown: { stage: 0, financial: 0, time: 0, explanation: "Deal lost." },
    };
  }

  let score = 0;
  const breakdown: ScoreBreakdown = {
    stage: 0,
    financial: 0,
    time: 0,
    explanation: "",
  };

  // ── 1. Deal Stage (Max 35) ──────────────────────────────────────────────────
  if (deal.deal_stage === "Engaging") {
    breakdown.stage = 35; // Already in conversation — highest momentum
  } else if (deal.deal_stage === "Prospecting") {
    breakdown.stage = 15; // Early stage — lower priority
  }
  score += breakdown.stage;

  // ── 2. Financial Potential (Max 40) ────────────────────────────────────────
  // Active deals have close_value='' in this dataset, so we use account revenue
  // as a proxy for deal potential. Thresholds calibrated to actual data:
  //   P25 ≈ $497  |  P50 ≈ $1,224  |  P75 ≈ $2,818  |  P90 ≈ $4,969  |  Max ≈ $11,698
  const revenue = accountInfo?.revenue ? parseFloat(accountInfo.revenue) : 0;
  const closeValue = deal.close_value ? parseFloat(deal.close_value) : 0;

  let finScore = 0;

  // If close_value is available (e.g. on won/historical deals), use it
  if (closeValue > 10000) finScore += 20;
  else if (closeValue > 1000) finScore += 10;
  else if (closeValue > 0) finScore += 5;

  // Account revenue proxy — calibrated to real distribution
  if (revenue > 5000) finScore += 40;
  else if (revenue > 2000) finScore += 30;
  else if (revenue > 800) finScore += 20;
  else if (revenue > 200) finScore += 10;
  else if (revenue > 0) finScore += 5;

  breakdown.financial = Math.min(finScore, 40);
  score += breakdown.financial;

  // ── 3. Recency / Time in Pipeline (Max 25) ─────────────────────────────────
  // Measures how recently the deal was engaged relative to the dataset's end.
  // Fresh deals (entered pipeline close to the reference date) are hotter.
  // Very old open deals are stale and lose urgency.
  let timeScore = 5; // default: no engage_date
  if (deal.engage_date) {
    const engageDate = new Date(deal.engage_date);
    const refDate = deal.close_date
      ? new Date(deal.close_date)
      : SCORE_REFERENCE_DATE;
    const diffDays = Math.max(
      0,
      Math.floor(
        (refDate.getTime() - engageDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    if (diffDays <= 30)
      timeScore = 25; // Very fresh
    else if (diffDays <= 90)
      timeScore = 20; // Recent
    else if (diffDays <= 150)
      timeScore = 15; // Moderate
    else timeScore = 5; // Stale
  }
  breakdown.time = timeScore;
  score += breakdown.time;

  // Cap at 99 — 100 is reserved for Won
  score = Math.min(score, 99);

  breakdown.explanation = `Deal prioritário no estágio ${deal.deal_stage} (+${breakdown.stage} pts), impulsionado pelo potencial do produto ${deal.product} e porte da conta ${deal.account} (+${breakdown.financial} pts), com engajamento recente no pipeline (+${breakdown.time} pts).`;
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
    score_breakdown: breakdown,
  };
}

// API Endpoints

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Server is running (TypeScript)",
    dataStats: {
      accountsCount: db.accounts.length,
      productsCount: db.products.length,
      salesTeamsCount: db.salesTeams.length,
      salesPipelineCount: db.salesPipeline.length,
    },
  });
});

app.get("/api/pipeline", (req: Request, res: Response) => {
  const { deal_stage, sales_agent, manager, regional_office, page, limit } =
    req.query;

  let results = db.salesPipeline.map(enrichDeal);

  if (deal_stage)
    results = results.filter((d) => d.deal_stage === (deal_stage as string));
  if (sales_agent)
    results = results.filter((d) => d.sales_agent === (sales_agent as string));
  if (manager)
    results = results.filter(
      (d) => d.team_details?.manager === (manager as string),
    );
  if (regional_office)
    results = results.filter(
      (d) => d.team_details?.regional_office === (regional_office as string),
    );

  // Sort by score descending
  results.sort((a, b) => (b.score || 0) - (a.score || 0));

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 50;
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;

  const paginatedResults = results.slice(startIndex, endIndex);

  res.json({
    count: results.length,
    data: paginatedResults,
    page: pageNum,
    totalPages: Math.ceil(results.length / limitNum),
  });
});

app.get("/api/stats", (req: Request, res: Response) => {
  const enriched = db.salesPipeline.map(enrichDeal);

  const totalDeals = enriched.length;
  const wonDeals = enriched.filter((d) => d.deal_stage === "Won").length;
  const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

  // Hot Deals = only ACTIVE (Engaging | Prospecting) deals with score > 75
  // Won/Lost are excluded: they are closed and no longer need prioritization
  const ACTIVE_STAGES = new Set(["Engaging", "Prospecting"]);
  const hotDealsCount = enriched.filter(
    (d) => ACTIVE_STAGES.has(d.deal_stage) && (d.score || 0) > 75,
  ).length;

  const totalPipelineValue = enriched.reduce((sum, d) => {
    const closeVal = parseFloat(d.close_value) || 0;
    if (closeVal > 0) return sum + closeVal;
    const prod = dbMaps.products.get(d.product);
    return sum + (prod ? parseFloat(prod.sales_price) || 0 : 0);
  }, 0);

  res.json({
    totalDeals,
    wonDeals,
    conversionRate: conversionRate.toFixed(2) + "%",
    hotDealsCount,
    totalPipelineValue,
  });
});

app.get("/api/deal/:id", (req: Request, res: Response) => {
  const deal = db.salesPipeline.find((d) => d.opportunity_id === req.params.id);
  if (!deal) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }

  res.json(enrichDeal(deal));
});

// Initialize server
const startServer = async () => {
  try {
    console.log("Loading CSV data...");
    await Promise.all([
      loadCSV<Account>("accounts.csv", db.accounts),
      loadCSV<Product>("products.csv", db.products),
      loadCSV<SalesTeam>("sales_teams.csv", db.salesTeams),
      loadCSV<PipelineItem>("sales_pipeline.csv", db.salesPipeline),
    ]);

    // Create indexing maps for fast O(1) lookups
    db.accounts.forEach((acc) => dbMaps.accounts.set(acc.account, acc));
    db.products.forEach((prod) => dbMaps.products.set(prod.product, prod));
    db.salesTeams.forEach((team) =>
      dbMaps.salesTeams.set(team.sales_agent, team),
    );

    console.log("CSV data loaded and indexed successfully!");

    app.listen(port, () => {
      console.log(`Server is running on port ${port} (TypeScript)`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();

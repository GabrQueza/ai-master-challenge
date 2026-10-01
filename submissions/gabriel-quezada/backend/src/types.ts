export interface Account {
  account: string;
  sector: string;
  year_established: string;
  revenue: string;
  employees: string;
}

export interface Product {
  product: string;
  series: string;
  sales_price: string;
}

export interface SalesTeam {
  sales_agent: string;
  manager: string;
  regional_office: string;
}

export interface ScoreBreakdown {
  stage: number;
  financial: number;
  time: number;
  explanation: string;
}

export interface PipelineItem {
  opportunity_id: string;
  sales_agent: string;
  product: string;
  account: string;
  deal_stage: string;
  engage_date: string;
  close_date: string;
  close_value: string;
  
  // Enriched fields
  account_details?: Account | null;
  product_details?: Product | null;
  team_details?: SalesTeam | null;
  score?: number;
  score_breakdown?: ScoreBreakdown;
}

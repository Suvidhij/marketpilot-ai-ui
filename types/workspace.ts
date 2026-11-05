export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}
export interface Client {
  id: number;
  company_name: string;
  website: string | null;
  industry: string;
  description: string;
  created_at: string;
}
export interface Metrics {
  impressions: number;
  clicks: number;
  conversions: number;
  lead_count: number;
  spend: number;
  revenue: number;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  cpl: number | null;
  roas: number | null;
}
export interface Context {
  client: Client;
  metrics: Metrics;
  lead_summary: {
    total: number;
    qualified: number;
    won: number;
    average_score: number | null;
  };
  content_summary: { total: number; drafts: number };
  limitations: string[];
}
export interface BusinessRecord {
  id: number;
  client_id: number;
  [key: string]: unknown;
}
export interface Report {
  id: number;
  client_id: number;
  report_name: string;
  report_type: string;
  report_data: Record<string, unknown>;
  created_at: string;
}
export interface Action {
  id: number;
  client_id: number;
  action: string;
  resource_id: number;
  payload: Record<string, unknown>;
  status: string;
  external_reference: string | null;
  created_at: string;
}

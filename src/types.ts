export interface Entity {
  id?: number;
  company_name: string;
  cin: string;
  pan: string;
  sector: string;
  turnover: number;
  loan_type: string;
  loan_amount: number;
  tenure: number;
  interest_rate: number;
}

export interface Document {
  id?: number;
  entity_id: number;
  filename: string;
  file_type: string;
  classification: string;
  extracted_data?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ExtractedSignals {
  revenue: number;
  debt_obligations: number;
  bank_inflow: number;
  gst_revenue: number;
  legal_notices: number;
  promoter_pledge: boolean;
  management_risk: string;
}

export interface ResearchAnalysis {
  promoter_risk: string;
  sector_risk: string;
  regulatory_risk: string;
  litigation_risk: string;
  macroeconomic_risk: string;
  external_risk_score: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PrimaryInsight {
  note: string;
  interpretation: string;
  risk_adjustment: string;
}

export interface CreditDecision {
  risk_score: number;
  decision: 'APPROVE' | 'APPROVE WITH CONDITIONS' | 'REJECT';
  recommended_amount: number;
  recommended_rate: number;
  explanation: string;
}

export interface CAMReport {
  borrower: string;
  loan_request: string;
  character: string;
  capacity: string;
  capital: string;
  collateral: string;
  conditions: string;
}

export interface CreditReport {
  entity_summary: Entity;
  financial_signals: ExtractedSignals;
  research_analysis: ResearchAnalysis;
  primary_insights: PrimaryInsight[];
  risk_score: number;
  financial_triangulation: string;
  reasoning: string;
  swot_analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  credit_decision: CreditDecision;
  cam_report: CAMReport;
}

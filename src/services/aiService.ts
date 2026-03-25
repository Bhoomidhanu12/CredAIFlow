import { GoogleGenAI, Type } from "@google/genai";
import { Entity, ExtractedSignals, ResearchAnalysis, CreditReport, PrimaryInsight, CreditDecision, CAMReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const classifyDocument = async (filename: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Classify this financial document based on its filename: "${filename}". 
    Choose from: "ALM", "Shareholding Pattern", "Borrowing Profile", "Annual Report", "Portfolio Performance".
    Return only the category name.`,
  });
  return response.text.trim();
};

export const extractSignals = async (docContent: string): Promise<ExtractedSignals> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract financial signals from this document text:
    ${docContent}
    
    Return JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          revenue: { type: Type.NUMBER },
          debt_obligations: { type: Type.NUMBER },
          bank_inflow: { type: Type.NUMBER },
          gst_revenue: { type: Type.NUMBER },
          legal_notices: { type: Type.NUMBER },
          promoter_pledge: { type: Type.BOOLEAN },
          management_risk: { type: Type.STRING },
        },
        required: ["revenue", "debt_obligations", "bank_inflow", "gst_revenue", "legal_notices", "promoter_pledge", "management_risk"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const performResearch = async (entity: Entity): Promise<ResearchAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Perform secondary research for the company: ${entity.company_name} in the ${entity.sector} sector.
    Analyze Promoter Risk, Sector Risk, Regulatory Risk, Litigation Risk, and Macroeconomic Risk.
    Use Google Search to find recent news, regulatory filings, or litigation history.
    Return JSON format.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          promoter_risk: { type: Type.STRING },
          sector_risk: { type: Type.STRING },
          regulatory_risk: { type: Type.STRING },
          litigation_risk: { type: Type.STRING },
          macroeconomic_risk: { type: Type.STRING },
          external_risk_score: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" },
        },
        required: ["promoter_risk", "sector_risk", "regulatory_risk", "litigation_risk", "macroeconomic_risk", "external_risk_score"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const interpretPrimaryInsight = async (note: string): Promise<PrimaryInsight> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As a Credit Analyst, interpret this qualitative observation: "${note}".
    Provide an interpretation and a risk adjustment.
    Return JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          note: { type: Type.STRING },
          interpretation: { type: Type.STRING },
          risk_adjustment: { type: Type.STRING },
        },
        required: ["note", "interpretation", "risk_adjustment"],
      },
    },
  });
  return JSON.parse(response.text);
};

export const generateFinalReport = async (
  entity: Entity,
  signals: ExtractedSignals,
  research: ResearchAnalysis,
  insights: PrimaryInsight[],
  riskScore: number
): Promise<CreditReport> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an AI-powered Digital Credit Manager. Perform a **Pre-Cognitive Secondary Analysis & Reporting** for the following entity.

---
COMPANY INFORMATION
Company Name: ${entity.company_name}
Sector: ${entity.sector}
Loan Request Amount: ₹${entity.loan_amount} Cr

FINANCIAL SIGNALS
GST Revenue: ₹${signals.gst_revenue}M
Bank Inflows: ₹${signals.bank_inflow}M
Legal Notices: ${signals.legal_notices}
Management Risk: ${signals.management_risk}
Promoter Pledge: ${signals.promoter_pledge ? 'Yes' : 'No'}

PRIMARY INSIGHTS (CREDIT OFFICER NOTES)
${insights.map(i => `- ${i.note}`).join('\n')}

RESEARCH CONTEXT
${JSON.stringify(research)}
---

TASK:
1. SECONDARY RESEARCH: Elaborate on the research findings. Show clearly what was researched (news, sentiment, regulatory, litigation).
2. TRIANGULATION: Cross-validate external signals with financial indicators (e.g., GST vs Bank Inflow).
3. PRIMARY INSIGHT INTEGRATION: Interpret the Credit Officer notes and their operational impact.
4. EXPLAINABLE REASONING: Provide a clear narrative of financial health and risk signals.
5. SWOT ANALYSIS: 3-4 points per category.
6. FINAL RECOMMENDATION: Decision, Amount, Rate, and Logic.

Return JSON format matching this schema:
{
  "financial_triangulation": "string",
  "reasoning": "string",
  "swot_analysis": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "credit_decision": {
    "risk_score": number,
    "decision": "APPROVE | APPROVE WITH CONDITIONS | REJECT",
    "recommended_amount": number,
    "recommended_rate": number,
    "explanation": "string"
  },
  "cam_report": {
    "borrower": "string",
    "loan_request": "string",
    "character": "string",
    "capacity": "string",
    "capital": "string",
    "collateral": "string",
    "conditions": "string"
  }
}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  
  const reportData = JSON.parse(response.text);
  return {
    entity_summary: entity,
    financial_signals: signals,
    research_analysis: research,
    primary_insights: insights,
    risk_score: reportData.credit_decision.risk_score,
    ...reportData,
  };
};

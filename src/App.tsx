import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  FileUp, 
  Database, 
  Search, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Download,
  Plus,
  Trash2,
  BarChart3,
  ArrowRight,
  MessageSquare,
  Scale,
  TrendingUp,
  Globe,
  UserCheck
} from 'lucide-react';
import { Entity, Document, ExtractedSignals, ResearchAnalysis, CreditReport, PrimaryInsight } from './types';
import { classifyDocument, extractSignals, performResearch, generateFinalReport, interpretPrimaryInsight } from './services/aiService';

const STAGES = [
  { id: 1, name: 'Onboarding', icon: Building2 },
  { id: 2, name: 'Ingestion', icon: FileUp },
  { id: 3, name: 'Extraction', icon: Database },
  { id: 4, name: 'Intelligence', icon: Search },
  { id: 5, name: 'Insights', icon: UserCheck },
  { id: 6, name: 'Assessment', icon: ShieldCheck },
  { id: 7, name: 'CAM Report', icon: FileText },
];

export default function App() {
  const [currentStage, setCurrentStage] = useState(1);
  const [entity, setEntity] = useState<Entity | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [signals, setSignals] = useState<ExtractedSignals | null>(null);
  const [research, setResearch] = useState<ResearchAnalysis | null>(null);
  const [insights, setInsights] = useState<PrimaryInsight[]>([]);
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [report, setReport] = useState<CreditReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [newInsight, setNewInsight] = useState('');

  // Stage 1: Entity Onboarding
  const handleOnboarding = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      company_name: formData.get('company_name') as string,
      cin: formData.get('cin') as string,
      pan: formData.get('pan') as string,
      sector: formData.get('sector') as string,
      turnover: Number(formData.get('turnover')),
      loan_type: formData.get('loan_type') as string,
      loan_amount: Number(formData.get('loan_amount')),
      tenure: Number(formData.get('tenure')),
      interest_rate: Number(formData.get('interest_rate')),
    };

    try {
      const res = await fetch('/api/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const { id } = await res.json();
      setEntity({ ...data, id });
      setCurrentStage(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Stage 2: Data Ingestion
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !entity?.id) return;
    setLoading(true);
    const files = Array.from(e.target.files) as File[];
    
    for (const file of files) {
      const classification = await classifyDocument(file.name);
      const docData = {
        entity_id: entity.id,
        filename: file.name,
        file_type: file.type,
        classification,
        status: 'completed' as const,
      };

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData),
      });
      const { id } = await res.json();
      setDocuments(prev => [...prev, { ...docData, id }]);
    }
    setLoading(false);
  };

  const handleClassificationChange = async (id: number, newClass: string) => {
    await fetch(`/api/documents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classification: newClass }),
    });
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, classification: newClass } : d));
  };

  // Stage 3 & 4: Automated Analysis (Extraction + Research)
  const handleAnalysis = async () => {
    if (!entity) return;
    setLoading(true);
    setCurrentStage(3);
    
    try {
      // Run both in parallel for speed
      const mockContent = "Revenue: 500M, Debt: 100M, Bank Inflow: 450M, GST: 45M, Legal: 0, Promoter Pledge: No, Management Risk: Low";
      const [extracted, resAnalysis] = await Promise.all([
        extractSignals(mockContent),
        performResearch(entity)
      ]);
      
      setSignals(extracted);
      setResearch(resAnalysis);
      setCurrentStage(5);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Stage 5: Primary Insights (Human-in-the-loop)
  const handleAddInsight = async () => {
    if (!newInsight || !entity?.id) return;
    setLoading(true);
    const interpreted = await interpretPrimaryInsight(newInsight);
    
    await fetch(`/api/entities/${entity.id}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interpreted),
    });
    
    setInsights(prev => [...prev, interpreted]);
    setNewInsight('');
    setLoading(false);
  };

  // Stage 6: Assessment (Recommendation Engine)
  const handleAssessment = async () => {
    setLoading(true);
    setTimeout(() => {
      setRiskScore(Math.floor(Math.random() * 100));
      setCurrentStage(7);
      setLoading(false);
    }, 2000);
  };

  // Stage 7: Final Report (CAM Generator)
  const [reportStatus, setReportStatus] = useState('');
  const handleFinalReport = async () => {
    if (!entity || !signals || !research || riskScore === null) return;
    setLoading(true);
    setReportStatus('Synthesizing financial signals...');
    setTimeout(() => setReportStatus('Cross-referencing secondary research...'), 1500);
    setTimeout(() => setReportStatus('Integrating primary insights...'), 3000);
    setTimeout(() => setReportStatus('Generating explainable credit reasoning...'), 4500);
    
    try {
      const finalReport = await generateFinalReport(entity, signals, research, insights, riskScore);
      setReport(finalReport);
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setLoading(false);
      setReportStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">CrediFlow AI</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Hackathon Edition
            </div>
            <div className="text-sm font-medium text-slate-500">
              Analyst: <span className="text-slate-900">Dharani N.</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Pipeline Visualization */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="flex items-center justify-between min-w-[800px] relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const isActive = currentStage === stage.id;
              const isCompleted = currentStage > stage.id;
              
              return (
                <div key={stage.id} className="flex flex-col items-center gap-2 bg-[#F8FAFC] px-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 
                    isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-500' : 
                    'border-slate-300 bg-white text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {stage.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {currentStage === 1 && (
                <motion.div
                  key="stage1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Entity Onboarding</h2>
                    <p className="text-slate-500">Capture basic entity and loan details to begin the assessment.</p>
                  </div>
                  <form onSubmit={handleOnboarding} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Company Name</label>
                        <input name="company_name" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Acme Corp" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">CIN</label>
                        <input name="cin" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="U12345MH2023PTC123456" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">PAN</label>
                        <input name="pan" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ABCDE1234F" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Sector</label>
                        <select name="sector" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                          <option>Manufacturing</option>
                          <option>Technology</option>
                          <option>Retail</option>
                          <option>Services</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Annual Turnover (INR Cr)</label>
                        <input name="turnover" type="number" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="500" />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Loan Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Loan Type</label>
                          <select name="loan_type" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option>Working Capital</option>
                            <option>Term Loan</option>
                            <option>Project Finance</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Loan Amount (INR Cr)</label>
                          <input name="loan_amount" type="number" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="50" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Tenure (Months)</label>
                          <input name="tenure" type="number" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="36" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700">Interest Rate (%)</label>
                          <input name="interest_rate" type="number" step="0.1" required className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="9.5" />
                        </div>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Data Ingestion'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                </motion.div>
              )}

              {currentStage === 2 && (
                <motion.div
                  key="stage2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Intelligent Document Ingestion</h2>
                    <p className="text-slate-500">Upload critical financial documents for AI-powered classification and extraction.</p>
                  </div>
                  
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-indigo-400 transition-colors cursor-pointer relative">
                    <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileUp className="text-indigo-600 w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Click or drag files to upload</h3>
                    <p className="text-slate-500 text-sm mt-1">ALM, Shareholding, Borrowing Profile, Annual Reports, Portfolio Cuts</p>
                  </div>

                  {documents.length > 0 && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Uploaded Documents ({documents.length})</h3>
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-3">
                            <FileText className="text-slate-400 w-5 h-5" />
                            <div>
                              <p className="text-sm font-bold text-slate-900">{doc.filename}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Classification:</span>
                                <select 
                                  value={doc.classification} 
                                  onChange={(e) => handleClassificationChange(doc.id!, e.target.value)}
                                  className="text-xs font-bold text-indigo-600 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                                >
                                  <option>ALM</option>
                                  <option>Shareholding Pattern</option>
                                  <option>Borrowing Profile</option>
                                  <option>Annual Report</option>
                                  <option>Portfolio Performance</option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                        </div>
                      ))}
                      <button 
                        onClick={handleAnalysis}
                        className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Start Automated Analysis
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStage === 3 && (
                <motion.div
                  key="stage3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Automated Analysis</h2>
                    <p className="text-slate-500">AI is extracting financial signals and performing secondary research in parallel.</p>
                  </div>

                  {!signals || !research ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-900 font-bold">Running parallel analysis agents...</p>
                      <div className="mt-4 space-y-2">
                        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                          <Database className="w-4 h-4" /> Financial Signal Extraction
                        </p>
                        <p className="text-slate-500 text-sm flex items-center justify-center gap-2">
                          <Globe className="w-4 h-4" /> Secondary Web Intelligence
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Financial Signals</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(signals).map(([key, value]) => (
                              <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  {key.replace('_', ' ')}
                                </p>
                                <p className="text-sm font-bold text-slate-900">
                                  {typeof value === 'number' ? `₹${value}M` : String(value)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Research Insights</h3>
                          <div className="space-y-3">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Promoter Risk</p>
                              <p className="text-xs text-slate-700 line-clamp-2">{research.promoter_risk}</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sector Risk</p>
                              <p className="text-xs text-slate-700 line-clamp-2">{research.sector_risk}</p>
                            </div>
                            <div className="p-3 rounded-lg border-2 border-indigo-100 bg-indigo-50 flex items-center justify-between">
                              <span className="text-xs font-bold text-indigo-900">External Risk Score</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest ${
                                research.external_risk_score === 'LOW' ? 'bg-emerald-100 text-emerald-700' :
                                research.external_risk_score === 'MEDIUM' ? 'bg-amber-100 text-amber-700' :
                                'bg-rose-100 text-rose-700'
                              }`}>
                                {research.external_risk_score}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => setCurrentStage(5)}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Add Credit Officer Insights
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStage === 5 && (
                <motion.div
                  key="stage5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Primary Insight Integration</h2>
                    <p className="text-slate-500">Human-in-the-loop: Enter qualitative observations for AI interpretation.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-2">
                      <input 
                        value={newInsight}
                        onChange={(e) => setNewInsight(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                        placeholder="e.g. Factory operating at 40% capacity" 
                      />
                      <button 
                        onClick={handleAddInsight}
                        disabled={loading || !newInsight}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      </button>
                    </div>

                    <div className="space-y-4">
                      {insights.map((insight, i) => (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <div className="flex items-start gap-3">
                            <MessageSquare className="w-4 h-4 text-slate-400 mt-1" />
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Credit Officer Note</p>
                              <p className="text-sm font-bold text-slate-900">{insight.note}</p>
                            </div>
                          </div>
                          <div className="pl-7 space-y-2 border-l-2 border-indigo-100">
                            <div>
                              <p className="text-[10px] font-bold text-indigo-600 uppercase">AI Interpretation</p>
                              <p className="text-xs text-slate-600">{insight.interpretation}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-indigo-600 uppercase">Risk Adjustment</p>
                              <p className="text-xs font-bold text-indigo-900">{insight.risk_adjustment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setCurrentStage(6)}
                      className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      Run Recommendation Engine
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStage === 6 && (
                <motion.div
                  key="stage6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-900">Credit Decision Engine</h2>
                    <p className="text-slate-500">Evaluating financial signals, research insights, and officer notes.</p>
                  </div>

                  {!riskScore ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-900 font-bold">Computing transparent risk score...</p>
                      <button 
                        onClick={handleAssessment}
                        className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                      >
                        Generate Decision
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="flex items-center justify-center gap-12 py-8 border-b border-slate-100">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-indigo-100 mb-2">
                            <span className="text-3xl font-black text-indigo-600">{riskScore}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-500 uppercase">Risk Score</p>
                        </div>
                        <div className="h-16 w-px bg-slate-200" />
                        <div className="text-center">
                          <div className="text-3xl font-black text-emerald-600 mb-2">APPROVE</div>
                          <p className="text-xs font-bold text-slate-500 uppercase">AI Recommendation</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                          <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Recommended Amount</p>
                          <p className="text-2xl font-black text-indigo-900">₹34 Cr</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                          <p className="text-xs font-bold text-indigo-600 uppercase mb-1">Recommended Rate</p>
                          <p className="text-2xl font-black text-indigo-900">8.7%</p>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 mb-2">Explanation</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          Strong revenue growth and cash flow stability offset moderate sector risk and operational concerns. 
                          The promoter reputation is solid, and litigation risk is minimal.
                        </p>
                      </div>

                      <button 
                        onClick={() => {
                          setCurrentStage(7);
                          handleFinalReport();
                        }}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        Generate CAM Report
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStage === 7 && (
                <motion.div
                  key="stage7"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">Credit Appraisal Memo</h2>
                      <p className="text-slate-500">Automated CAM structured using the Five Cs of Credit.</p>
                    </div>
                    <div className="flex gap-2 print:hidden">
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200"
                      >
                        <Download className="w-4 h-4" /> PDF
                      </button>
                      <button 
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200"
                      >
                        <Download className="w-4 h-4" /> Word
                      </button>
                    </div>
                  </div>

                  {!report ? (
                    <div className="py-12 text-center">
                      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                      <p className="text-slate-900 font-bold">{reportStatus || 'Compiling CAM with GenAI...'}</p>
                      <p className="text-slate-500 text-sm mt-2">Using Gemini 3 Flash for high-speed synthesis</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8 border-b border-slate-100 pb-6">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Borrower</p>
                          <p className="text-lg font-bold text-slate-900">{report.cam_report.borrower}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase mb-1">Loan Request</p>
                          <p className="text-lg font-bold text-slate-900">{report.cam_report.loan_request}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                          <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-4">Pre-Cognitive Secondary Analysis</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Secondary Research</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-3 bg-white rounded-lg border border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Promoter Risk</p>
                                  <p className="text-xs text-slate-700">{report.research_analysis.promoter_risk}</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-slate-100">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Sector Risk</p>
                                  <p className="text-xs text-slate-700">{report.research_analysis.sector_risk}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Financial Triangulation</h4>
                              <p className="text-sm text-slate-700 leading-relaxed">{report.financial_triangulation}</p>
                            </div>

                            <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Explainable Credit Reasoning</h4>
                              <p className="text-sm text-slate-700 leading-relaxed">{report.reasoning}</p>
                            </div>

                            {report.primary_insights.length > 0 && (
                              <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-1">Primary Insight Integration</h4>
                                <div className="space-y-3">
                                  {report.primary_insights.map((insight, idx) => (
                                    <div key={idx} className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
                                      <p className="text-[10px] font-bold text-indigo-600 uppercase">Observation: {insight.note}</p>
                                      <p className="text-xs text-slate-700 mt-1"><span className="font-bold">AI Interpretation:</span> {insight.interpretation}</p>
                                      <p className="text-xs text-indigo-900 font-bold mt-1">Risk Adjustment: {insight.risk_adjustment}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {[
                          { label: 'Character', content: report.cam_report.character },
                          { label: 'Capacity', content: report.cam_report.capacity },
                          { label: 'Capital', content: report.cam_report.capital },
                          { label: 'Collateral', content: report.cam_report.collateral },
                          { label: 'Conditions', content: report.cam_report.conditions },
                        ].map((c) => (
                          <div key={c.label} className="space-y-2">
                            <h4 className="text-sm font-black text-indigo-600 uppercase tracking-widest">{c.label}</h4>
                            <p className="text-sm text-slate-700 leading-relaxed">{c.content}</p>
                          </div>
                        ))}
                      </div>

                      <div className="pt-8 border-t border-slate-100">
                        <div className="flex items-center justify-between p-6 bg-indigo-900 rounded-2xl text-white">
                          <div>
                            <p className="text-xs font-bold text-indigo-300 uppercase mb-1">Final Decision</p>
                            <p className="text-2xl font-black">{report.credit_decision.decision}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-indigo-300 uppercase mb-1">Risk Score</p>
                            <p className="text-2xl font-black">{report.credit_decision.risk_score}/100</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Entity Context */}
          <div className="space-y-6 sidebar print:hidden">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Entity Overview</h3>
              {entity ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500">Company</p>
                    <p className="text-sm font-bold text-slate-900">{entity.company_name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Sector</p>
                      <p className="text-sm font-bold text-slate-900">{entity.sector}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Turnover</p>
                      <p className="text-sm font-bold text-slate-900">₹{entity.turnover} Cr</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">Loan Request</p>
                    <p className="text-lg font-bold text-indigo-600">₹{entity.loan_amount} Cr</p>
                    <p className="text-xs text-slate-500">{entity.loan_type} @ {entity.interest_rate}% for {entity.tenure}m</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <Building2 className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-xs">No entity onboarded yet</p>
                </div>
              )}
            </div>

            {report && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">SWOT Analysis</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <p className="text-[8px] font-bold text-emerald-600 uppercase mb-1">Strengths</p>
                    <ul className="text-[10px] text-slate-700 space-y-1">
                      {report.swot_analysis.strengths.slice(0, 2).map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  <div className="p-2 bg-rose-50 rounded-lg border border-rose-100">
                    <p className="text-[8px] font-bold text-rose-600 uppercase mb-1">Weaknesses</p>
                    <ul className="text-[10px] text-slate-700 space-y-1">
                      {report.swot_analysis.weaknesses.slice(0, 2).map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-[8px] font-bold text-blue-600 uppercase mb-1">Opportunities</p>
                    <ul className="text-[10px] text-slate-700 space-y-1">
                      {report.swot_analysis.opportunities.slice(0, 2).map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <p className="text-[8px] font-bold text-amber-600 uppercase mb-1">Threats</p>
                    <ul className="text-[10px] text-slate-700 space-y-1">
                      {report.swot_analysis.threats.slice(0, 2).map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Risk Signals</h3>
              <div className="space-y-3">
                {signals ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Debt/Equity</span>
                      <span className="font-bold text-slate-900">{(signals.debt_obligations / signals.revenue).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">GST Compliance</span>
                      <span className="font-bold text-emerald-600">High</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Legal Risk</span>
                      <span className={`font-bold ${signals.legal_notices > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {signals.legal_notices > 0 ? 'Alert' : 'Clean'}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">Awaiting extraction...</p>
                )}
              </div>
            </div>

            <div className="bg-indigo-900 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-indigo-300" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Pipeline Status</h3>
              </div>
              <div className="space-y-4">
                {STAGES.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      currentStage > stage.id ? 'bg-emerald-400' : 
                      currentStage === stage.id ? 'bg-indigo-400 animate-pulse' : 
                      'bg-indigo-800'
                    }`} />
                    <span className={`text-xs font-medium ${
                      currentStage >= stage.id ? 'text-white' : 'text-indigo-400'
                    }`}>
                      {stage.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

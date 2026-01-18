
import React, { useState } from 'react';
import { analyzeDermImage } from '../services/geminiService';

interface DermVueModuleProps {
  onCaseAdded: (caseData: any) => void;
  patientId: string;
}

const DermVueModule: React.FC<DermVueModuleProps> = ({ onCaseAdded, patientId }) => {
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const res = await analyzeDermImage(image, symptoms, duration, patientId);
      setResult(res);
      onCaseAdded(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatInlineRaw = (text: string) => text
    .replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-bold">$1</b>')
    .replace(/\*(.*?)\*/g, '<i class="text-blue-300 font-medium">$1</i>')
    .replace(/(🩺|🔬|⚠️|📋|💊|🏥|💡|📍|📄|🧬)/g, '<span class="mr-1 inline-block">$1</span>');

  const renderClinicalMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-3" />;
      if (trimmed === '---' || trimmed === '***') return <hr key={i} className="border-slate-700/50 my-4" />;

      const hMatch = trimmed.match(/^(#{1,3}) (.+)/);
      if (hMatch) {
        const level = hMatch[1].length;
        const classes = level === 1 ? "text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2 flex items-center gap-2" :
          level === 2 ? "text-base font-bold text-blue-400 mt-4 mb-2 flex items-center gap-2" :
            "text-sm font-semibold text-slate-300 mt-3 mb-1 flex items-center gap-2";
        return <div key={i} className={classes} dangerouslySetInnerHTML={{ __html: formatInlineRaw(hMatch[2]) }} />;
      }

      if (trimmed.startsWith('> ')) {
        return <blockquote key={i} className="border-l-2 border-primary pl-4 my-3 italic text-slate-400 text-sm leading-relaxed">{formatInlineRaw(trimmed.replace('> ', ''))}</blockquote>;
      }

      const listMatch = trimmed.match(/^[*•-] /);
      if (listMatch) {
        return (
          <div key={i} className="flex gap-2 text-slate-300 ml-4 mb-1 leading-relaxed text-sm">
            <span className="text-primary mt-1.5 w-1 h-1 rounded-full bg-primary block shrink-0"></span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineRaw(trimmed.replace(/^[*•-] /, '')) }} />
          </div>
        );
      }

      return <p key={i} className="text-slate-400 text-sm mb-2 leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: formatInlineRaw(trimmed) }} />;
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-[calc(100vh-6rem)]">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Dermatological Assessment</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">AI Triage & SOAP Protocol</p>
          </div>
        </div>
        {result && (
          <button className="btn-primary text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Note
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full pb-20">
        <div className="space-y-6 flex flex-col">
          <div className="bg-card backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 space-y-6 shadow-sm">
            <div
              className="aspect-[4/3] rounded-xl bg-slate-950 overflow-hidden flex flex-col items-center justify-center cursor-pointer border border-dashed border-slate-700 hover:border-primary/50 hover:bg-slate-900 transition-all group relative"
              onClick={() => document.getElementById('derm-upload')?.click()}
            >
              {image ? (
                <img src={image} alt="Clinical Asset" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-3 border border-slate-800 group-hover:border-primary/50 transition-colors shadow-sm">
                    <svg className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Image</p>
                  <p className="text-[10px] text-slate-600 mt-1 font-mono">Macro / Dermatoscopy</p>
                </div>
              )}
              <input id="derm-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Anamnesis</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="input-field h-20 resize-none"
                  placeholder="Patient description of symptoms..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-field"
                  placeholder="e.g., 2 weeks, increasing size"
                />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || !image}
              className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${loading || !image ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'btn-primary shadow-lg shadow-blue-500/20'}`}
            >
              {loading ? 'Processing...' : 'Run Triage Analysis'}
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full overflow-hidden">
          <div className="bg-card backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl flex flex-col h-full overflow-hidden">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center mb-4 border border-slate-800">
                  <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Analysis Queue Empty</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col justify-center items-center space-y-6">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-3 w-full max-w-xs">
                  <div className="h-1 w-full bg-slate-800 rounded-full animate-pulse"></div>
                  <div className="h-1 w-4/5 bg-slate-800 rounded-full animate-pulse mx-auto"></div>
                  <div className="h-1 w-2/3 bg-slate-800 rounded-full animate-pulse mx-auto"></div>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Consulting Medical Vision Core</p>
              </div>
            )}

            {result && !loading && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col h-full">
                <header className="flex justify-between items-start p-6 border-b border-slate-800 bg-slate-900/30">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Assessment</p>
                    <h3 className="text-xl font-bold text-white tracking-tight">{result.assessment}</h3>
                  </div>
                  <div className={`px-3 py-1 rounded border text-[10px] font-bold uppercase tracking-widest ${result.riskTier?.toLowerCase().includes('low') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    result.riskTier?.toLowerCase().includes('mod') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                    {result.riskTier} RISK
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  <div className="space-y-6">
                    <div>
                      {renderClinicalMarkdown(result.soapNote)}
                    </div>

                    {result.explanation && (
                      <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Rationale</p>
                        <p className="text-xs text-slate-400 leading-relaxed">{result.explanation}</p>
                      </div>
                    )}

                    {result.nextSteps && (
                      <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Directive</p>
                        </div>
                        <p className="text-slate-300 font-medium text-xs leading-relaxed">{result.nextSteps}</p>
                      </div>
                    )}
                  </div>
                </div>

                <footer className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">MV</div>
                    <span className="text-[10px] text-slate-500 font-medium">Vision-Derm Model v2.4</span>
                  </div>
                </footer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DermVueModule;

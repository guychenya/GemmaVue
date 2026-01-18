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
    .replace(/(🩺|🔬|⚠️|📋|💊|🏥|💡|📍|📄|🧬)/g, '<span class="mr-1">$1</span>');

  const renderClinicalMarkdown = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-4" />;
      if (trimmed === '---' || trimmed === '***') return <hr key={i} className="border-slate-800 my-6" />;

      const hMatch = trimmed.match(/^(#{1,3}) (.+)/);
      if (hMatch) {
        const level = hMatch[1].length;
        const classes = level === 1 ? "text-xl font-bold text-white mb-4 border-b border-slate-800 pb-2 flex items-center gap-2" :
          level === 2 ? "text-lg font-bold text-blue-400 mt-6 mb-2 flex items-center gap-2" :
            "text-base font-semibold text-slate-200 mt-4 mb-1 flex items-center gap-2";
        return <div key={i} className={classes} dangerouslySetInnerHTML={{ __html: formatInlineRaw(hMatch[2]) }} />;
      }

      if (trimmed.startsWith('> ')) {
        return <blockquote key={i} className="border-l-2 border-slate-700 pl-4 my-4 italic text-slate-500 text-sm leading-relaxed">{formatInlineRaw(trimmed.replace('> ', ''))}</blockquote>;
      }

      const listMatch = trimmed.match(/^[*•-] /);
      if (listMatch) {
        return (
          <div key={i} className="flex gap-3 text-slate-300 ml-4 mb-2 leading-relaxed">
            <span className="text-blue-500 mt-1">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineRaw(trimmed.replace(/^[*•-] /, '')) }} />
          </div>
        );
      }

      return <p key={i} className="text-slate-400 text-sm mb-3 leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: formatInlineRaw(trimmed) }} />;
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Dermatological Assessment</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1 font-bold">AI Triage & SOAP Protocol</p>
        </div>
        {result && (
          <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-800 hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Case Note
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <div
            className="aspect-[4/3] rounded-[40px] bg-slate-900/40 overflow-hidden flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group relative shadow-2xl"
            onClick={() => document.getElementById('derm-upload')?.click()}
          >
            {image ? (
              <img src={image} alt="Clinical Asset" className="w-full h-full object-cover rounded-[32px]" />
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-800 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Load Clinical Image</p>
                <p className="text-[9px] text-slate-600 mt-2 font-mono">Dermatoscope / Macro Focus</p>
              </div>
            )}
            <input id="derm-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="bg-slate-900/20 border border-slate-800/60 rounded-[32px] p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Anamnesis / Symptoms</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 h-24 transition-all"
                placeholder="Describe evolution, sensations, or clinical flags..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Clinical Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="Time since onset"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading || !image}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${loading || !image ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-[0.98]'}`}
            >
              {loading ? 'Analyzing Clinical Patterns...' : 'Run MedGemma Triage'}
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full min-h-[500px]">
          <div className="glass rounded-[40px] p-10 flex-1 border-slate-800/60 shadow-2xl overflow-y-auto">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-800">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">Diagnostic Queue</p>
                <p className="text-[10px] text-slate-600 mt-2">Ready for pattern recognition</p>
              </div>
            )}

            {loading && (
              <div className="h-full flex flex-col justify-center items-center space-y-6">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="space-y-3 w-full">
                  <div className="h-2 w-full bg-slate-800 rounded-full animate-pulse"></div>
                  <div className="h-2 w-4/5 bg-slate-800 rounded-full animate-pulse mx-auto"></div>
                  <div className="h-2 w-2/3 bg-slate-800 rounded-full animate-pulse mx-auto"></div>
                </div>
                <p className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">Consulting Medical Vision Core</p>
              </div>
            )}

            {result && !loading && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <header className="flex justify-between items-start mb-8 pb-6 border-b border-slate-900">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Primary Evaluation</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{result.assessment}</h3>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${result.riskTier?.toLowerCase().includes('low') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      result.riskTier?.toLowerCase().includes('mod') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10'
                    }`}>
                    {result.riskTier} RISK
                  </div>
                </header>

                <div className="space-y-2">
                  {renderClinicalMarkdown(result.soapNote)}

                  {result.explanation && (
                    <div className="mt-8 p-6 bg-slate-900/40 rounded-3xl border border-slate-800/60">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Diagnostic Explanation</p>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">{result.explanation}</p>
                    </div>
                  )}

                  {result.nextSteps && (
                    <div className="mt-6 p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Clinical Directive</p>
                      </div>
                      <p className="text-slate-200 font-semibold text-sm leading-relaxed">{result.nextSteps}</p>
                    </div>
                  )}
                </div>

                <footer className="mt-12 pt-6 border-t border-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-blue-500 text-[10px] font-bold border border-slate-800">MV</div>
                  <div>
                    <p className="text-[9px] text-slate-500 italic">Verified via MedGemma Vision-Derm Engine</p>
                    <p className="text-[8px] text-slate-700 uppercase font-black tracking-tighter">Diagnostic Class: Clinical Decision Support</p>
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

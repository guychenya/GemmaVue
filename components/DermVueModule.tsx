
import React, { useState } from 'react';
import { analyzeDermImage } from '../services/geminiService';

interface DermVueModuleProps {
  onCaseAdded: (caseData: any) => void;
}

const DermVueModule: React.FC<DermVueModuleProps> = ({ onCaseAdded }) => {
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
      const res = await analyzeDermImage(image, symptoms, duration);
      setResult(res);
      onCaseAdded(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white">Dermatology Assessment</h2>
          <p className="text-slate-500 text-sm mt-1">AI-assisted triage and SOAP note generation</p>
        </div>
        {result && (
          <button className="px-6 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export Clinical Summary
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div 
            className="aspect-[4/3] rounded-[40px] glass overflow-hidden flex flex-col items-center justify-center cursor-pointer border-dashed border-2 border-slate-800 hover:border-blue-500/30 transition-all group relative"
            onClick={() => document.getElementById('derm-upload')?.click()}
          >
            {image ? (
              <img src={image} alt="Lesion" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-[28px] flex items-center justify-center mx-auto mb-6 border border-slate-800 group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <p className="text-slate-400 font-medium">Capture or Load Clinical Asset</p>
                <p className="text-xs text-slate-600 mt-2">Dermatoscopic or Macro image</p>
              </div>
            )}
            <input id="derm-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="glass rounded-[32px] p-8 space-y-8 shadow-2xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clinical History / Symptoms</label>
              <textarea 
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-[24px] px-6 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 h-32 transition-all" 
                placeholder="Patient reports itching, intermittent bleeding, or color change..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration</label>
              <input 
                type="text" 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-[18px] px-6 py-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all" 
                placeholder="E.g. 6 months, stable or progressive"
              />
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={loading || !image}
              className={`w-full py-5 rounded-[24px] font-bold text-sm uppercase tracking-widest transition-all shadow-xl ${loading || !image ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'}`}
            >
              {loading ? 'Consulting MedGemma...' : 'Execute Triage Sequence'}
            </button>
          </div>
        </div>

        <div className="space-y-6 flex flex-col h-full">
          <div className="glass rounded-[40px] p-10 flex-1 border-slate-800/60 shadow-inner flex flex-col">
            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30">
                 <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.337a4 4 0 01-2.58.344l-2.091-.418a2 2 0 01-1.256-3.085l1.392-2.322a4 4 0 00.178-3.441l-1.055-2.73a2 2 0 00-3.136-1.022L2.147 5.15a2 2 0 00-.36 2.503l3.11 4.666a4 4 0 003.328 1.882h3.11a2 2 0 011.664.89l.812 1.22A2 2 0 0015.53 18h2.336a2 2 0 001.901-1.366l.337-1.055a2 2 0 00-.676-2.151z"/></svg>
                 </div>
                 <p className="text-lg font-medium">Awaiting Data Signature</p>
                 <p className="text-sm">Submit patient context to generate triage report</p>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col justify-center space-y-10">
                 <div className="space-y-4">
                   <div className="h-3 w-4/5 bg-slate-800 rounded-full loading-shimmer"></div>
                   <div className="h-3 w-3/5 bg-slate-800 rounded-full loading-shimmer"></div>
                   <div className="h-3 w-2/3 bg-slate-800 rounded-full loading-shimmer"></div>
                 </div>
                 <p className="text-sm font-semibold text-blue-400 text-center animate-pulse tracking-widest uppercase">Initializing Vision Core...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 overflow-y-auto">
                <header className="flex justify-between items-start pb-6 border-b border-slate-800/60">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Diagnostic Assessment</p>
                    <h3 className="text-3xl font-semibold text-white tracking-tight">{result.assessment}</h3>
                  </div>
                  <div className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl border ${
                    result.riskTier === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    result.riskTier === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10'
                  }`}>
                    {result.riskTier} RISK
                  </div>
                </header>

                <div className="space-y-8">
                  <section className="bg-slate-900/30 p-8 rounded-[32px] border border-slate-800/60">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Clinical Reasoning</p>
                    <p className="text-base text-slate-300 leading-relaxed font-light">
                      {result.explanation}
                    </p>
                  </section>
                  
                  <div className="p-8 bg-blue-600/5 border border-blue-600/20 rounded-[32px]">
                    <div className="flex items-center gap-3 mb-4">
                       <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                       <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Triage Directive</p>
                    </div>
                    <p className="text-slate-200 font-semibold text-lg leading-snug">{result.nextSteps}</p>
                  </div>

                  <section className="space-y-4 p-8 border border-slate-800 rounded-[32px]">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Physician SOAP Note (Draft)</p>
                     <div className="font-mono text-xs text-slate-400 leading-loose whitespace-pre-wrap bg-black/20 p-4 rounded-xl">
                        {result.soapNote}
                     </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DermVueModule;

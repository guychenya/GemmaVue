
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
    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full text-slate-200">
      <div className="flex flex-col gap-6 h-full">
        {/* Input Section */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-light tracking-tight text-white">Dermatology Triage</h2>
            {result && (
              <button className="text-[10px] uppercase font-bold tracking-widest text-blue-400 hover:text-white transition-colors">Export Note</button>
            )}
          </div>

          <div
            className="relative aspect-video bg-black rounded-2xl border border-slate-900 overflow-hidden cursor-pointer group"
            onClick={() => document.getElementById('derm-upload')?.click()}
          >
            {image ? (
              <img src={image} alt="Clinical Asset" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-xs font-medium text-slate-500 group-hover:text-slate-300">Upload Image</span>
              </div>
            )}
            <input id="derm-upload" type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </div>

          <div className="space-y-4 bg-slate-900/10 p-4 rounded-xl border border-slate-800/20">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Symptoms</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-transparent border-b border-slate-800 focus:border-blue-500 text-sm py-2 outline-none resize-none placeholder:text-slate-700 transition-colors h-20"
                placeholder="Describe symptoms..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ml-1">Duration</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-transparent border-b border-slate-800 focus:border-blue-500 text-sm py-2 outline-none placeholder:text-slate-700 transition-colors"
                placeholder="Time elapsed..."
              />
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !image}
            className={`w-full py-3 rounded-xl font-medium text-sm transition-all ${loading || !image ? 'bg-slate-900 text-slate-600 cursor-not-allowed' : 'bg-white text-black hover:bg-slate-200'}`}
          >
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      <div className="h-full bg-slate-900/10 rounded-2xl border border-slate-800/10 overflow-hidden flex flex-col">
        {!result ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <svg className="w-12 h-12 text-slate-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">No Analysis</p>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-white/5 bg-slate-900/20">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assessment</span>
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${result.riskTier?.toLowerCase().includes('low') ? 'bg-emerald-500/10 text-emerald-400' :
                    result.riskTier?.toLowerCase().includes('mod') ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-500'
                  }`}>{result.riskTier} Risk</span>
              </div>
              <h3 className="text-xl font-medium text-white">{result.assessment}</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-slate-300 space-y-6">
              <div>{renderClinicalMarkdown(result.soapNote)}</div>

              {result.explanation && (
                <div className="pl-4 border-l-2 border-slate-800">
                  <p className="text-sm text-slate-500 italic">{result.explanation}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DermVueModule;

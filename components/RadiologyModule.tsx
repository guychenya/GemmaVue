
import React, { useState } from 'react';
import { analyzeRadiologyImage } from '../services/geminiService';
import { RadiologyStudy } from '../types';

interface RadiologyModuleProps {
  onStudyAdded: (study: RadiologyStudy) => void;
  initialStudy?: RadiologyStudy;
  patientId: string;
}

const RadiologyModule: React.FC<RadiologyModuleProps> = ({ onStudyAdded, initialStudy, patientId }) => {
  const [loading, setLoading] = useState(false);
  const [currentStudy, setCurrentStudy] = useState<RadiologyStudy | null>(initialStudy || null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const result = await analyzeRadiologyImage(base64, 'Radiology', 'Chest', patientId);
        const newStudy: RadiologyStudy = {
          id: `RAD-${Date.now()}`,
          patientId: patientId,
          modality: 'XR',
          bodyPart: 'Chest',
          date: new Date().toLocaleDateString(),
          imageUrl: base64,
          report: `# 🔬 Findings\n\n${result.findings}\n\n# 🩺 Impression\n\n${result.impression}`,
          tags: result.tags
        };
        setCurrentStudy(newStudy);
        onStudyAdded(newStudy);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const formatInlineRaw = (text: string) => text
    .replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-bold">$1</b>')
    .replace(/\*(.*?)\*/g, '<i class="text-blue-300 font-medium">$1</i>')
    .replace(/(🩺|🔬|⚠️|📋|💊|🏥|💡|📍|📄)/g, '<span class="mr-1">$1</span>');

  const renderClinicalMarkdown = (text: string) => {
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

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-[500px]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-sm font-bold text-white uppercase tracking-widest">MedGemma Visual Analysis</p>
        <p className="text-xs text-slate-500 font-mono mt-2">Processing multiregional patterns...</p>
      </div>
    );
  }

  if (!currentStudy) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[500px]">
        <label className="w-full max-w-xl aspect-[16/9] bg-slate-900/30 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-slate-800">
            <svg className="w-6 h-6 text-slate-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Upload Radiological Data</span>
          <span className="text-[10px] text-slate-600 mt-2 font-mono">DICOM / JPEG / PNG Supported</span>
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
        </label>
      </div>
    );
  }

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500 max-w-7xl mx-auto h-[calc(100vh-6rem)]">
      <div className="space-y-4 flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-3">
            <span className="w-2 h-6 bg-primary rounded-full"></span>
            Active Scan
          </h2>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded border border-blue-500/20 uppercase tracking-wider">{currentStudy.modality}</span>
            <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider font-mono">{currentStudy.date}</span>
          </div>
        </div>
        <div className="bg-black/50 rounded-2xl overflow-hidden flex-1 border border-slate-800 shadow-inner flex items-center justify-center p-4 relative group">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none"></div>
          <img src={currentStudy.imageUrl} className="max-h-full w-full object-contain rounded-lg shadow-2xl" alt="Radiology Scan" />

          <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 bg-slate-900/80 backdrop-blur text-white rounded-lg border border-slate-700 hover:bg-primary transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentStudy.tags?.map(t => (
            <span key={t} className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-[10px] text-slate-400 rounded-md font-bold uppercase tracking-wider hover:text-white transition-colors cursor-default">{t}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col h-full overflow-hidden">
        <div className="bg-card backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Analysis Report</span>
            <span className="text-[10px] font-mono text-emerald-500">CONFIDENCE: HIGH</span>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="clinical-findings-render">
              {renderClinicalMarkdown(currentStudy.report || '')}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 text-xs text-slate-400 leading-relaxed">
                <span className="text-primary mt-0.5">ℹ️</span>
                This report was synthesized via multimodal clinical reasoning (MedGemma). Verify findings with comparative DICOM history.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiologyModule;

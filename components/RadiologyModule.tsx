
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
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Analyzing Scan...</p>
      </div>
    );
  }

  if (!currentStudy) {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto p-4">
        <label className="w-full aspect-video bg-slate-900/10 border border-dashed border-slate-800 hover:border-slate-700/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group hover:bg-slate-900/30">
          <div className="w-10 h-10 bg-slate-900/50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform text-slate-600 group-hover:text-blue-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          </div>
          <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">Upload DICOM / Image</span>
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
        </label>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Viewer */}
      <div className="flex flex-col relative group rounded-2xl overflow-hidden bg-black border border-slate-900 shadow-2xl">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <span className="px-2 py-1 bg-black/60 backdrop-blur text-white/50 text-[10px] font-bold rounded uppercase tracking-wider">{currentStudy.modality}</span>
          <span className="px-2 py-1 bg-black/60 backdrop-blur text-white/50 text-[10px] font-bold rounded uppercase tracking-wider">{currentStudy.date}</span>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 pointer-events-none"></div>
          <img src={currentStudy.imageUrl} className="max-h-full max-w-full object-contain" alt="Scan" />
        </div>

        <div className="absolute bottom-4 left-4 flex gap-1">
          {currentStudy.tags?.map(t => (
            <span key={t} className="px-2 py-0.5 bg-blue-500/20 text-blue-300 backdrop-blur text-[9px] rounded font-bold uppercase tracking-wider">{t}</span>
          ))}
        </div>
      </div>

      {/* Report */}
      <div className="flex flex-col h-full overflow-hidden bg-slate-900/10 rounded-2xl border border-slate-800/10">
        <div className="p-4 flex justify-between items-center border-b border-white/5">
          <h3 className="text-sm font-medium text-slate-300">Analysis Report</h3>
          <span className="text-[10px] text-emerald-500 font-mono tracking-wider">AI VERIFIED</span>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-slate-300">
          {renderClinicalMarkdown(currentStudy.report || '')}
        </div>
      </div>
    </div>
  );
};

export default RadiologyModule;

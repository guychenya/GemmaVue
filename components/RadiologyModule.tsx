
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

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-[500px]">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
        <p className="text-base font-medium text-white">MedGemma Visual Analysis...</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">Processing multiregional patterns</p>
      </div>
    );
  }

  if (!currentStudy) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[500px]">
        <label className="w-full max-w-xl aspect-[16/9] bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl border border-slate-800">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Upload Radiological Data</span>
          <span className="text-[10px] text-slate-600 mt-2">Supports XR, CT, MRI Formats</span>
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
        </label>
      </div>
    );
  }

  return (
    <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Active Scan</h2>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-black rounded border border-blue-500/20 uppercase tracking-tighter">{currentStudy.modality}</span>
            <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-black rounded uppercase tracking-tighter">{currentStudy.date}</span>
          </div>
        </div>
        <div className="bg-black rounded-[40px] overflow-hidden aspect-square border border-slate-800 shadow-2xl flex items-center justify-center p-2">
          <img src={currentStudy.imageUrl} className="max-h-full w-full object-contain rounded-[32px]" alt="Radiology Scan" />
        </div>
        <div className="flex flex-wrap gap-2 pt-4">
          {currentStudy.tags?.map(t => (
            <span key={t} className="px-3 py-1 bg-slate-900/80 border border-slate-800 text-[9px] text-slate-500 rounded-lg font-bold uppercase tracking-wider">{t}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col h-full">
        <div className="flex-1 glass rounded-[40px] p-10 border-slate-800/60 shadow-2xl overflow-y-auto">
          <div className="clinical-findings-render">
            {renderClinicalMarkdown(currentStudy.report || '')}
          </div>

          <div className="mt-12 pt-6 border-t border-slate-900">
            <div className="flex items-center gap-3 p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60 italic text-[11px] text-slate-500 leading-relaxed">
              <span className="text-blue-500">ℹ️</span>
              This report was synthesized via multimodal clinical reasoning and serves as primary screening support. Verify findings with comparative DICOM history.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiologyModule;

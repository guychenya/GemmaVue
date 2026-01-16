
import React, { useState } from 'react';
import { analyzeRadiologyImage } from '../services/geminiService';
import { RadiologyStudy } from '../types';

interface RadiologyModuleProps {
  onStudyAdded: (study: RadiologyStudy) => void;
  initialStudy?: RadiologyStudy;
}

const RadiologyModule: React.FC<RadiologyModuleProps> = ({ onStudyAdded, initialStudy }) => {
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
        const result = await analyzeRadiologyImage(base64, 'Radiology', 'Chest');
        const newStudy: RadiologyStudy = {
          id: `RAD-${Date.now()}`,
          patientId: 'P123',
          modality: 'XR',
          bodyPart: 'Chest',
          date: new Date().toLocaleDateString(),
          imageUrl: base64,
          report: result.findings + "\n\n" + result.impression,
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

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-[500px]">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6"></div>
        <p className="text-lg font-medium text-white">Synthesizing Imagery...</p>
        <p className="text-xs text-slate-500 mt-2">MedGemma vision engine is processing DICOM layers</p>
      </div>
    );
  }

  if (!currentStudy) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[500px]">
        <label className="w-full max-w-lg aspect-[16/9] border-2 border-dashed border-slate-800 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
          </div>
          <span className="text-sm font-medium text-slate-300">Upload Radiology Image</span>
          <span className="text-[10px] text-slate-600 mt-2">DICOM, PNG, or JPEG supported</span>
          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
        </label>
      </div>
    );
  }

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold text-white">Diagnostic Image</h2>
          <span className="text-[10px] font-bold text-slate-500 uppercase">{currentStudy.modality} Analysis</span>
        </div>
        <div className="bg-black rounded-3xl overflow-hidden aspect-square border border-slate-800 flex items-center justify-center">
          <img src={currentStudy.imageUrl} className="max-h-full object-contain" alt="Scan" />
        </div>
      </div>
      <div className="space-y-6">
        <div className="glass rounded-3xl p-6 border-slate-800 min-h-[400px]">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-6">Clinical Findings</h3>
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-light">
            {currentStudy.report}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {currentStudy.tags?.map(t => (
            <span key={t} className="px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] text-slate-500 rounded-full font-bold uppercase">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RadiologyModule;

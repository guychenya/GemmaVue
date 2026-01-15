
import React, { useState } from 'react';
import { analyzeRadiologyImage } from '../services/geminiService';
import { RadiologyStudy } from '../types';

interface RadiologyModuleProps {
  onStudyAdded: (study: RadiologyStudy) => void;
  initialStudy?: RadiologyStudy;
}

const RadiologyModule: React.FC<RadiologyModuleProps> = ({ onStudyAdded, initialStudy }) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'pro' | 'layman' | 'history'>('pro');
  const [physicianNote, setPhysicianNote] = useState('');
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
          id: `RAD-${Math.floor(Math.random()*10000)}`,
          patientId: 'P123',
          modality: 'XR',
          bodyPart: 'Chest',
          date: new Date().toLocaleDateString(),
          imageUrl: base64,
          report: `INDICATION: ${result.indication}\n\nFINDINGS:\n${result.findings}\n\nIMPRESSION:\n${result.impression}\n\nFOLLOW-UP:\n${result.followUp}`,
          laymanReport: result.layman_summary,
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

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-white">Radiology Station</h2>
          <p className="text-slate-500 text-sm mt-1">Multi-modal vision engine for diagnostic support</p>
        </div>
        <div className="flex gap-4">
          <label className="group flex items-center gap-3 bg-white text-slate-950 px-5 py-2.5 rounded-xl font-semibold cursor-pointer transition-all hover:bg-slate-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Import DICOM/Image
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
          </label>
        </div>
      </div>

      {loading ? (
        <div className="glass rounded-[32px] h-[600px] flex flex-col items-center justify-center space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-xl font-medium text-slate-200">Reasoning in progress...</p>
            <p className="text-sm text-slate-500">MedGemma-3-Pro is analyzing pixel-level density patterns</p>
          </div>
        </div>
      ) : currentStudy ? (
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 xl:col-span-7 space-y-6">
            <div className="glass rounded-[32px] overflow-hidden p-2 accent-glow bg-black/40">
              <div className="bg-black rounded-[28px] aspect-square flex items-center justify-center relative group">
                <img src={currentStudy.imageUrl} alt="Study" className="max-h-full object-contain" />
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 hover:bg-white/20">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                   </button>
                </div>
                <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                   {currentStudy.tags?.map(tag => (
                     <span key={tag} className="px-3 py-1 bg-blue-600/80 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                       {tag}
                     </span>
                   ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 xl:col-span-5 flex flex-col space-y-6">
            <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800/60 shadow-xl">
              {['pro', 'layman', 'history'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setView(t as any)}
                  className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${view === t ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t === 'pro' ? 'Clinical' : t === 'layman' ? 'Patient' : 'History'}
                </button>
              ))}
            </div>
            
            <div className="glass flex-1 rounded-[32px] p-8 overflow-y-auto max-h-[650px] shadow-2xl">
              {view === 'pro' && (
                <div className="space-y-6">
                  <header className="mb-6 border-b border-slate-800/60 pb-6">
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">AI Findings Profile</p>
                    <h3 className="text-2xl font-semibold text-white">Diagnostic Summary</h3>
                  </header>
                  <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-normal">
                    {currentStudy.report?.split('\n\n').map((para, i) => (
                      <div key={i} className={para.startsWith('IMPRESSION') ? 'p-6 bg-blue-600/5 border border-blue-600/10 rounded-3xl text-slate-200' : ''}>
                        <p>{para}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 pt-6 border-t border-slate-800/60">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Physician Addendum</label>
                    <textarea 
                      value={physicianNote}
                      onChange={(e) => setPhysicianNote(e.target.value)}
                      placeholder="Add manual clinical observations..."
                      className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-blue-500 outline-none h-32"
                    />
                  </div>
                </div>
              )}

              {view === 'layman' && (
                <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
                  <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px] shadow-inner">
                    <div className="flex gap-4 mb-4">
                      <span className="text-3xl">💡</span>
                      <h4 className="text-lg font-semibold text-emerald-400">Plain Language View</h4>
                    </div>
                    <p className="text-base text-slate-200 leading-relaxed italic font-light">
                      "{currentStudy.laymanReport}"
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-6 border border-slate-800/60 rounded-3xl">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-2">Next Steps</p>
                      <p className="text-sm text-slate-300">A follow-up consult with your GP is recommended within 48 hours to discuss these results in context of your clinical history.</p>
                    </div>
                  </div>
                </div>
              )}

              {view === 'history' && (
                <div className="flex flex-col items-center justify-center h-full opacity-40">
                  <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p className="text-sm font-medium">No previous scans found for this patient.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass rounded-[40px] h-[600px] border-dashed border-2 border-slate-800 flex flex-col items-center justify-center group hover:border-blue-500/40 transition-all cursor-pointer">
           <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-600/10 transition-all">
             <svg className="w-10 h-10 text-slate-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
           </div>
           <p className="text-slate-300 font-medium text-lg">Initialize Analysis Pipeline</p>
           <p className="text-sm text-slate-600 mt-2">Upload medical imagery to begin automated clinical reasoning</p>
        </div>
      )}
    </div>
  );
};

export default RadiologyModule;

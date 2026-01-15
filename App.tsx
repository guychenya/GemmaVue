
import React, { useState, useEffect } from 'react';
import { ModuleType, PatientProfile, RadiologyStudy, DermCase } from './types';
import Sidebar from './components/Sidebar';
import RadiologyModule from './components/RadiologyModule';
import DocumentsModule from './components/DocumentsModule';
import DermVueModule from './components/DermVueModule';
import { performGlobalSearch } from './services/geminiService';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.RADIOLOGY);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string | null>(null);
  
  // Shared Clinical State
  const [activePatient] = useState<PatientProfile>({
    id: 'P123',
    name: 'Alexander Thompson',
    age: 58,
    gender: 'Male'
  });
  const [studies, setStudies] = useState<RadiologyStudy[]>([]);
  const [dermCases, setDermCases] = useState<any[]>([]);

  const handleQuickSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    setSearchResults(null);
    try {
      const context = {
        patient: activePatient,
        radiology: studies.map(s => s.report),
        dermatology: dermCases.map(d => d.assessment)
      };
      const result = await performGlobalSearch(searchQuery, context);
      setSearchResults(result || "No relevant data found in session.");
    } catch (err) {
      console.error(err);
      setSearchResults("Search engine error. Check API configuration.");
    } finally {
      setIsSearching(false);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case ModuleType.RADIOLOGY: 
        return <RadiologyModule onStudyAdded={(s) => setStudies([...studies, s])} initialStudy={studies[studies.length-1]} />;
      case ModuleType.DOCUMENTS: 
        return <DocumentsModule />;
      case ModuleType.DERMVUE: 
        return <DermVueModule onCaseAdded={(c) => setDermCases([...dermCases, c])} />;
      case ModuleType.SETTINGS:
        return (
          <div className="p-10 max-w-4xl animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold mb-8 text-white">Workstation Configuration</h2>
            <div className="grid gap-6">
              <div className="glass p-8 rounded-3xl border-slate-800/60 bg-slate-900/20">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/60">
                   <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Medical Engine Status</h3>
                   <span className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[10px] font-bold text-emerald-500 uppercase">MedGemma Native</span>
                   </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Vision Reasoning', model: 'Gemini 3 Pro Vision', latency: '210ms' },
                    { label: 'Linguistic Analysis', model: 'Gemini 3 Flash', latency: '45ms' },
                    { label: 'Data Sovereignty', model: 'Air-Gapped Sandbox', latency: 'Local' }
                  ].map((sys, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-400">{sys.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] bg-slate-800 px-2 py-1 rounded text-blue-400">{sys.model}</span>
                        <span className="font-mono text-[10px] text-slate-600">{sys.latency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        activePatient={activePatient}
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/5 via-slate-950 to-slate-950">
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-800/40 bg-slate-950/80 backdrop-blur-3xl z-40">
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleQuickSearch} className="relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask MedGemma anything about this patient... (e.g. 'Summarize all clinical findings')"
                className="w-full bg-slate-900/40 border border-slate-800/60 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </form>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
               <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clinician Authenticated</span>
               </div>
               <span className="text-[9px] text-slate-600 font-mono mt-1">SESSION_ID: GX-992-1</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-500 text-xs shadow-inner">
                AT
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {searchResults && (
            <div className="m-8 p-10 glass rounded-[32px] border-blue-500/20 bg-blue-600/5 animate-in slide-in-from-top-6 duration-700 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">MedGemma Clinical Synthesis</h4>
                  </div>
                  <button onClick={() => setSearchResults(null)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
               </div>
               <div className="prose prose-invert max-w-none">
                 <p className="text-lg text-slate-200 leading-relaxed font-light">{searchResults}</p>
               </div>
               <div className="mt-8 pt-6 border-t border-slate-800/60 flex gap-4">
                 <button className="text-[10px] font-bold text-slate-500 uppercase hover:text-white transition-colors">Copy to clipboard</button>
                 <button className="text-[10px] font-bold text-slate-500 uppercase hover:text-white transition-colors">Add to Clinical Note</button>
               </div>
            </div>
          )}
          {renderModule()}
        </div>
      </main>
    </div>
  );
};

export default App;

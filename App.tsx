
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
      setSearchResults("### ⚠️ Search Engine Error\nUnable to reach MedGemma vision core. Please verify API configuration.");
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
              <div className="glass p-8 rounded-3xl border-slate-800/60 bg-slate-900/20 shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/60">
                   <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Medical Engine Status</h3>
                   <span className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     <span className="text-[10px] font-bold text-emerald-500 uppercase">MedGemma Native Enabled</span>
                   </span>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Clinical Vision Engine', model: 'Gemini 3 Pro', status: 'Verified' },
                    { label: 'Semantic Reasoner', model: 'Gemini 3 Flash', status: 'Active' },
                    { label: 'Report Synthesizer', model: 'MedGemma-Custom', status: 'Operational' }
                  ].map((sys, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                      <span className="text-sm text-slate-400">{sys.label}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-[10px] bg-slate-800 px-2 py-1 rounded text-blue-400 border border-slate-700">{sys.model}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{sys.status}</span>
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
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950">
        <header className="h-20 flex items-center justify-between px-10 border-b border-slate-800/40 bg-slate-950/80 backdrop-blur-3xl z-40 shadow-sm">
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleQuickSearch} className="relative group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask MedGemma (e.g. 'Generate a comprehensive patient history summary')"
                className="w-full bg-slate-900/40 border border-slate-800/60 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-slate-900/80 transition-all placeholder:text-slate-600"
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
                 <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MedGemma Verification: ON</span>
               </div>
               <span className="text-[9px] text-slate-600 font-mono mt-0.5 tracking-tighter uppercase">Local-First Compliance Active</span>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-200">{activePatient.name}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Patient Context</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center font-bold text-blue-500 text-xs shadow-xl">
                {activePatient.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {searchResults && (
            <div className="m-8 animate-in slide-in-from-top-10 duration-700">
               <div className="glass rounded-[32px] border-blue-500/20 bg-slate-900/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] overflow-hidden">
                 <div className="flex justify-between items-center px-10 py-5 border-b border-slate-800/60 bg-blue-600/5">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-blue-500 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      </div>
                      <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">MedGemma Clinical Synthesis</h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="text-[10px] font-bold text-slate-400 hover:text-white uppercase transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                        Export
                      </button>
                      <button onClick={() => setSearchResults(null)} className="text-slate-500 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                 </div>
                 
                 <div className="p-10 whitespace-pre-wrap">
                   {/* 
                     Rendering simplified Markdown structure manually for clinical clarity 
                     In a real app, a library like react-markdown would be used. 
                   */}
                   <div className="clinical-report-content space-y-6">
                     {searchResults.split('\n').map((line, i) => {
                       if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4">{line.replace('# ', '')}</h1>;
                       if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-blue-400 mt-10 mb-4 flex items-center gap-2">{line.replace('## ', '')}</h2>;
                       if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-slate-200 mt-6 mb-2">{line.replace('### ', '')}</h3>;
                       if (line.startsWith('* ') || line.startsWith('- ')) return <div key={i} className="flex gap-3 text-slate-300 ml-4 mb-2"><span className="text-blue-500 mt-1">•</span><span>{line.substring(2)}</span></div>;
                       if (line.trim() === '') return <div key={i} className="h-4" />;
                       return <p key={i} className="text-slate-300 leading-relaxed text-base">{line}</p>;
                     })}
                   </div>
                 </div>

                 <div className="bg-slate-900/60 p-6 border-t border-slate-800/60 flex justify-between items-center">
                    <p className="text-[10px] text-slate-500 italic font-medium">
                      MedGemma Verification ID: CDSS-ALPHA-SYNC-PRO-001 | Local-First Contextual Reasoning
                    </p>
                    <div className="flex gap-4">
                      <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Append to Patient EMR</button>
                    </div>
                 </div>
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

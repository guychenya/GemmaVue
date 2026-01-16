
import React, { useState } from 'react';
import { ModuleType, PatientProfile, RadiologyStudy } from './types';
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
    try {
      const context = {
        patient: activePatient,
        radiology: studies.map(s => s.report),
        dermatology: dermCases.map(d => d.assessment)
      };
      const result = await performGlobalSearch(searchQuery, context);
      setSearchResults(result || "No relevant data found.");
    } catch (err) {
      setSearchResults("# ⚠️ Error\nAnalysis engine offline.");
    } finally {
      setIsSearching(false);
    }
  };

  const renderClinicalReport = (text: string) => {
    return text.split('\n').map((line, i) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-4" />;
      if (trimmed === '---' || trimmed === '***') return <hr key={i} className="border-slate-800 my-6" />;
      
      const hMatch = trimmed.match(/^(#{1,3}) (.+)/);
      if (hMatch) {
        const level = hMatch[1].length;
        const classes = level === 1 ? "text-2xl font-bold text-white mb-4 border-b border-slate-800 pb-2" : 
                        level === 2 ? "text-lg font-bold text-blue-400 mt-6 mb-2" : 
                        "text-base font-semibold text-slate-200 mt-4 mb-1";
        return <div key={i} className={classes} dangerouslySetInnerHTML={{ __html: formatInlineRaw(hMatch[2]) }} />;
      }

      if (trimmed.startsWith('> ')) {
        return <blockquote key={i} className="border-l-2 border-slate-700 pl-4 my-4 italic text-slate-500 text-sm">{formatInline(trimmed.replace('> ', ''))}</blockquote>;
      }

      const listMatch = trimmed.match(/^[*•-] /);
      if (listMatch) {
        return (
          <div key={i} className="flex gap-3 text-slate-300 ml-4 mb-1">
            <span className="text-blue-500">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineRaw(trimmed.replace(/^[*•-] /, '')) }} />
          </div>
        );
      }

      return <p key={i} className="text-slate-400 text-sm mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineRaw(trimmed) }} />;
    });
  };

  const formatInline = (text: string) => <span dangerouslySetInnerHTML={{ __html: formatInlineRaw(text) }} />;
  const formatInlineRaw = (text: string) => text
    .replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>')
    .replace(/\*(.*?)\*/g, '<i class="text-blue-300">$1</i>')
    .replace(/(🩺|🔬|⚠️|📋|💊|🏥|💡|📍|📄)/g, '<span class="mr-1">$1</span>');

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} activePatient={activePatient} />
      
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950 relative">
        {/* Top Header - Fixed height to prevent jumps */}
        <header className="h-16 flex-none flex items-center justify-between px-8 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl z-30">
          <form onSubmit={handleQuickSearch} className="flex-1 max-w-xl relative">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask anything about this patient..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs focus:ring-1 focus:ring-blue-500/50 outline-none transition-all"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
          </form>

          <div className="flex items-center gap-4 ml-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-white leading-none">{activePatient.name}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter mt-1">ID: {activePatient.id}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-blue-400">
              {activePatient.name[0]}
            </div>
          </div>
        </header>

        {/* Main Workspace - Scrollable */}
        <main className="flex-1 overflow-y-auto relative bg-slate-950">
          <div className="max-w-6xl mx-auto w-full">
            {activeModule === ModuleType.RADIOLOGY && <RadiologyModule onStudyAdded={(s) => setStudies([...studies, s])} initialStudy={studies[studies.length-1]} />}
            {activeModule === ModuleType.DOCUMENTS && <DocumentsModule />}
            {activeModule === ModuleType.DERMVUE && <DermVueModule onCaseAdded={(c) => setDermCases([...dermCases, c])} />}
            {activeModule === ModuleType.SETTINGS && (
               <div className="p-10 text-center text-slate-500 text-sm">System configuration active. MedGemma engine v3.1.0</div>
            )}
          </div>
        </main>

        {/* Search Overlay - Prevents Layout Jump */}
        {searchResults && (
          <div className="absolute inset-0 z-40 flex items-start justify-center pt-20 px-8 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl glass rounded-3xl shadow-2xl border-blue-500/20 max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">MedGemma Analysis Result</span>
                <button onClick={() => setSearchResults(null)} className="p-1 hover:bg-slate-800 rounded-md transition-colors">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                {renderClinicalReport(searchResults)}
              </div>
              <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex justify-end">
                 <button onClick={() => setSearchResults(null)} className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase rounded-lg">Close Report</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

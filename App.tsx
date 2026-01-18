import React, { useState } from 'react';
import { ModuleType, PatientProfile, RadiologyStudy } from './types';
import Sidebar from './components/Sidebar';
import RadiologyModule from './components/RadiologyModule';
import DocumentsModule from './components/DocumentsModule';
import DermVueModule from './components/DermVueModule';
import { performGlobalSearch } from './services/geminiService';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
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
      if (trimmed === '---' || trimmed === '***') return <hr key={i} className="border-slate-700/50 my-4" />;

      const hMatch = trimmed.match(/^(#{1,3}) (.+)/);
      if (hMatch) {
        const level = hMatch[1].length;
        const classes = level === 1 ? "text-lg font-bold text-white mb-3 border-b border-slate-700 pb-2" :
          level === 2 ? "text-base font-bold text-blue-400 mt-4 mb-2" :
            "text-sm font-semibold text-slate-300 mt-3 mb-1";
        return <div key={i} className={classes} dangerouslySetInnerHTML={{ __html: formatInlineRaw(hMatch[2]) }} />;
      }

      if (trimmed.startsWith('> ')) {
        return <blockquote key={i} className="border-l-2 border-primary pl-4 my-3 italic text-slate-400 text-sm">{formatInlineRaw(trimmed.replace('> ', ''))}</blockquote>;
      }

      const listMatch = trimmed.match(/^[*•-] /);
      if (listMatch) {
        return (
          <div key={i} className="flex gap-2 text-slate-300 ml-4 mb-1 text-sm">
            <span className="text-primary">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineRaw(trimmed.replace(/^[*•-] /, '')) }} />
          </div>
        );
      }

      return <p key={i} className="text-slate-400 text-sm mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInlineRaw(trimmed) }} />;
    });
  };

  const formatInlineRaw = (text: string) => text
    .replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-medium">$1</b>')
    .replace(/\*(.*?)\*/g, '<i class="text-blue-300">$1</i>')
    .replace(/(🩺|🔬|⚠️|📋|💊|🏥|💡|📍|📄)/g, '<span class="mr-1 text-slate-400 inline-block scale-90">$1</span>');

  const renderDashboard = () => (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Clinical Workstation</h2>
          <p className="text-slate-500 text-sm mt-1">MedGemma Intelligence Core v3.1 • System Online</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-500">DB: CONNECTED</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card backdrop-blur-sm p-6 rounded-xl border border-slate-800 space-y-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-primary border border-blue-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Patient</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{activePatient.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-1">ID: {activePatient.id} • {activePatient.age}Y • {activePatient.gender}</p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-500/20">No Contraindications</span>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm p-6 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors group cursor-pointer" onClick={() => setActiveModule(ModuleType.RADIOLOGY)}>
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Radiology</p>
            <svg className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-white tracking-tight">{studies.length}</div>
            <div className="text-xs text-slate-500 font-medium">Studies Available</div>
          </div>
        </div>

        <div className="bg-card backdrop-blur-sm p-6 rounded-xl border border-slate-800 flex flex-col justify-between shadow-sm hover:border-slate-700 transition-colors group cursor-pointer" onClick={() => setActiveModule(ModuleType.DERMVUE)}>
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dermatology</p>
            <svg className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </div>
          <div>
            <div className="text-3xl font-bold text-white tracking-tight">{dermCases.length}</div>
            <div className="text-xs text-slate-500 font-medium">Cases Analyzed</div>
          </div>
        </div>
      </div>

      <section className="space-y-4 pt-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Diagnostic Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { id: ModuleType.RADIOLOGY, title: 'Radiology Analysis', desc: 'Auto-detection of pulmonary and skeletal pathologies.', icon: '🔬' },
            { id: ModuleType.DOCUMENTS, title: 'Clinical Records', desc: 'Semantic search across patient history and labs.', icon: '📄' },
            { id: ModuleType.DERMVUE, title: 'Dermatology Triage', desc: 'Vision-based lesion risk assessment.', icon: '🩺' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl text-left hover:border-primary/50 hover:bg-slate-800/60 transition-all group"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{item.title}</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed pl-[42px]">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex h-screen bg-canvas text-slate-200 font-sans overflow-hidden selection:bg-primary/30 selection:text-white">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} activePatient={activePatient} />

      <div className="flex-1 flex flex-col min-w-0 bg-canvas relative">
        <header className="h-16 flex-none flex items-center justify-between px-6 border-b border-slate-800 bg-canvas/80 backdrop-blur-md z-30">
          <form onSubmit={handleQuickSearch} className="flex-1 max-w-lg relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient data (e.g., 'Latest chest X-ray findings')"
              className="input-field pl-10 h-10"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
          </form>

          <div className="flex items-center gap-4 ml-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white leading-none">{activePatient.name}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">{activePatient.id}</p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-primary">
              {activePatient.name[0]}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative bg-canvas custom-scrollbar">
          <div className="w-full h-full">
            {activeModule === ModuleType.DASHBOARD && renderDashboard()}
            {activeModule === ModuleType.RADIOLOGY && <RadiologyModule onStudyAdded={(s) => setStudies([...studies, s])} initialStudy={studies[studies.length - 1]} patientId={activePatient.id} />}
            {activeModule === ModuleType.DOCUMENTS && <DocumentsModule />}
            {activeModule === ModuleType.DERMVUE && <DermVueModule onCaseAdded={(c) => setDermCases([...dermCases, c])} patientId={activePatient.id} />}
            {activeModule === ModuleType.SETTINGS && (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm font-mono">System Configuration Locked • Admin Access Required</div>
            )}
          </div>
        </main>

        {searchResults && (
          <div className="absolute inset-0 z-50 flex items-start justify-center pt-24 px-8 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-card border border-slate-700 rounded-xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  MedGemma Intelligence
                </span>
                <button onClick={() => setSearchResults(null)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar bg-canvas/50">
                {renderClinicalReport(searchResults)}
              </div>
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end">
                <button onClick={() => setSearchResults(null)} className="btn-primary text-xs uppercase tracking-wider">Close Analysis</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

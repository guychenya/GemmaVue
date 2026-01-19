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
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-light text-white tracking-tight">Good morning, Dr. Reviewer</h2>
          <p className="text-slate-500 mt-2 font-light">Your clinical workstation is ready.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500">System Online</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Status - Hero Style */}
        <div className="lg:col-span-2 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <div className="relative bg-card rounded-2xl p-8 border border-slate-800/50 hover:border-slate-700/50 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2 block">Active Patient</span>
                <h3 className="text-4xl font-semibold text-white tracking-tight">{activePatient.name}</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono text-slate-400">{activePatient.id}</div>
                <div className="text-sm text-slate-500">{activePatient.gender}, {activePatient.age} Years</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/50">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</div>
                <div className="text-emerald-400 font-medium">Stable</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Last Visit</div>
                <div className="text-slate-300">Oct 24, 2025</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Insurance</div>
                <div className="text-slate-300">BlueCross / H204</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats / Actions */}
        <div className="space-y-4">
          <div onClick={() => setActiveModule(ModuleType.RADIOLOGY)} className="group cursor-pointer bg-card hover:bg-slate-800/50 p-6 rounded-2xl border border-slate-800/50 transition-all">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Radiology</span>
              <span className="text-slate-600 group-hover:text-blue-400 transition-colors">↗</span>
            </div>
            <div className="text-3xl font-light text-white">{studies.length} <span className="text-sm text-slate-500 ml-1">Studies</span></div>
          </div>

          <div onClick={() => setActiveModule(ModuleType.DERMVUE)} className="group cursor-pointer bg-card hover:bg-slate-800/50 p-6 rounded-2xl border border-slate-800/50 transition-all">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Dermatology</span>
              <span className="text-slate-600 group-hover:text-blue-400 transition-colors">↗</span>
            </div>
            <div className="text-3xl font-light text-white">{dermCases.length} <span className="text-sm text-slate-500 ml-1">Cases</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { id: ModuleType.RADIOLOGY, title: 'Radiology Analysis', desc: 'Pulmonary & skeletal pathology detection.', icon: 'M9 5l7 7-7 7' }, // Simple placeholder icon path usage
          { id: ModuleType.DOCUMENTS, title: 'Clinical Records', desc: 'Semantic history & lab search.', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          { id: ModuleType.DERMVUE, title: 'Dermatology Triage', desc: 'Vision-based lesion assessment.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className="group text-left p-6 rounded-2xl bg-slate-900/20 hover:bg-slate-900/40 border border-transparent hover:border-slate-800 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-blue-600 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={item.icon} /></svg>
              </div>
              <h4 className="text-base font-medium text-slate-300 group-hover:text-white transition-colors">{item.title}</h4>
            </div>
            <p className="text-sm text-slate-500 pl-[56px] font-light">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-canvas text-slate-200 font-sans overflow-hidden selection:bg-blue-500/30 selection:text-blue-200">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} activePatient={activePatient} />

      <div className="flex-1 flex flex-col min-w-0 bg-canvas relative">
        <header className="h-16 flex-none flex items-center justify-between px-8 z-30 pt-6">
          <form onSubmit={handleQuickSearch} className="flex-1 max-w-sm relative group">
            <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find something..."
              className="w-full bg-slate-900/30 border border-transparent focus:border-slate-800 hover:border-slate-800/50 rounded-xl px-4 py-2 text-sm text-slate-300 focus:text-white outline-none transition-all placeholder:text-slate-600 pl-10 h-10 relative z-10"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors z-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin z-20"></div>}
          </form>

          <div className="flex items-center gap-4 ml-6">
            {/* Header Actions - Minimal */}
            <button className="w-8 h-8 rounded-full hover:bg-slate-800/50 flex items-center justify-center text-slate-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative bg-canvas custom-scrollbar p-6">
          <div className="w-full h-full max-w-7xl mx-auto rounded-3xl bg-slate-900/20 ring-1 ring-white/5 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="h-full overflow-y-auto custom-scrollbar">
              {activeModule === ModuleType.DASHBOARD && renderDashboard()}
              {activeModule === ModuleType.RADIOLOGY && <RadiologyModule onStudyAdded={(s) => setStudies([...studies, s])} initialStudy={studies[studies.length - 1]} patientId={activePatient.id} />}
              {activeModule === ModuleType.DOCUMENTS && <DocumentsModule />}
              {activeModule === ModuleType.DERMVUE && <DermVueModule onCaseAdded={(c) => setDermCases([...dermCases, c])} patientId={activePatient.id} />}
            </div>
          </div>
        </main>

        {searchResults && (
          <div className="absolute inset-0 z-50 flex items-start justify-center pt-24 px-8 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl bg-card border border-slate-700/50 rounded-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden ring-1 ring-white/10">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  AI Analysis
                </span>
                <button onClick={() => setSearchResults(null)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-900/50 text-slate-300">
                {renderClinicalReport(searchResults)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

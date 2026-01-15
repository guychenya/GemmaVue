
import React, { useState } from 'react';
import { queryClinicalDocs } from '../services/geminiService';
import { ClinicalDoc } from '../types';

const DocumentsModule: React.FC = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [docs] = useState<ClinicalDoc[]>([
    { id: '1', type: 'Clinic Note', date: 'Oct 12, 2023', title: 'Consultation - Internal Medicine', content: 'Patient presents with fatigue and dyspnea. History of hypertension. Recommended lab work including CBC and Iron studies.' },
    { id: '2', type: 'Lab', date: 'Nov 05, 2023', title: 'Hematology Panel', content: 'HGB: 10.2 (Low), Ferritin: 15 (Low), MCV: 78 (Low). Suggestive of iron deficiency anemia.' },
    { id: '3', type: 'Imaging', date: 'Jan 20, 2024', title: 'Abdominal Ultrasound', content: 'Liver: Normal size and echogenicity. Gallbladder: No stones. Kidneys: Bilateral cysts present, largest 2cm on right.' },
  ]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setIsSearching(true);
    try {
      const result = await queryClinicalDocs(docs.map(d => d.content), query);
      setAnswer(result || 'No information found.');
    } catch (err) {
      console.error(err);
      setAnswer('Clinical engine query failure.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-10 h-full flex flex-col space-y-10 animate-in fade-in duration-700">
      <div className="flex-none">
        <h2 className="text-3xl font-semibold tracking-tight text-white">Clinical Omnisearch</h2>
        <p className="text-slate-500 text-sm mt-1">Cross-referencing historical medical records with LLM-reasoning</p>
      </div>

      <div className="flex-1 flex gap-10 overflow-hidden">
        {/* Timeline */}
        <div className="w-80 flex-none overflow-y-auto pr-4 space-y-6">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Chronological View</p>
          <div className="space-y-4">
            {docs.map((doc) => (
              <div key={doc.id} className="group glass p-4 rounded-2xl hover:border-slate-700 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-bold text-blue-400">{doc.date}</span>
                   <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-400 font-bold uppercase">{doc.type}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white">{doc.title}</h4>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{doc.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search & Answer Area */}
        <div className="flex-1 flex flex-col space-y-6 overflow-hidden">
          <form onSubmit={handleSearch} className="relative flex-none">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query patient history (e.g., 'Compare HGB over time')"
              className="w-full glass bg-slate-900/30 border-slate-800/60 rounded-2xl py-5 pl-14 pr-6 text-base text-white focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xl transition-all"
            />
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
               <span className="text-[10px] font-bold text-slate-600 bg-slate-800 px-2 py-1 rounded">⌘ K</span>
            </div>
          </form>

          <div className="flex-1 glass rounded-3xl overflow-hidden flex flex-col border-slate-800/60 shadow-inner">
            <header className="px-8 py-4 border-b border-slate-800/60 bg-slate-900/20 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Synthesis Engine v3</span>
              {isSearching && <span className="text-[10px] font-bold text-blue-400 animate-pulse">REASONING...</span>}
            </header>
            
            <div className="flex-1 p-10 overflow-y-auto">
              {!answer && !isSearching && (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                  <svg className="w-16 h-16 text-slate-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                  <p className="text-lg font-medium">Ready for Inquiry</p>
                </div>
              )}
              
              {isSearching && (
                <div className="space-y-6">
                  <div className="h-3 bg-slate-800 rounded-full w-3/4 loading-shimmer"></div>
                  <div className="h-3 bg-slate-800 rounded-full w-1/2 loading-shimmer"></div>
                  <div className="h-3 bg-slate-800 rounded-full w-2/3 loading-shimmer"></div>
                </div>
              )}

              {answer && !isSearching && (
                <div className="animate-in fade-in duration-500 space-y-10">
                  <p className="text-lg text-slate-200 leading-relaxed font-normal">
                    {answer}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 pt-10 border-t border-slate-800/60">
                     {docs.slice(0, 2).map(d => (
                       <div key={d.id} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60">
                         <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">{d.title}</p>
                         <p className="text-xs text-slate-400 leading-relaxed italic">"...{d.content}..."</p>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsModule;

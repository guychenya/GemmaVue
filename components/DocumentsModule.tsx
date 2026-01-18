
import React, { useState } from 'react';
import { queryClinicalDocs } from '../services/geminiService';
import { ClinicalDoc } from '../types';

const DocumentsModule: React.FC = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [docs] = useState<ClinicalDoc[]>([
    { id: '1', type: 'Clinical Note', date: 'Oct 12, 2023', title: 'Consultation - Internal Medicine', content: 'Patient presents with fatigue and dyspnea. History of hypertension.' },
    { id: '2', type: 'Pathology', date: 'Nov 05, 2023', title: 'Hematology Panel', content: 'HGB: 10.2 (Low), Ferritin: 15 (Low), MCV: 78 (Low).' },
    { id: '3', type: 'Radiology', date: 'Jan 20, 2024', title: 'Abdominal Ultrasound', content: 'Liver: Normal size and echogenicity. Gallbladder: No stones.' },
  ]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    try {
      const result = await queryClinicalDocs(docs.map(d => d.content), query);
      setAnswer(result || 'No clinical match.');
    } catch (err) {
      setAnswer('Engine error.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-6rem)] flex flex-col animate-in fade-in duration-300">
      <div className="grid grid-cols-12 gap-8 h-full">
        <div className="col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patient Records</p>
            <span className="text-[10px] font-mono text-slate-600 bg-slate-900 border border-slate-800 px-1.5 rounded">{docs.length}</span>
          </div>

          <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {docs.map(doc => (
              <div key={doc.id} className="group p-4 bg-card border border-slate-800 rounded-xl hover:border-primary/50 transition-colors cursor-pointer shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${doc.type === 'Pathology' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                      doc.type === 'Radiology' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-slate-700/50 text-slate-400 border-slate-600/50'
                    }`}>{doc.type}</span>
                  <span className="text-[10px] font-mono text-slate-500">{doc.date}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">{doc.title}</h4>
                <p className="text-[10px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">{doc.content}</p>
              </div>
            ))}
            <div className="p-4 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-xs font-medium cursor-not-allowed hover:bg-slate-900/50 transition-colors">
              + Connect External EHR
            </div>
          </div>
        </div>

        <div className="col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSearch} className="relative shrink-0">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Semantically search across all records..."
              className="input-field h-12 pl-12 text-sm bg-card"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
          </form>

          <div className="flex-1 bg-card rounded-2xl border border-slate-800 flex flex-col shadow-lg overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
              <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary"></span>
                Intelligence Synthesis
              </h3>
              {answer && <span className="text-[9px] text-slate-500 font-mono">LATENCY: 42ms</span>}
            </div>

            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-canvas/30">
              {answer ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-sm text-slate-300 leading-relaxed font-light">{answer}</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Awaiting Query</p>
                </div>
              )}
            </div>

            {answer && (
              <div className="p-3 bg-slate-900/80 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between px-6">
                <span>Source: 3 Verified Documents</span>
                <span className="cursor-pointer hover:text-white transition-colors">View Citations</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsModule;


import React, { useState } from 'react';
import { queryClinicalDocs } from '../services/geminiService';
import { ClinicalDoc } from '../types';

const DocumentsModule: React.FC = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [docs] = useState<ClinicalDoc[]>([
    { id: '1', type: 'Clinic Note', date: 'Oct 12, 2023', title: 'Consultation - Internal Medicine', content: 'Patient presents with fatigue and dyspnea. History of hypertension.' },
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
    <div className="p-6 h-full flex flex-col animate-in fade-in duration-300 max-w-7xl mx-auto gap-8">
      {/* Top Search Area */}
      <div className="w-full max-w-2xl mx-auto text-center space-y-4 pt-8">
        <h2 className="text-2xl font-light text-white tracking-tight">Clinical Knowledge Base</h2>
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a clinical question about this patient..."
            className="w-full bg-slate-900/50 border border-slate-800 focus:border-blue-500/50 rounded-2xl px-6 py-4 text-center text-slate-200 placeholder:text-slate-600 outline-none transition-all shadow-lg shadow-black/20"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <button type="submit" className="p-2 text-slate-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 pb-8">
        {/* Recent Records List */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2 sticky top-0 bg-canvas z-10 py-2">Relevant Records</h3>
          {docs.map(doc => (
            <div key={doc.id} className="p-4 rounded-xl bg-slate-900/20 border border-slate-800/10 hover:border-slate-700/50 hover:bg-slate-900/40 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] font-bold uppercase tracking-wider ${doc.type === 'Pathology' ? 'text-red-400' :
                  doc.type === 'Radiology' ? 'text-blue-400' :
                    'text-slate-400'
                  }`}>{doc.type}</span>
                <span className="text-[10px] font-mono text-slate-600">{doc.date}</span>
              </div>
              <h4 className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{doc.title}</h4>
            </div>
          ))}

          <button className="p-4 border border-dashed border-slate-800 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-400 hover:border-slate-700 transition-colors">
            + Ingest External Records
          </button>
        </div>

        {/* AI Response Area */}
        <div className="lg:col-span-2 bg-slate-900/10 rounded-2xl border border-slate-800/10 p-8 flex flex-col relative overflow-hidden">

          {!answer ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
              <svg className="w-24 h-24 text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 z-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Synthesized Response</span>
              </div>
              <div className="prose prose-invert prose-lg max-w-none">
                <p className="font-light leading-relaxed text-slate-200">{answer}</p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] text-slate-500">
                      <span className="sr-only">Source {i}</span>
                      DOC
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Verified Sources</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsModule;

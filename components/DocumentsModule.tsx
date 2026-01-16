
import React, { useState } from 'react';
import { queryClinicalDocs } from '../services/geminiService';
import { ClinicalDoc } from '../types';

const DocumentsModule: React.FC = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [docs] = useState<ClinicalDoc[]>([
    { id: '1', type: 'Clinic Note', date: 'Oct 12, 2023', title: 'Consultation - Internal Medicine', content: 'Patient presents with fatigue and dyspnea. History of hypertension.' },
    { id: '2', type: 'Lab', date: 'Nov 05, 2023', title: 'Hematology Panel', content: 'HGB: 10.2 (Low), Ferritin: 15 (Low), MCV: 78 (Low).' },
    { id: '3', type: 'Imaging', date: 'Jan 20, 2024', title: 'Abdominal Ultrasound', content: 'Liver: Normal size and echogenicity. Gallbladder: No stones.' },
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
    <div className="p-8 h-full flex flex-col min-h-[600px] animate-in fade-in duration-300">
      <div className="grid grid-cols-12 gap-8 h-full">
        <div className="col-span-4 space-y-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Available Records</p>
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl cursor-default">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-blue-500 font-bold uppercase">{doc.type}</span>
                  <span className="text-slate-600 font-mono">{doc.date}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200">{doc.title}</h4>
              </div>
            ))}
          </div>
        </div>
        
        <div className="col-span-8 flex flex-col gap-6">
          <form onSubmit={handleSearch} className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query patient records..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
          </form>

          <div className="flex-1 glass rounded-3xl p-8 border-slate-800 flex flex-col">
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 border-b border-slate-800 pb-2">Synthesis Response</h3>
            <div className="text-sm text-slate-400 leading-relaxed font-light">
              {answer || "Enter a query to cross-reference patient data."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsModule;

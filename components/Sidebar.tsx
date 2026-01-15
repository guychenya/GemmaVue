
import React from 'react';
import { ModuleType, PatientProfile } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  activePatient: PatientProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, activePatient }) => {
  const navItems = [
    { id: ModuleType.RADIOLOGY, label: 'Radiology', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
    )},
    { id: ModuleType.DOCUMENTS, label: 'Documents', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
    )},
    { id: ModuleType.DERMVUE, label: 'DermVue', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
    )},
    { id: ModuleType.SETTINGS, label: 'Settings', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    )},
  ];

  const samples = [
    { 
      name: 'Case: Lobar Pneumonia', 
      type: 'Chest X-ray', 
      url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1000&auto=format&fit=crop',
      targetModule: ModuleType.RADIOLOGY
    },
    { 
      name: 'Case: Frontal Meningioma', 
      type: 'MRI T1', 
      url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=1000&auto=format&fit=crop',
      targetModule: ModuleType.RADIOLOGY
    },
    { 
      name: 'Case: Melanocytic Lesion', 
      type: 'Dermoscopy', 
      url: 'https://images.unsplash.com/photo-1628153303102-4f329977f6b9?q=80&w=1000&auto=format&fit=crop',
      targetModule: ModuleType.DERMVUE
    }
  ];

  return (
    <aside className="w-72 h-screen flex flex-col border-r border-slate-800/60 bg-slate-950 p-6">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-lg leading-none">G</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">GemmaVue</h1>
      </div>

      <nav className="flex-1 space-y-1.5">
        <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Operations</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
              activeModule === item.id 
              ? 'bg-slate-900 text-white border border-slate-700/50 shadow-sm' 
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/50'
            }`}
          >
            <span className={activeModule === item.id ? 'text-blue-400' : 'text-slate-500'}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}

        <div className="pt-10">
          <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4">Case Library</p>
          <div className="space-y-3 px-3">
            {samples.map((s, idx) => (
              <div key={idx} className="group flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium group-hover:text-blue-400 transition-colors truncate max-w-[140px]">{s.name}</span>
                  <span className="text-slate-600 text-[9px] font-mono">{s.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <a 
                    href={s.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Asset
                  </a>
                  <button 
                    onClick={() => setActiveModule(s.targetModule)}
                    className="text-[10px] text-blue-500/80 hover:text-blue-400 font-medium transition-colors"
                  >
                    Open Workspace
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-slate-800/60">
        <div className="glass rounded-xl p-4 border-slate-800/40">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Active Context</p>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/40"></span>
          </div>
          <p className="text-sm font-medium text-slate-200">{activePatient.name}</p>
          <p className="text-xs text-slate-500">{activePatient.age}y • {activePatient.gender}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

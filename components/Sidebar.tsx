
import React from 'react';
import { ModuleType, PatientProfile } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  activePatient: PatientProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, activePatient }) => {
  const navItems = [
    { id: ModuleType.DASHBOARD, label: 'Workstation', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    )},
    { id: ModuleType.RADIOLOGY, label: 'Radiology', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
    )},
    { id: ModuleType.DOCUMENTS, label: 'Records', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
    )},
    { id: ModuleType.DERMVUE, label: 'Dermatology', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
    )},
  ];

  return (
    <aside className="w-64 flex flex-col border-r border-slate-900 bg-slate-950 p-4 shrink-0 overflow-y-auto">
      <div className="flex items-center gap-2.5 px-3 mb-10 mt-2">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
          <span className="text-white font-bold text-sm">G</span>
        </div>
        <h1 className="text-sm font-bold tracking-tight text-white uppercase">GemmaVue</h1>
      </div>

      <nav className="flex-1 space-y-1">
        <p className="px-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-3">Diagnostic Desktop</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeModule === item.id 
              ? 'bg-blue-600/10 text-blue-400' 
              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
            }`}
          >
            <span className={activeModule === item.id ? 'text-blue-500' : 'text-slate-500'}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        <button 
          onClick={() => setActiveModule(ModuleType.SETTINGS)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
            activeModule === ModuleType.SETTINGS ? 'text-white' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Settings
        </button>
        <div className="bg-slate-900/30 rounded-2xl p-4 border border-slate-800/40">
          <p className="text-[9px] text-slate-600 uppercase font-bold mb-1">MedGemma v3.1</p>
          <p className="text-[10px] font-medium text-slate-400 tracking-tight">Diagnostic Fidelity: 99.4%</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

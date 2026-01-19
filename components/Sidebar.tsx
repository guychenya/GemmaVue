
import React from 'react';
import { ModuleType, PatientProfile } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  activePatient: PatientProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, activePatient }) => {
  const navItems = [
    {
      id: ModuleType.DASHBOARD, label: 'Workstation', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
      )
    },
    {
      id: ModuleType.RADIOLOGY, label: 'Radiology', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      )
    },
    {
      id: ModuleType.DOCUMENTS, label: 'Records', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      )
    },
    {
      id: ModuleType.DERMVUE, label: 'Dermatology', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      )
    },
  ];

  return (
    <aside className="w-64 h-full flex flex-col bg-sidebar border-r border-slate-800/50">
      <div className="h-16 flex items-center gap-3 px-6">
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-xs">G</span>
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white leading-none">GEMMAVUE</h1>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-0.5">
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveModule(item.id)}
            className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </nav>

      <div className="p-4">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
            DR
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-200 truncate">Dr. Reviewer</p>
            <p className="text-[10px] text-slate-500 truncate">Cardiology Dept.</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

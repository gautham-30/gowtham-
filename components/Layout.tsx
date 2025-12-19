
import React from 'react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: UserRole;
  userName: string;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, role, userName, onLogout }) => {
  const tabs = role === UserRole.HR 
    ? [
        { id: 'dashboard', label: 'HR Dashboard', icon: '💎' },
        { id: 'jobs', label: 'My Listings', icon: '📄' },
        { id: 'applications', label: 'Resdex (ATS)', icon: '⚡' },
        { id: 'messages', label: 'Candidate Inbox', icon: '📬' },
      ]
    : [
        { id: 'explore', label: 'Search Jobs', icon: '🚀' },
        { id: 'my-apps', label: 'Applied', icon: '📂' },
        { id: 'profile', label: 'AI Resume', icon: '👤' },
        { id: 'messages', label: 'Messages', icon: '💬' },
      ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Satoshi']">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-200">
        <div className="p-10">
          <h1 className="text-4xl font-black text-[#275DF5] tracking-tighter">NexusHR<span className="text-slate-200 font-light">AI</span></h1>
        </div>
        
        <nav className="flex-1 px-6 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-4 text-sm font-black rounded-2xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-[#275DF5] text-white shadow-[0_15px_30px_-10px_rgba(39,93,245,0.4)] translate-x-1' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="mr-4 text-2xl">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-100">
          <div className="flex items-center p-5 rounded-[2rem] bg-slate-50 border border-slate-100 group">
            <div className="w-14 h-14 rounded-2xl bg-[#275DF5] flex items-center justify-center text-white font-black text-2xl mr-4 shadow-lg group-hover:scale-110 transition-transform">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-black text-slate-900 truncate">{userName}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{role}</p>
            </div>
            <button onClick={onLogout} className="p-2 text-slate-300 hover:text-red-500 hover:scale-125 transition-all" title="Logout">
               🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-6 bg-white border-b border-slate-100 shadow-sm">
           <h1 className="text-2xl font-black text-[#275DF5]">NexusHR<span className="text-slate-200 font-light">AI</span></h1>
           <button className="text-2xl">☰</button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-14">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Nav */}
        <nav className="lg:hidden flex bg-white border-t border-slate-200 p-3 justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
           {tabs.map(tab => (
             <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 flex flex-col items-center rounded-2xl transition-colors ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}
             >
               <span className="text-2xl">{tab.icon}</span>
               <span className="text-[10px] mt-1 font-black uppercase tracking-widest">{tab.label.split(' ')[0]}</span>
             </button>
           ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;

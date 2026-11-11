import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  CheckCircle2,
  Brain,
  User,
  MessageSquare
} from 'lucide-react';

export type ActiveTab = 'welcome' | 'overview' | 'opportunities' | 'studio' | 'tracker' | 'practice';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  pendingClarificationCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  isChatOpen,
  toggleChat,
  pendingClarificationCount
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'opportunities', label: 'Opportunities', icon: <Briefcase className="w-5 h-5" /> },
    {
      id: 'studio',
      label: 'Application Studio',
      icon: <FileText className="w-5 h-5" />,
      badge: pendingClarificationCount > 0 ? pendingClarificationCount : undefined
    },
    { id: 'tracker', label: 'Applications', icon: <CheckCircle2 className="w-5 h-5" /> },
    { id: 'practice', label: 'Practice', icon: <Brain className="w-5 h-5" /> }
  ];

  return (
    <>
      {/* Desktop / Tablet Slim Left Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-[#14213D] text-[#F4EDE0] border-r border-[#1E2F52] select-none shrink-0 z-20">
        {/* Brand Area */}
        <div className="p-6 border-b border-[#1E2F52]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FF6B5B] flex items-center justify-center font-extrabold text-[#14213D] text-lg font-display tracking-tight shadow-sm">
              A
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-white block leading-none">
                A-viora
              </span>
              <span className="text-[11px] text-[#F4EDE0]/80 font-medium tracking-normal mt-1 block">
                AI Placement Companion
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left group ${
                  isActive
                    ? 'bg-[#1E2F52] text-white shadow-xs font-semibold'
                    : 'text-[#F4EDE0]/75 hover:text-white hover:bg-[#1E2F52]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-[#FF6B5B]' : 'text-[#F4EDE0]/60 group-hover:text-[#F4EDE0]'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#FF6B5B] text-[#14213D] font-bold">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile and Chat launcher button */}
        <div className="p-3 border-t border-[#1E2F52] space-y-2">
          {/* Chat Quick launcher */}
          <button
            onClick={toggleChat}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isChatOpen
                ? 'bg-[#FF6B5B]/15 text-[#FF6B5B] border border-[#FF6B5B]/30'
                : 'text-[#F4EDE0]/80 hover:text-white hover:bg-[#1E2F52]/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-[#FF6B5B]" />
              <span>Talk to A-viora</span>
            </div>
            <span className="text-[10px] tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#1E2F52] text-[#F4EDE0]/70 font-mono">
              {isChatOpen ? 'Open' : 'Chat'}
            </span>
          </button>

          {/* Profile Item at bottom */}
          <button
            onClick={() => setActiveTab('welcome')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              activeTab === 'welcome'
                ? 'bg-[#1E2F52] text-white font-semibold'
                : 'text-[#F4EDE0]/75 hover:text-white hover:bg-[#1E2F52]/50'
            }`}
          >
            <User className="w-5 h-5 text-[#F4EDE0]/60" />
            <div className="truncate">
              <span className="block truncate text-xs text-[#F4EDE0]/60 uppercase tracking-wider">Profile</span>
              <span className="block truncate text-sm">Riya Sharma</span>
            </div>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#14213D] border-t border-[#1E2F52] flex items-center justify-around px-2 z-40 select-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center w-14 h-full text-xs transition-colors ${
            activeTab === 'overview' ? 'text-[#FF6B5B]' : 'text-[#F4EDE0]/70'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('opportunities')}
          className={`flex flex-col items-center justify-center w-14 h-full text-xs transition-colors ${
            activeTab === 'opportunities' ? 'text-[#FF6B5B]' : 'text-[#F4EDE0]/70'
          }`}
        >
          <Briefcase className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Jobs</span>
        </button>

        <button
          onClick={() => setActiveTab('studio')}
          className={`relative flex flex-col items-center justify-center w-14 h-full text-xs transition-colors ${
            activeTab === 'studio' ? 'text-[#FF6B5B]' : 'text-[#F4EDE0]/70'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Studio</span>
          {pendingClarificationCount > 0 && (
            <span className="absolute top-2 right-3 w-2 h-2 rounded-full bg-[#FF6B5B]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center justify-center w-14 h-full text-xs transition-colors ${
            activeTab === 'practice' ? 'text-[#FF6B5B]' : 'text-[#F4EDE0]/70'
          }`}
        >
          <Brain className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Practice</span>
        </button>

        <button
          onClick={toggleChat}
          className={`flex flex-col items-center justify-center w-14 h-full text-xs transition-colors ${
            isChatOpen ? 'text-[#FF6B5B]' : 'text-[#F4EDE0]/70'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Chat</span>
        </button>
      </nav>
    </>
  );
};

import React from 'react';
import { Bell, Sparkles, User, RefreshCw, MessageSquare } from 'lucide-react';
import { ActiveTab } from './Navigation';
import { ReminderItem } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  reminders: ReminderItem[];
  onOpenReminders: () => void;
  onResetSample: () => void;
  studentName: string;
  targetRole: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isChatOpen,
  toggleChat,
  reminders,
  onOpenReminders,
  onResetSample,
  studentName,
  targetRole
}) => {
  const pendingReminders = reminders.filter(r => !r.completed);

  return (
    <header className="h-16 px-6 bg-[#F4EDE0] border-b border-[#E2D9C8] flex items-center justify-between gap-8 select-none shrink-0 sticky top-0 z-30">
      {/* Zone 1: Single text element Brand Wordmark */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('overview')}
          className="text-lg font-bold tracking-tight text-[#0F172A] font-display whitespace-nowrap shrink-0 hover:text-[#FF6B5B] transition-colors"
        >
          A-viora
        </button>
        <span className="hidden sm:inline-block text-xs text-[#334155] font-medium">
          / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </span>
      </div>

      {/* Zone 2: Concise single-line text links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-[#334155]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'overview' ? 'text-[#0F172A] font-bold underline underline-offset-4 decoration-[#FF6B5B]' : ''
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'opportunities' ? 'text-[#0F172A] font-bold underline underline-offset-4 decoration-[#FF6B5B]' : ''
          }`}
        >
          Opportunities
        </button>
        <button
          onClick={() => setActiveTab('studio')}
          className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'studio' ? 'text-[#0F172A] font-bold underline underline-offset-4 decoration-[#FF6B5B]' : ''
          }`}
        >
          Application Studio
        </button>
        <button
          onClick={() => setActiveTab('tracker')}
          className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'tracker' ? 'text-[#0F172A] font-bold underline underline-offset-4 decoration-[#FF6B5B]' : ''
          }`}
        >
          Approval & Tracker
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`hover:text-[#0F172A] transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'practice' ? 'text-[#0F172A] font-bold underline underline-offset-4 decoration-[#FF6B5B]' : ''
          }`}
        >
          Interview Practice
        </button>
      </nav>

      {/* Zone 3: Clean Actions (Student Context & Reminder Bell & Chat Toggle) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Student Quick Badge */}
        <button
          onClick={() => setActiveTab('welcome')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#E2D9C8] text-[#0F172A] text-xs font-medium border border-[#E2D9C8] transition-colors shadow-xs"
          title="Review or switch profile"
        >
          <User className="w-3.5 h-3.5 text-[#334155]" />
          <span className="font-bold text-[#0F172A]">{studentName}</span>
          <span className="text-[#334155] hidden xl:inline">· {targetRole}</span>
        </button>

        {/* Reset sample button */}
        <button
          onClick={onResetSample}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2D9C8] hover:bg-[#FAF7F2] text-xs font-semibold text-[#334155] hover:text-[#0F172A] transition-colors"
          title="Restore sample student (Riya Sharma)"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset Sample</span>
        </button>

        {/* Reminders Bell with unboxed count */}
        <button
          onClick={onOpenReminders}
          className="relative p-2 rounded-lg hover:bg-[#E2D9C8] text-[#0F172A] transition-colors"
          title="Upcoming reminders"
          aria-label="Upcoming reminders"
        >
          <Bell className="w-4 h-4" />
          {pendingReminders.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF6B5B]" />
          )}
        </button>

        {/* Chat Toggle Button */}
        <button
          onClick={toggleChat}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-xs ${
            isChatOpen
              ? 'bg-[#14213D] text-[#F8FAFC] hover:bg-[#1E2F52]'
              : 'bg-[#FF6B5B] text-[#14213D] hover:bg-[#E05A4A]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">{isChatOpen ? 'Hide Chat' : 'Talk to A-viora'}</span>
        </button>
      </div>
    </header>
  );
};

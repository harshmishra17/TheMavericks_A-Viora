import React from 'react';
import {
  ArrowRight,
  FileCheck2,
  Briefcase,
  Bell,
  Brain,
  History,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { StudentProfile, JobOpportunity, ApplicationDraft, ReminderItem, AppActivity } from '../types';
import { ActiveTab } from './Navigation';

interface OverviewProps {
  profile: StudentProfile;
  application: ApplicationDraft;
  jobs: JobOpportunity[];
  reminders: ReminderItem[];
  activities: AppActivity[];
  onNavigate: (tab: ActiveTab) => void;
  onOpenSourceModal: (claimId: string) => void;
  onSelectJobForApplication: (jobId: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  profile,
  application,
  jobs,
  reminders,
  activities,
  onNavigate,
  onOpenSourceModal,
  onSelectJobForApplication
}) => {
  const firstName = profile.name.split(' ')[0] || 'Riya';
  const pendingReminders = reminders.filter(r => !r.completed);
  const matchedJobs = jobs
    .filter(j => j.requiredSkills.some(s => profile.skills.includes(s)))
    .slice(0, 3);

  // Find primary claim for preview
  const primaryClaim = profile.claims[0] || {
    id: 'claim-1',
    text: 'Designed database schema and queries for college attendance management.',
    status: 'Student confirmed'
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* 1. Greeting & Hero Next Action */}
      <section className="bg-[#FFFFFF] rounded-2xl border border-[#E8DFCF] p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#14213D]/60 font-mono">
            Placement Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] font-display tracking-tight">
            Hi {firstName}, let’s take the next step.
          </h1>

          {/* Next action block */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFCF] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B5B]" />
              <h2 className="text-sm font-bold text-[#14213D]">
                Strengthen your project story.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#14213D]/80 leading-relaxed">
              Make it clear what you built, your role, and the skills you used. Clarifying ownership between team members is what sets genuine candidates apart.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('studio')}
              className="px-5 py-2.5 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Review my resume</span>
            </button>
            <button
              onClick={() => onNavigate('practice')}
              className="px-4 py-2.5 rounded-lg bg-[#14213D] hover:bg-[#1E2F52] text-white text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <Brain className="w-4 h-4 text-[#FF6B5B]" />
              <span>Practise project questions</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Current Application Preview & Verification Status */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#FF6B5B]" />
              <h3 className="font-display font-bold text-sm text-[#14213D]">
                Current Application Draft
              </h3>
            </div>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#FAF7F2] text-[#14213D] border border-[#E8DFCF]">
              Status: {application.status}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-[#14213D]/60 uppercase tracking-wide font-medium">
                Target Role & Company
              </div>
              <div className="text-base font-bold text-[#14213D]">
                {application.role}
              </div>
              <div className="text-xs text-[#14213D]/70">
                {application.company} · Version {application.resumeVersion}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14213D]">Featured Project Claim</span>
                <span className={`text-[11px] font-medium ${primaryClaim.resolved ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {primaryClaim.status}
                </span>
              </div>
              <p className="text-xs font-mono text-[#14213D]/90 leading-relaxed italic">
                "{primaryClaim.revisedText || primaryClaim.text}"
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#14213D]/60">
                  Source: {primaryClaim.sourceFilename || 'README.md'}
                </span>
                <button
                  onClick={() => onOpenSourceModal(primaryClaim.id)}
                  className="text-xs text-[#FF6B5B] hover:text-[#E05A4A] font-semibold flex items-center gap-1"
                >
                  <span>View supporting source</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-[#14213D]/60">
                Verified candidate skills: {profile.skills.slice(0, 4).join(' · ')}
              </div>
              <button
                onClick={() => onNavigate('studio')}
                className="text-xs font-semibold text-[#14213D] hover:text-[#FF6B5B] flex items-center gap-1"
              >
                <span>Open in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reminders column */}
        <div className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF6B5B]" />
                <h3 className="font-display font-bold text-sm text-[#14213D]">
                  Upcoming Reminders
                </h3>
              </div>
              <span className="text-xs font-mono text-[#14213D]/60">
                {pendingReminders.length} active
              </span>
            </div>

            {pendingReminders.length === 0 ? (
              <p className="text-xs text-[#14213D]/60 py-4 text-center">
                No pending deadlines or review reminders.
              </p>
            ) : (
              <div className="space-y-2.5">
                {pendingReminders.slice(0, 3).map(rem => (
                  <div
                    key={rem.id}
                    className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] text-xs space-y-1"
                  >
                    <div className="font-semibold text-[#14213D] line-clamp-1">
                      {rem.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#14213D]/60 font-mono">
                      <Clock className="w-3 h-3 text-[#FF6B5B]" />
                      <span>Due {new Date(rem.dueDateTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E8DFCF]">
            <button
              onClick={() => onNavigate('tracker')}
              className="w-full py-2 rounded-md bg-[#FAF7F2] hover:bg-[#E8DFCF] text-xs font-semibold text-[#14213D] text-center transition-colors"
            >
              View Application Tracker
            </button>
          </div>
        </div>
      </section>

      {/* 3. Matching Opportunities Grid */}
      <section className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#FF6B5B]" />
            <h3 className="font-display font-bold text-base text-[#14213D]">
              Matching Fictional Opportunities
            </h3>
          </div>
          <button
            onClick={() => onNavigate('opportunities')}
            className="text-xs font-semibold text-[#14213D] hover:text-[#FF6B5B] flex items-center gap-1"
          >
            <span>View all 10 roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matchedJobs.map(job => {
            const matchedSkills = job.requiredSkills.filter(s => profile.skills.includes(s));
            const missingSkills = job.requiredSkills.filter(s => !profile.skills.includes(s));

            return (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFCF] flex flex-col justify-between hover:border-[#14213D]/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#14213D]/60 font-mono">
                    <span>{job.type}</span>
                    <span>{job.location}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#14213D] leading-snug">
                    {job.role}
                  </h4>
                  <div className="text-xs text-[#14213D]/70 font-medium">
                    {job.company}
                  </div>
                  <p className="text-xs text-[#14213D]/80 line-clamp-2">
                    {job.whyRelevant}
                  </p>

                  <div className="text-[11px] text-[#14213D]/70 pt-1 space-y-1">
                    <div>
                      <strong className="text-emerald-700">Matches:</strong> {matchedSkills.join(', ')}
                    </div>
                    {missingSkills.length > 0 && (
                      <div>
                        <strong className="text-amber-800">Growth:</strong> {missingSkills.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#E8DFCF] flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectJobForApplication(job.id);
                      onNavigate('studio');
                    }}
                    className="text-xs px-3 py-1.5 rounded bg-[#14213D] text-white font-semibold hover:bg-[#1E2F52] transition-colors"
                  >
                    Prepare Draft
                  </button>
                  <button
                    onClick={() => onNavigate('opportunities')}
                    className="text-xs text-[#14213D]/70 hover:text-[#14213D]"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Real Recorded Activity */}
      <section className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E8DFCF] pb-3">
          <History className="w-4 h-4 text-[#FF6B5B]" />
          <h3 className="font-display font-bold text-sm text-[#14213D]">
            Recent Activity (Audit Log)
          </h3>
        </div>

        {activities.length === 0 ? (
          <p className="text-xs text-[#14213D]/60 py-2">No actions recorded yet.</p>
        ) : (
          <div className="divide-y divide-[#E8DFCF]">
            {activities.slice(0, 5).map(act => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                <div className="flex items-center gap-2.5 text-[#14213D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14213D]/40 shrink-0" />
                  <span>{act.description}</span>
                </div>
                <span className="text-[11px] font-mono text-[#14213D]/50 shrink-0">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

import React, { useState } from 'react';
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
  Sparkles,
  Target,
  ListChecks,
  ChevronDown,
  ChevronUp,
  FolderGit2
} from 'lucide-react';
import {
  StudentProfile,
  JobOpportunity,
  ApplicationDraft,
  ReminderItem,
  AppActivity,
  SkillGapReport,
  PreparationRoadmap
} from '../types';
import { ActiveTab } from './Navigation';

interface OverviewProps {
  profile: StudentProfile;
  application: ApplicationDraft;
  jobs: JobOpportunity[];
  reminders: ReminderItem[];
  activities: AppActivity[];
  gapReport?: SkillGapReport | null;
  roadmap?: PreparationRoadmap | null;
  onNavigate: (tab: ActiveTab) => void;
  onOpenSourceModal: (claimId: string) => void;
  onSelectJobForApplication: (jobId: string) => void;
  onToggleRoadmapTask?: (taskId: string, dayNumber?: number) => Promise<any>;
}

export const Overview: React.FC<OverviewProps> = ({
  profile,
  application,
  jobs,
  reminders,
  activities,
  gapReport,
  roadmap,
  onNavigate,
  onOpenSourceModal,
  onSelectJobForApplication,
  onToggleRoadmapTask
}) => {
  const firstName = profile.name.split(' ')[0] || 'Riya';
  const pendingReminders = reminders.filter(r => !r.completed);
  const matchedJobs = jobs
    .filter(j => j.requiredSkills.some(s => profile.skills.includes(s)))
    .slice(0, 3);

  const [expandedRoadmapDay, setExpandedRoadmapDay] = useState<number | null>(null);

  // Find primary claim for preview
  const primaryClaim = profile.claims[0] || {
    id: 'claim-1',
    text: 'Designed database schema and queries for college attendance management.',
    status: 'Student confirmed'
  };

  const completedDays = roadmap?.dailyPlan.filter(d => d.completed).length || 0;
  const totalDays = roadmap?.dailyPlan.length || 7;
  const progressPercent = Math.round((completedDays / totalDays) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* 1. Greeting & Hero Next Action */}
      <section className="bg-[#FFFFFF] rounded-2xl border border-[#CBD5E1] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#334155] font-mono">
            Placement Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] font-display tracking-tight">
            Hi {firstName}, let’s take the next step.
          </h1>

          {/* Next action block */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#CBD5E1] space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B5B]" />
              <h2 className="text-sm font-bold text-[#0F172A]">
                {completedDays < totalDays
                  ? `Focus on Day ${completedDays + 1} of your 7-Day Roadmap: ${roadmap?.dailyPlan[completedDays]?.title || 'Technical Preparation'}`
                  : 'Strengthen your project story and review final draft.'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
              {completedDays < totalDays
                ? `${roadmap?.dailyPlan[completedDays]?.objective || 'Work on addressing key job requirements.'} Complete daily tasks to build rock-solid interview confidence.`
                : 'Make it clear what you built, your role, and the skills you used. Clarifying ownership between team members is what sets genuine candidates apart.'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('studio')}
              className="px-5 py-2.5 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-extrabold text-xs uppercase tracking-wide transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Review my resume</span>
            </button>

            <button
              onClick={() => onNavigate('practice')}
              className="px-4 py-2.5 rounded-lg bg-[#14213D] hover:bg-[#1E2F52] text-[#F8FAFC] text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
            >
              <Brain className="w-4 h-4 text-[#FF6B5B]" />
              <span>Practise 5 Job Questions</span>
            </button>

            <button
              onClick={() => onNavigate('opportunities')}
              className="px-4 py-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#E2D9C8] text-[#0F172A] text-xs font-bold border border-[#CBD5E1] transition-colors flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-[#FF6B5B]" />
              <span>Analyze Job Description</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Resume Analysis & Skill Gap Report Status */}
      {gapReport && (
        <section className="bg-[#FFFFFF] rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#CBD5E1] pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FF6B5B]" />
              <h2 className="font-display font-bold text-base text-[#0F172A]">
                Resume Analysis & Skill Gap Status
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {gapReport.confidenceAlignment}
              </span>
              <span className="text-xs text-[#334155] font-semibold">
                Target: {gapReport.jobRole} ({gapReport.company})
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed">
            {gapReport.matchAssessment}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Evidence */}
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <div className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Match Evidence ({gapReport.matchedSkills.length})</span>
              </div>
              <div className="space-y-1.5">
                {gapReport.matchedSkills.slice(0, 3).map(m => (
                  <div key={m.skill} className="text-xs text-emerald-950">
                    <strong className="text-emerald-900">{m.skill}:</strong>{' '}
                    <span className="italic font-mono text-[11px] text-emerald-800">{m.evidence}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Skill Gaps */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-800" />
                <span>Identified Growth Gaps ({gapReport.missingSkills.length})</span>
              </div>
              <div className="space-y-1.5">
                {gapReport.missingSkills.slice(0, 3).map(m => (
                  <div key={m.skill} className="text-xs text-amber-950">
                    <strong className="text-amber-900">{m.skill} ({m.importance} priority):</strong>{' '}
                    <span className="text-[11px] text-amber-900">{m.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Personalized 7-Day Preparation Roadmap */}
      {roadmap && (
        <section className="bg-[#FFFFFF] rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#CBD5E1] pb-3 gap-2">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FF6B5B]" />
              <h2 className="font-display font-bold text-base text-[#0F172A]">
                Personalized 7-Day Preparation Roadmap
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-[#0F172A]">
                {completedDays} / {totalDays} Days Completed ({progressPercent}%)
              </span>
              <div className="w-24 h-2 rounded-full bg-[#E2D9C8] overflow-hidden">
                <div
                  className="h-full bg-[#FF6B5B] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Tasks List */}
          <div className="space-y-2.5">
            {roadmap.dailyPlan.map(day => {
              const isExpanded = expandedRoadmapDay === day.dayNumber;

              return (
                <div
                  key={day.id}
                  className={`rounded-xl border transition-colors p-3.5 text-xs ${
                    day.completed ? 'bg-[#FAF7F2] border-[#CBD5E1] opacity-80' : 'bg-white border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleRoadmapTask && onToggleRoadmapTask(day.id, day.dayNumber)}
                      className="mt-0.5 text-[#0F172A] hover:text-[#FF6B5B] shrink-0"
                      title="Toggle task completion"
                    >
                      {day.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1] hover:border-[#14213D]" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold text-sm ${day.completed ? 'line-through text-[#475569]' : 'text-[#0F172A]'}`}>
                          Day {day.dayNumber}: {day.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-[#475569] font-medium">
                            ~{day.estimatedHours}h
                          </span>
                          <button
                            type="button"
                            onClick={() => setExpandedRoadmapDay(isExpanded ? null : day.dayNumber)}
                            className="p-1 text-[#334155] hover:text-[#0F172A]"
                            aria-label="Toggle details"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#334155] leading-relaxed">
                        {day.objective}
                      </p>

                      {isExpanded && (
                        <div className="pt-2 mt-2 border-t border-[#CBD5E1]/60 space-y-1">
                          <div className="font-bold text-[#0F172A] text-[11px] uppercase tracking-wider">
                            Daily Action Checklist:
                          </div>
                          <ul className="list-disc pl-4 text-xs text-[#334155] space-y-1">
                            {day.tasks.map((task, tIdx) => (
                              <li key={tIdx}>{task}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Current Application Preview & Reminders */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#FF6B5B]" />
              <h3 className="font-display font-bold text-sm text-[#0F172A]">
                Current Application Draft
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#FAF7F2] text-[#0F172A] border border-[#CBD5E1]">
              Status: {application.status}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="text-xs text-[#475569] uppercase tracking-wide font-bold">
                Target Role & Company
              </div>
              <div className="text-base font-bold text-[#0F172A]">
                {application.role}
              </div>
              <div className="text-xs text-[#334155] font-medium">
                {application.company} · Version {application.resumeVersion}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#CBD5E1] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0F172A]">Featured Project Claim</span>
                <span className={`text-[11px] font-bold ${primaryClaim.resolved ? 'text-emerald-800' : 'text-amber-900'}`}>
                  {primaryClaim.status}
                </span>
              </div>
              <p className="text-xs font-mono text-[#0F172A] leading-relaxed italic">
                "{primaryClaim.revisedText || primaryClaim.text}"
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#475569] font-medium">
                  Source: {primaryClaim.sourceFilename || 'README.md'}
                </span>
                <button
                  onClick={() => onOpenSourceModal(primaryClaim.id)}
                  className="text-xs text-[#FF6B5B] hover:text-[#E05A4A] font-bold flex items-center gap-1"
                >
                  <span>View supporting source</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-[#334155] font-medium">
                Verified candidate skills: {profile.skills.slice(0, 4).join(' · ')}
              </div>
              <button
                onClick={() => onNavigate('studio')}
                className="text-xs font-bold text-[#0F172A] hover:text-[#FF6B5B] flex items-center gap-1"
              >
                <span>Open in Studio</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF6B5B]" />
              </button>
            </div>
          </div>
        </div>

        {/* Reminders column */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#CBD5E1] p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF6B5B]" />
                <h3 className="font-display font-bold text-sm text-[#0F172A]">
                  Upcoming Reminders
                </h3>
              </div>
              <span className="text-xs font-mono text-[#334155] font-bold">
                {pendingReminders.length} active
              </span>
            </div>

            {pendingReminders.length === 0 ? (
              <p className="text-xs text-[#475569] py-4 text-center font-medium">
                No pending deadlines or review reminders.
              </p>
            ) : (
              <div className="space-y-2.5">
                {pendingReminders.slice(0, 3).map(rem => (
                  <div
                    key={rem.id}
                    className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#CBD5E1] text-xs space-y-1"
                  >
                    <div className="font-bold text-[#0F172A] line-clamp-1">
                      {rem.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#334155] font-mono">
                      <Clock className="w-3 h-3 text-[#FF6B5B]" />
                      <span>Due {new Date(rem.dueDateTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#CBD5E1]">
            <button
              onClick={() => onNavigate('tracker')}
              className="w-full py-2 rounded-lg bg-[#FAF7F2] hover:bg-[#E2D9C8] text-xs font-bold text-[#0F172A] text-center transition-colors border border-[#CBD5E1]"
            >
              View Application Tracker
            </button>
          </div>
        </div>
      </section>

      {/* 5. Matching Opportunities Preview */}
      <section className="bg-[#FFFFFF] rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#FF6B5B]" />
            <h3 className="font-display font-bold text-base text-[#0F172A]">
              Matching Fictional Opportunities
            </h3>
          </div>
          <button
            onClick={() => onNavigate('opportunities')}
            className="text-xs font-bold text-[#0F172A] hover:text-[#FF6B5B] flex items-center gap-1"
          >
            <span>View all 10 roles</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FF6B5B]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matchedJobs.map(job => {
            const matchedSkills = job.requiredSkills.filter(s => profile.skills.includes(s));
            const missingSkills = job.requiredSkills.filter(s => !profile.skills.includes(s));

            return (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-[#FAF7F2] border border-[#CBD5E1] flex flex-col justify-between hover:border-[#14213D] transition-colors shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#475569] font-mono font-medium">
                    <span>{job.type}</span>
                    <span>{job.location}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0F172A] leading-snug">
                    {job.role}
                  </h4>
                  <div className="text-xs text-[#334155] font-bold">
                    {job.company}
                  </div>
                  <p className="text-xs text-[#334155] line-clamp-2">
                    {job.whyRelevant}
                  </p>

                  <div className="text-[11px] text-[#334155] pt-1 space-y-1">
                    <div>
                      <strong className="text-emerald-800">Matches:</strong> {matchedSkills.join(', ')}
                    </div>
                    {missingSkills.length > 0 && (
                      <div>
                        <strong className="text-amber-900">Growth:</strong> {missingSkills.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#CBD5E1] flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectJobForApplication(job.id);
                      onNavigate('studio');
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[#14213D] text-[#F8FAFC] font-bold hover:bg-[#1E2F52] transition-colors shadow-xs"
                  >
                    Prepare Draft
                  </button>
                  <button
                    onClick={() => onNavigate('opportunities')}
                    className="text-xs text-[#334155] font-bold hover:text-[#0F172A]"
                  >
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Real Recorded Activity */}
      <section className="bg-[#FFFFFF] rounded-2xl border border-[#CBD5E1] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#CBD5E1] pb-3">
          <History className="w-4 h-4 text-[#FF6B5B]" />
          <h3 className="font-display font-bold text-sm text-[#0F172A]">
            Recent Activity (Audit Log)
          </h3>
        </div>

        {activities.length === 0 ? (
          <p className="text-xs text-[#475569] py-2 font-medium">No actions recorded yet.</p>
        ) : (
          <div className="divide-y divide-[#CBD5E1]">
            {activities.slice(0, 5).map(act => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs gap-4">
                <div className="flex items-center gap-2.5 text-[#0F172A] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14213D] shrink-0" />
                  <span>{act.description}</span>
                </div>
                <span className="text-[11px] font-mono text-[#475569] font-medium shrink-0">
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navigation, ActiveTab } from './components/Navigation';
import { Header } from './components/Header';
import { ChatPanel } from './components/ChatPanel';
import { WelcomeProfile } from './components/WelcomeProfile';
import { Overview } from './components/Overview';
import { Opportunities } from './components/Opportunities';
import { ApplicationStudio } from './components/ApplicationStudio';
import { ApprovalTracker } from './components/ApprovalTracker';
import { InterviewPractice } from './components/InterviewPractice';
import { RemindersModal } from './components/RemindersModal';
import {
  StudentProfile,
  JobOpportunity,
  ApplicationDraft,
  ReminderItem,
  InterviewAttempt,
  SavedWeakArea,
  ChatMessage,
  AppActivity,
  JobDescriptionAnalysis,
  SkillGapReport,
  PreparationRoadmap,
  JobInterviewQuestion
} from './types';
import {
  SAMPLE_STUDENT,
  FICTIONAL_JOB_LISTINGS,
  INITIAL_APPLICATION,
  INITIAL_REMINDERS,
  INITIAL_JOB_ANALYSIS,
  INITIAL_SKILL_GAP_REPORT,
  INITIAL_ROADMAP,
  INITIAL_JOB_QUESTIONS
} from './data/defaultData';
import { AlertCircle, Bell, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  // Chat visible by default on desktop overview
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [isRemindersOpen, setIsRemindersOpen] = useState<boolean>(false);
  const [selectedClaimModal, setSelectedClaimModal] = useState<string | null>(null);

  // Core Data States with localStorage hydration
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem('aviora_profile');
      return saved ? JSON.parse(saved) : SAMPLE_STUDENT;
    } catch {
      return SAMPLE_STUDENT;
    }
  });

  const [jobs, setJobs] = useState<JobOpportunity[]>(FICTIONAL_JOB_LISTINGS);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aviora_saved_jobs');
      return saved ? JSON.parse(saved) : ['job-1', 'job-2'];
    } catch {
      return ['job-1', 'job-2'];
    }
  });

  const [application, setApplication] = useState<ApplicationDraft>(() => {
    try {
      const saved = localStorage.getItem('aviora_app_draft');
      return saved ? JSON.parse(saved) : INITIAL_APPLICATION;
    } catch {
      return INITIAL_APPLICATION;
    }
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    try {
      const saved = localStorage.getItem('aviora_reminders');
      return saved ? JSON.parse(saved) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  });

  const [activities, setActivities] = useState<AppActivity[]>([
    {
      id: 'act-1',
      description: 'Initialized sample student profile (Riya Sharma).',
      timestamp: new Date().toISOString(),
      type: 'profile'
    }
  ]);

  const [interviewHistory, setInterviewHistory] = useState<InterviewAttempt[]>([
    {
      id: 'att-seed-1',
      mode: 'Project interview',
      question: 'How did you prevent duplicate attendance records in your college project schema?',
      context: 'College Attendance System — Database tier',
      userAnswer: 'I created a composite unique constraint on the student ID and session date columns in the attendance_records table. If an insert occurs with the same pair on the same day, the database raises an integrity error which the API catches.',
      feedback: {
        whatWasClear: 'Precise explanation of the database constraint mechanism (composite unique index).',
        whatNeedsImprovement: 'Could mention how the Flask backend surfaces that constraint error to the user without crashing.',
        practicalSuggestion: 'State: "In SQLite/Postgres, UNIQUE(student_id, session_date) enforces idempotency at the storage engine level."',
        followUpQuestion: 'What HTTP status code did your Flask route return when that duplicate error was caught?'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
    }
  ]);

  const [weakAreas, setWeakAreas] = useState<SavedWeakArea[]>([
    {
      id: 'wa-1',
      topic: 'Explaining Flask Error Handling & HTTP Status Codes',
      details: 'Practise bridging database constraint exceptions to the REST API response layer (409 Conflict).',
      practicedCount: 1
    }
  ]);

  const [jobAnalysis, setJobAnalysis] = useState<JobDescriptionAnalysis | null>(() => {
    try {
      const saved = localStorage.getItem('aviora_job_analysis');
      return saved ? JSON.parse(saved) : INITIAL_JOB_ANALYSIS;
    } catch {
      return INITIAL_JOB_ANALYSIS;
    }
  });

  const [gapReport, setGapReport] = useState<SkillGapReport | null>(() => {
    try {
      const saved = localStorage.getItem('aviora_gap_report');
      return saved ? JSON.parse(saved) : INITIAL_SKILL_GAP_REPORT;
    } catch {
      return INITIAL_SKILL_GAP_REPORT;
    }
  });

  const [roadmap, setRoadmap] = useState<PreparationRoadmap | null>(() => {
    try {
      const saved = localStorage.getItem('aviora_roadmap');
      return saved ? JSON.parse(saved) : INITIAL_ROADMAP;
    } catch {
      return INITIAL_ROADMAP;
    }
  });

  const [jobQuestions, setJobQuestions] = useState<JobInterviewQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('aviora_job_questions');
      return saved ? JSON.parse(saved) : INITIAL_JOB_QUESTIONS;
    } catch {
      return INITIAL_JOB_QUESTIONS;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'assistant',
      content: "Hi Riya, welcome to A-viora. Your next opportunity starts with your actual work. I see your college attendance project with Python and SQL. Whether you want to discuss placement worries, match verified jobs, refine your resume, or practise tough questions, I'm right here with you.",
      timestamp: new Date().toISOString(),
      suggestedActions: [
        { label: 'Help me choose a role', actionType: 'prompt', target: 'Help me choose a role based on my Python and SQL skills' },
        { label: 'Review my project claim', actionType: 'navigate', target: 'studio' },
        { label: 'Find matching internships', actionType: 'navigate', target: 'opportunities' },
        { label: 'Practise my explanation', actionType: 'navigate', target: 'practice' }
      ]
    }
  ]);

  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [dueBannerDismissed, setDueBannerDismissed] = useState<boolean>(false);

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem('aviora_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('aviora_saved_jobs', JSON.stringify(savedJobIds));
  }, [savedJobIds]);

  useEffect(() => {
    localStorage.setItem('aviora_app_draft', JSON.stringify(application));
  }, [application]);

  useEffect(() => {
    localStorage.setItem('aviora_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    if (jobAnalysis) localStorage.setItem('aviora_job_analysis', JSON.stringify(jobAnalysis));
  }, [jobAnalysis]);

  useEffect(() => {
    if (gapReport) localStorage.setItem('aviora_gap_report', JSON.stringify(gapReport));
  }, [gapReport]);

  useEffect(() => {
    if (roadmap) localStorage.setItem('aviora_roadmap', JSON.stringify(roadmap));
  }, [roadmap]);

  useEffect(() => {
    if (jobQuestions) localStorage.setItem('aviora_job_questions', JSON.stringify(jobQuestions));
  }, [jobQuestions]);

  // Initial fetch from backend if server is active
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setIsDemoMode(data.mode === 'demo-mode');
      })
      .catch(() => {
        setIsDemoMode(true);
      });

    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        if (data && data.name) setProfile(data);
      })
      .catch(() => {});

    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setJobs(data);
      })
      .catch(() => {});

    fetch('/api/application')
      .then(res => res.json())
      .then(data => {
        if (data && data.id) setApplication(data);
      })
      .catch(() => {});

    fetch('/api/reminders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReminders(data);
      })
      .catch(() => {});

    fetch('/api/interview/history')
      .then(res => res.json())
      .then(data => {
        if (data.attempts) setInterviewHistory(data.attempts);
        if (data.weakAreas) setWeakAreas(data.weakAreas);
      })
      .catch(() => {});

    fetch('/api/activity')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setActivities(data);
      })
      .catch(() => {});

    fetch('/api/analysis')
      .then(res => res.json())
      .then(data => {
        if (data.analysis) setJobAnalysis(data.analysis);
        if (data.gapReport) setGapReport(data.gapReport);
        if (data.roadmap) setRoadmap(data.roadmap);
        if (Array.isArray(data.jobQuestions) && data.jobQuestions.length > 0) {
          setJobQuestions(data.jobQuestions);
        }
      })
      .catch(() => {});
  }, []);

  // Helper for logging real activity
  const addActivity = (description: string, type: AppActivity['type']) => {
    const act: AppActivity = {
      id: `act-${Date.now()}`,
      description,
      timestamp: new Date().toISOString(),
      type
    };
    setActivities(prev => [act, ...prev.slice(0, 40)]);
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(act)
    }).catch(() => {});
  };

  const handleAnalyzeJob = async (
    jobIdOrRole?: string,
    customText?: string,
    customRole?: string,
    customCompany?: string
  ) => {
    let role = customRole || profile.targetRole || 'Backend Engineering Intern';
    let company = customCompany || 'AcuityLogix Systems';
    let description = customText || '';

    if (jobIdOrRole && !customText) {
      // It's a jobId from a curated listing
      const foundJob = jobs.find(j => j.id === jobIdOrRole);
      if (foundJob) {
        role = foundJob.role;
        company = foundJob.company;
        description = `${foundJob.role} at ${foundJob.company}. Description: ${foundJob.description}. Required Skills: ${foundJob.requiredSkills.join(', ')}. Why relevant: ${foundJob.whyRelevant}`;
      }
    } else if (customText) {
      description = customText;
      if (customRole) role = customRole;
      if (customCompany) company = customCompany;
    }

    try {
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, company, description })
      });
      const data = await res.json();
      if (data && data.success) {
        if (data.analysis) setJobAnalysis(data.analysis);
        if (data.gapReport) setGapReport(data.gapReport);
        if (data.roadmap) setRoadmap(data.roadmap);
        if (data.jobQuestions) setJobQuestions(data.jobQuestions);
        addActivity(`AI analyzed job "${role}" at ${company} and prepared a 7-day roadmap.`, 'roadmap');
      }
      return data;
    } catch (err: any) {
      console.error('Failed to analyze job:', err);
      throw err;
    }
  };

  const handleToggleRoadmapTask = async (taskId: string) => {
    // Optimistic update
    setRoadmap(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        dailyPlan: prev.dailyPlan.map(day => ({
          ...day,
          completed: day.id === taskId ? !day.completed : day.completed
        }))
      };
    });

    try {
      const res = await fetch('/api/roadmap/toggle-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId })
      });
      const data = await res.json();
      if (data && data.roadmap) {
        setRoadmap(data.roadmap);
      }
    } catch {}
  };

  // Actions
  const handleSaveProfile = async (updated: StudentProfile) => {
    setProfile(updated);
    addActivity(`Updated profile details for ${updated.name}.`, 'profile');
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {}
  };

  const handleResetSample = async () => {
    setProfile(JSON.parse(JSON.stringify(SAMPLE_STUDENT)));
    setApplication(JSON.parse(JSON.stringify(INITIAL_APPLICATION)));
    addActivity('Restored sample student profile (Riya Sharma).', 'profile');
    try {
      await fetch('/api/profile/reset-sample', { method: 'POST' });
    } catch {}
  };

  const handleToggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleSelectJobForApplication = async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const updatedApp: ApplicationDraft = {
      ...application,
      jobId: job.id,
      role: job.role,
      company: job.company,
      resumeVersion: application.resumeVersion + 1,
      coverNoteVersion: application.coverNoteVersion + 1,
      status: 'Ready for review',
      approvedVersion: null,
      approvedAt: null,
      simulatedSentAt: null,
      simulatedReceiptId: null,
      lastSavedAt: new Date().toISOString()
    };
    setApplication(updatedApp);
    addActivity(`Selected opportunity ${job.role} at ${job.company}. Prepared application draft.`, 'application');

    try {
      await fetch('/api/application/select-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId })
      });
    } catch {}
  };

  const handleSaveDraft = async (
    resumeText: string,
    coverNoteText: string,
    includedClaimIds: string[]
  ) => {
    const isContentModified =
      resumeText !== application.resumeText || coverNoteText !== application.coverNoteText;

    const newResumeVer = isContentModified ? application.resumeVersion + 1 : application.resumeVersion;
    const newCoverVer = isContentModified ? application.coverNoteVersion + 1 : application.coverNoteVersion;
    // Editing an approved document MUST invalidate earlier approval
    const newStatus = isContentModified && application.status === 'Approved' ? 'Ready for review' : application.status;

    const updatedApp: ApplicationDraft = {
      ...application,
      resumeText,
      coverNoteText,
      includedClaimIds,
      resumeVersion: newResumeVer,
      coverNoteVersion: newCoverVer,
      status: newStatus,
      approvedVersion: isContentModified ? null : application.approvedVersion,
      approvedAt: isContentModified ? null : application.approvedAt,
      lastSavedAt: new Date().toISOString(),
      isDirty: false
    };

    setApplication(updatedApp);
    if (isContentModified && application.status === 'Approved') {
      addActivity('Application draft edited in Studio. Earlier approval invalidated pending review.', 'application');
    }

    try {
      await fetch('/api/application/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, coverNoteText, includedClaimIds })
      });
    } catch {}
  };

  const handleClarifyClaim = async (
    claimId: string,
    studentAnswer: string,
    revisedText?: string
  ) => {
    const updatedClaims = profile.claims.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status: 'Student confirmed' as const,
          resolved: true,
          statedContribution: studentAnswer,
          revisedText: revisedText || c.revisedText
        };
      }
      return c;
    });

    const updatedProfile = { ...profile, claims: updatedClaims };
    setProfile(updatedProfile);

    // Editing a claim also invalidates previous approval
    if (application.status === 'Approved') {
      setApplication(prev => ({
        ...prev,
        status: 'Ready for review',
        approvedVersion: null,
        approvedAt: null
      }));
    }

    addActivity(`Clarified individual contribution for claim "${claimId}".`, 'claim');

    try {
      await fetch(`/api/claims/${claimId}/clarify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentAnswer, revisedText })
      });
    } catch {}
  };

  const handleApproveApplication = async () => {
    // Check unresolved claims
    const unresolved = profile.claims.filter(
      c => !c.resolved && application.includedClaimIds.includes(c.id)
    );
    if (unresolved.length > 0) {
      throw new Error(
        `Approval blocked: Claim "${unresolved[0].text}" is unresolved. Please clarify individual ownership first.`
      );
    }

    const updatedApp: ApplicationDraft = {
      ...application,
      status: 'Approved',
      approvedVersion: application.resumeVersion,
      approvedAt: new Date().toISOString()
    };
    setApplication(updatedApp);
    addActivity(`Approved application draft v${updatedApp.approvedVersion} for ${application.role}.`, 'application');

    try {
      const res = await fetch('/api/application/approve', { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Approval failed');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Approval blocked')) throw err;
    }
  };

  const handleSimulateSend = async () => {
    // Enforce approval
    if (application.status !== 'Approved') {
      return {
        error: 'Sending blocked: Application must be approved before simulating transmission.'
      };
    }
    if (application.approvedVersion !== application.resumeVersion) {
      return {
        error: 'Sending blocked: Draft modified after approval. Please re-approve before sending.'
      };
    }

    // Check duplicate send
    if (application.simulatedReceiptId && application.simulatedSentAt) {
      return {
        alreadySent: true,
        receiptId: application.simulatedReceiptId,
        success: true
      };
    }

    const receiptId = `AVIOR-SIM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const sentAt = new Date().toISOString();

    const updatedApp: ApplicationDraft = {
      ...application,
      status: 'Simulated sent',
      simulatedSentAt: sentAt,
      simulatedReceiptId: receiptId
    };
    setApplication(updatedApp);
    addActivity(`Simulated application dispatch to ${application.company}. Receipt: ${receiptId}`, 'application');

    try {
      const res = await fetch('/api/application/simulate-send', { method: 'POST' });
      const data = await res.json();
      return {
        success: true,
        receiptId: data.receiptId || receiptId,
        alreadySent: data.alreadySent
      };
    } catch {
      return { success: true, receiptId };
    }
  };

  const handleCreateReminder = async (title: string, dueDateTime: string, notes?: string) => {
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title,
      dueDateTime,
      jobRole: application.role,
      notes,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setReminders(prev => [newRem, ...prev]);
    addActivity(`Created reminder: "${title}".`, 'reminder');

    try {
      await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, dueDateTime, notes })
      });
    } catch {}
  };

  const handleToggleReminder = async (id: string, completed: boolean) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, completed } : r))
    );
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
    } catch {}
  };

  const handleSubmitInterviewAnswer = async (
    mode: InterviewAttempt['mode'],
    question: string,
    context: string,
    answer: string
  ): Promise<InterviewAttempt> => {
    // Generate feedback or submit to backend
    let attempt: InterviewAttempt;

    try {
      const res = await fetch('/api/interview/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, question, context, userAnswer: answer })
      });
      if (res.ok) {
        attempt = await res.json();
      } else {
        throw new Error('Server error');
      }
    } catch {
      // Local fallback evaluation
      attempt = {
        id: `att-${Date.now()}`,
        mode,
        question,
        context,
        userAnswer: answer,
        feedback: {
          whatWasClear: 'Explained the composite unique constraint mechanism cleanly.',
          whatNeedsImprovement: 'Could mention how Flask caught the database exception and returned HTTP 409.',
          practicalSuggestion: 'State: "UNIQUE(student_id, session_date) guarantees idempotency at the database storage engine layer."',
          followUpQuestion: 'How would you measure the query execution plan in PostgreSQL or SQLite to prove your index is used?',
          identifiedWeakArea: 'Database Constraint Verification & HTTP Status Mapping'
        },
        timestamp: new Date().toISOString()
      };
    }

    setInterviewHistory(prev => [attempt, ...prev]);
    if (attempt.feedback.identifiedWeakArea) {
      setWeakAreas(prev => {
        const existing = prev.find(w => w.topic === attempt.feedback.identifiedWeakArea);
        if (existing) {
          return prev.map(w => w.id === existing.id ? { ...w, practicedCount: w.practicedCount + 1 } : w);
        }
        return [
          ...prev,
          {
            id: `wa-${Date.now()}`,
            topic: attempt.feedback.identifiedWeakArea!,
            details: attempt.feedback.whatNeedsImprovement,
            practicedCount: 1
          }
        ];
      });
    }

    addActivity(`Practised interview question on ${context}.`, 'interview');
    return attempt;
  };

  const handleSendMessage = async (text: string) => {
    setIsChatLoading(true);

    const studentMsg: ChatMessage = {
      id: `msg-${Date.now()}-student`,
      sender: 'student',
      content: text,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, studentMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      if (data && data.message) {
        setChatMessages(prev => [...prev, data.message]);
        if (data.message.isSimulatedDemo !== undefined) {
          setIsDemoMode(data.message.isSimulatedDemo);
        }
      }
    } catch (err) {
      // Client-side fallback response if network disconnected
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        content: `I've noted that. When presenting your ${profile.projectTitle}, focusing on your specific database contribution (the relational schema and indexing) provides interviewers with concrete proof of your skill.`,
        timestamp: new Date().toISOString(),
        isSimulatedDemo: true,
        suggestedActions: [
          { label: 'View Opportunities', actionType: 'navigate', target: 'opportunities' },
          { label: 'Application Studio', actionType: 'navigate', target: 'studio' }
        ]
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Pending clarification count
  const pendingClarificationCount = profile.claims.filter(c => !c.resolved).length;

  // Check for any currently due reminders for in-app banner
  const dueReminders = reminders.filter(r => !r.completed && new Date(r.dueDateTime) <= new Date());

  const currentJob = jobs.find(j => j.id === application.jobId) || jobs[0];

  return (
    <div className="min-h-screen bg-[#F4EDE0] text-[#14213D] flex flex-col md:flex-row antialiased selection:bg-[#FF6B5B]/20">
      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isChatOpen={isChatOpen}
        toggleChat={() => setIsChatOpen(!isChatOpen)}
        pendingClarificationCount={pendingClarificationCount}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isChatOpen={isChatOpen}
          toggleChat={() => setIsChatOpen(!isChatOpen)}
          reminders={reminders}
          onOpenReminders={() => setIsRemindersOpen(true)}
          onResetSample={handleResetSample}
          studentName={profile.name}
          targetRole={profile.targetRole}
        />

        {/* Observable In-App Due Reminder Banner */}
        {dueReminders.length > 0 && !dueBannerDismissed && (
          <div className="bg-[#14213D] text-[#F4EDE0] px-6 py-2.5 border-b border-[#1E2F52] flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[#FF6B5B] animate-pulse" />
              <span>
                <strong>Reminder Due:</strong> {dueReminders[0].title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsRemindersOpen(true)}
                className="text-[#FF6B5B] hover:text-[#FF6B5B]/80 font-bold underline underline-offset-2"
              >
                View Reminders
              </button>
              <button
                onClick={() => setDueBannerDismissed(true)}
                className="text-white/60 hover:text-white"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'welcome' && (
            <WelcomeProfile
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onResetSample={handleResetSample}
              onContinue={() => setActiveTab('overview')}
            />
          )}

          {activeTab === 'overview' && (
            <Overview
              profile={profile}
              application={application}
              jobs={jobs}
              reminders={reminders}
              activities={activities}
              onNavigate={setActiveTab}
              onOpenSourceModal={(claimId) => {
                setSelectedClaimModal(claimId);
                setActiveTab('studio');
              }}
              onSelectJobForApplication={handleSelectJobForApplication}
              gapReport={gapReport}
              roadmap={roadmap}
              onToggleRoadmapTask={handleToggleRoadmapTask}
            />
          )}

          {activeTab === 'opportunities' && (
            <Opportunities
              jobs={jobs}
              profile={profile}
              onSelectJobForApplication={handleSelectJobForApplication}
              savedJobIds={savedJobIds}
              onToggleSaveJob={handleToggleSaveJob}
              onNavigateToStudio={() => setActiveTab('studio')}
              onNavigateToPractice={() => setActiveTab('practice')}
              activeAnalysis={jobAnalysis}
              activeGapReport={gapReport}
              activeRoadmap={roadmap}
              onAnalyzeJob={handleAnalyzeJob}
              onToggleRoadmapTask={handleToggleRoadmapTask}
            />
          )}

          {activeTab === 'studio' && (
            <ApplicationStudio
              application={application}
              claims={profile.claims}
              profile={profile}
              onSaveDraft={handleSaveDraft}
              onClarifyClaim={handleClarifyClaim}
              onNavigateToTracker={() => setActiveTab('tracker')}
              selectedClaimIdModal={selectedClaimModal}
              onCloseClaimModal={() => setSelectedClaimModal(null)}
            />
          )}

          {activeTab === 'tracker' && (
            <ApprovalTracker
              application={application}
              profile={profile}
              job={currentJob}
              reminders={reminders}
              onApproveApplication={handleApproveApplication}
              onSimulateSend={handleSimulateSend}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'practice' && (
            <InterviewPractice
              profile={profile}
              application={application}
              history={interviewHistory}
              weakAreas={weakAreas}
              jobQuestions={jobQuestions}
              onSubmitAnswer={handleSubmitInterviewAnswer}
            />
          )}
        </main>
      </div>

      {/* Persistent, Collapsible Chat Panel on the right */}
      <ChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isLoading={isChatLoading}
        onNavigate={(tab) => {
          setActiveTab(tab);
          // On mobile, close chat when navigating
          if (window.innerWidth < 768) {
            setIsChatOpen(false);
          }
        }}
        isDemoMode={isDemoMode}
      />

      {/* Reminders Modal */}
      <RemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        reminders={reminders}
        onCreateReminder={handleCreateReminder}
        onToggleComplete={handleToggleReminder}
      />
    </div>
  );
}

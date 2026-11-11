import React, { useState } from 'react';
import {
  Brain,
  Send,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  Briefcase,
  History,
  Target,
  Sparkles as SparklesIcon,
  Tag
} from 'lucide-react';
import { StudentProfile, ApplicationDraft, InterviewAttempt, SavedWeakArea, InterviewFeedback, JobInterviewQuestion } from '../types';

interface InterviewPracticeProps {
  profile: StudentProfile;
  application: ApplicationDraft;
  history: InterviewAttempt[];
  weakAreas: SavedWeakArea[];
  jobQuestions?: JobInterviewQuestion[];
  onSubmitAnswer: (mode: InterviewAttempt['mode'], question: string, context: string, answer: string) => Promise<InterviewAttempt>;
}

export const InterviewPractice: React.FC<InterviewPracticeProps> = ({
  profile,
  application,
  history,
  weakAreas,
  jobQuestions = [],
  onSubmitAnswer
}) => {
  const [mode, setMode] = useState<InterviewAttempt['mode']>('Target role questions (5)');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<InterviewAttempt | null>(history[0] || null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Question banks based on student project and target role
  const projectQuestions = [
    {
      question: 'How did you prevent duplicate attendance records in your college project schema?',
      context: 'College Attendance System — Database tier & unique constraints',
      category: 'Database Deep-dive'
    },
    {
      question: 'Why did you choose this relational database structure instead of an unindexed JSON store?',
      context: 'Schema design & query performance',
      category: 'Architecture'
    },
    {
      question: 'How would your Flask API handle concurrent attendance submissions from 50 classrooms at 9:00 AM?',
      context: 'Transaction isolation & locking considerations',
      category: 'Concurrency'
    },
    {
      question: 'Which parts of the attendance system were built by teammates, and how did your database interface with their code?',
      context: 'Collaborative ownership boundaries & API contracts',
      category: 'Ownership & Collaboration'
    }
  ];

  const roleQuestions = [
    {
      question: `What specific Python and SQL practices make you a reliable fit for the ${application.role} position at ${application.company}?`,
      context: `${application.role} — Production readiness`,
      category: 'Role Alignment'
    },
    {
      question: 'When an index speeds up SELECT queries, what cost does it impose on INSERT and UPDATE operations?',
      context: 'Database index tradeoffs',
      category: 'Core Computer Science'
    },
    {
      question: 'How do you design a RESTful API endpoint to ensure idempotent behavior upon network timeouts?',
      context: 'HTTP & API design fundamentals',
      category: 'API Design'
    }
  ];

  const weakAreaQuestions = weakAreas.map(w => ({
    question: `Let's drill your saved weak area: "${w.topic}". Can you walk through your solution and how you test it?`,
    context: w.details,
    category: 'Weak Area Drill'
  }));

  const aiTargetQuestions = jobQuestions.map(q => ({
    question: q.question,
    context: `${application.role} · ${q.context}`,
    category: q.category,
    expectedKeyPoints: q.expectedKeyPoints
  }));

  // Select questions based on mode
  let questionsList = aiTargetQuestions.length > 0 ? aiTargetQuestions : projectQuestions;
  if (mode === 'Target role questions (5)') {
    questionsList = aiTargetQuestions.length > 0 ? aiTargetQuestions : projectQuestions;
  } else if (mode === 'Project interview') {
    questionsList = projectQuestions;
  } else if (mode === 'Role-specific practice') {
    questionsList = roleQuestions;
  } else if (mode === 'Practise a saved weak area') {
    questionsList = weakAreaQuestions.length > 0 ? weakAreaQuestions : projectQuestions;
  }

  const activeQuestionItem = questionsList[currentQuestionIndex % questionsList.length];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isEvaluating) return;

    setErrorNotice(null);
    setIsEvaluating(true);

    try {
      const attempt = await onSubmitAnswer(
        mode,
        activeQuestionItem.question,
        activeQuestionItem.context,
        userAnswer.trim()
      );
      setLatestAttempt(attempt);
      setUserAnswer('');
    } catch (err: any) {
      setErrorNotice('Failed to submit answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
    setUserAnswer('');
    setLatestAttempt(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DFCF] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#14213D] font-display">
              Technical Interview Practice
            </h1>
            <p className="text-xs sm:text-sm text-[#14213D]/70 mt-1">
              Practise real questions grounded in your project facts and role requirements.
            </p>
          </div>

          <div className="text-[11px] font-mono text-[#14213D]/60 bg-[#FAF7F2] p-2 rounded-lg border border-[#E8DFCF]">
            Feedback evaluates technical precision · No hiring probability claims
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF7F2] rounded-xl border border-[#E8DFCF] overflow-x-auto">
          <button
            onClick={() => {
              setMode('Target role questions (5)');
              setCurrentQuestionIndex(0);
              setLatestAttempt(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              mode === 'Target role questions (5)'
                ? 'bg-[#14213D] text-[#F4EDE0] shadow-sm'
                : 'text-[#334155] hover:text-[#0F172A] hover:bg-white/80'
            }`}
          >
            <SparklesIcon className="w-3.5 h-3.5 text-[#FF6B5B]" />
            <span>Target Role Questions ({jobQuestions.length || 5})</span>
          </button>

          <button
            onClick={() => {
              setMode('Project interview');
              setCurrentQuestionIndex(0);
              setLatestAttempt(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              mode === 'Project interview'
                ? 'bg-[#14213D] text-[#F4EDE0] shadow-sm'
                : 'text-[#334155] hover:text-[#0F172A] hover:bg-white/80'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-[#FF6B5B]" />
            <span>Project Deep-Dive</span>
          </button>

          <button
            onClick={() => {
              setMode('Role-specific practice');
              setCurrentQuestionIndex(0);
              setLatestAttempt(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              mode === 'Role-specific practice'
                ? 'bg-[#14213D] text-[#F4EDE0] shadow-sm'
                : 'text-[#334155] hover:text-[#0F172A] hover:bg-white/80'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-[#FF6B5B]" />
            <span>Role Fundamentals</span>
          </button>

          <button
            onClick={() => {
              setMode('Practise a saved weak area');
              setCurrentQuestionIndex(0);
              setLatestAttempt(null);
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              mode === 'Practise a saved weak area'
                ? 'bg-[#14213D] text-[#F4EDE0] shadow-sm'
                : 'text-[#334155] hover:text-[#0F172A] hover:bg-white/80'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-[#FF6B5B]" />
            <span>Saved Weak Areas ({weakAreas.length})</span>
          </button>
        </div>
      </div>

      {errorNotice && (
        <div className="p-3 bg-red-50 text-red-900 rounded-lg text-xs border border-red-200 font-medium">
          {errorNotice}
        </div>
      )}

      {/* Simulator Workspace: Question & Answer (One question at a time) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Question & Input Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-3">
            <span className="text-xs font-mono font-bold text-[#475569] uppercase">
              Question {(currentQuestionIndex % questionsList.length) + 1} of {questionsList.length}
            </span>
            <button
              onClick={handleNextQuestion}
              className="text-xs font-bold text-[#14213D] hover:text-[#FF6B5B] flex items-center gap-1"
            >
              <span>Next question</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Active Question Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#FAF7F2] border border-[#E8DFCF] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-semibold text-[#475569] uppercase tracking-wide">
                Context: {activeQuestionItem.context}
              </span>
              {(activeQuestionItem as any).category && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#14213D]/10 text-[#14213D]">
                  {(activeQuestionItem as any).category}
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#0F172A] leading-snug">
              {activeQuestionItem.question}
            </h2>

            {(activeQuestionItem as any).expectedKeyPoints && (activeQuestionItem as any).expectedKeyPoints.length > 0 && (
              <div className="pt-2 border-t border-[#E8DFCF]/70">
                <div className="text-[11px] font-bold text-[#334155] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3 text-[#FF6B5B]" />
                  <span>Key topics interviewers look for:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(activeQuestionItem as any).expectedKeyPoints.map((pt: string, pIdx: number) => (
                    <span key={pIdx} className="text-[11px] font-medium text-[#1E293B] bg-white px-2 py-0.5 rounded border border-[#E8DFCF]">
                      • {pt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Answer Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1.5">
                Your Answer (Type as you would speak in an interview)
              </label>
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                rows={6}
                disabled={isEvaluating}
                placeholder="Explain the technical mechanism, the tradeoff you chose, and how you verified it..."
                className="w-full p-3.5 rounded-lg border border-[#CBD5E1] focus:border-[#14213D] text-xs sm:text-sm text-[#0F172A] placeholder-[#64748B] leading-relaxed bg-white outline-hidden font-mono resize-y"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#475569] font-medium">
                Be specific: mention database constraints, HTTP codes, or test scripts.
              </span>
              <button
                type="submit"
                disabled={!userAnswer.trim() || isEvaluating}
                className={`px-5 py-2.5 rounded-lg font-extrabold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs ${
                  !userAnswer.trim() || isEvaluating
                    ? 'bg-[#E8DFCF] text-[#64748B] cursor-not-allowed'
                    : 'bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D]'
                }`}
              >
                <Brain className="w-4 h-4" />
                <span>{isEvaluating ? 'Evaluating...' : 'Submit & Get Feedback'}</span>
              </button>
            </div>
          </form>

          {/* Structured Feedback Breakdown if attempt submitted */}
          {latestAttempt && (
            <div className="mt-6 pt-6 border-t border-[#E8DFCF] space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B5B]" />
                <h3 className="font-display font-bold text-sm text-[#14213D]">
                  Structured Technical Feedback
                </h3>
              </div>

              <div className="space-y-3">
                {/* 1. What was clear */}
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>What was clear</span>
                  </div>
                  <p className="text-emerald-950 leading-relaxed pl-5">
                    {latestAttempt.feedback.whatWasClear}
                  </p>
                </div>

                {/* 2. What needs improvement */}
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>What needs improvement</span>
                  </div>
                  <p className="text-amber-950 leading-relaxed pl-5">
                    {latestAttempt.feedback.whatNeedsImprovement}
                  </p>
                </div>

                {/* 3. Practical suggestion */}
                <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                    <Lightbulb className="w-3.5 h-3.5 text-[#FF6B5B] shrink-0" />
                    <span>Practical phrasing suggestion</span>
                  </div>
                  <p className="text-[#0F172A] leading-relaxed pl-5 font-mono">
                    {latestAttempt.feedback.practicalSuggestion}
                  </p>
                </div>

                {/* 4. Useful follow-up question */}
                <div className="p-3.5 rounded-lg bg-[#14213D] text-[#F4EDE0] text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#FF6B5B]">
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Useful follow-up question to prepare</span>
                  </div>
                  <p className="text-[#F4EDE0] leading-relaxed pl-5">
                    "{latestAttempt.feedback.followUpQuestion}"
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleNextQuestion}
                  className="px-4 py-2 rounded-lg bg-[#14213D] text-white hover:bg-[#1E2F52] text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Practise Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Weak Areas & Practice History (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Saved Weak Areas */}
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-2.5">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#FF6B5B]" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#0F172A]">
                  Identified Weak Areas
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-[#475569]">
                {weakAreas.length} Saved
              </span>
            </div>

            {weakAreas.length === 0 ? (
              <p className="text-xs text-[#475569] py-2">
                No weak areas identified yet. They will appear here automatically when feedback spots gaps.
              </p>
            ) : (
              <div className="space-y-2">
                {weakAreas.map(wa => (
                  <div
                    key={wa.id}
                    className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-[#0F172A]">
                      <span>{wa.topic}</span>
                      <span className="text-[10px] font-mono text-[#475569] font-normal">
                        Practiced {wa.practicedCount}x
                      </span>
                    </div>
                    <p className="text-[11px] text-[#334155]">{wa.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Attempts History */}
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#FF6B5B]" />
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#0F172A]">
                  Past Practice Attempts
                </h3>
              </div>
              <span className="text-[11px] font-mono font-medium text-[#475569]">
                {history.length} logged
              </span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {history.map(att => (
                <div
                  key={att.id}
                  onClick={() => setLatestAttempt(att)}
                  className="p-3 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] hover:border-[#14213D] transition-colors cursor-pointer text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#475569]">
                    <span>{att.mode}</span>
                    <span>{new Date(att.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="font-bold text-[#0F172A] line-clamp-1">
                    {att.question}
                  </div>
                  <div className="text-[11px] text-emerald-900 font-semibold line-clamp-1">
                    Clear: {att.feedback.whatWasClear}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

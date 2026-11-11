import React, { useState } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  FileCheck2,
  Calendar,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Info,
  FilePlus,
  Loader2,
  X,
  Target,
  Brain,
  ListChecks,
  Check
} from 'lucide-react';
import {
  JobOpportunity,
  StudentProfile,
  JobDescriptionAnalysis,
  SkillGapReport,
  PreparationRoadmap
} from '../types';

interface OpportunitiesProps {
  jobs: JobOpportunity[];
  profile: StudentProfile;
  onSelectJobForApplication: (jobId: string) => void;
  savedJobIds: string[];
  onToggleSaveJob: (jobId: string) => void;
  onNavigateToStudio: () => void;
  onNavigateToPractice: () => void;
  activeAnalysis?: JobDescriptionAnalysis | null;
  activeGapReport?: SkillGapReport | null;
  activeRoadmap?: PreparationRoadmap | null;
  onAnalyzeJob: (jobId?: string, customJd?: string, customRole?: string, customCompany?: string) => Promise<any>;
  onToggleRoadmapTask?: (taskId: string, dayNumber?: number) => Promise<any>;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({
  jobs,
  profile,
  onSelectJobForApplication,
  savedJobIds,
  onToggleSaveJob,
  onNavigateToStudio,
  onNavigateToPractice,
  activeAnalysis,
  activeGapReport,
  activeRoadmap,
  onAnalyzeJob,
  onToggleRoadmapTask
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Internship' | 'Full-time' | 'saved'>('all');
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobOpportunity | null>(null);

  // Custom Job Description Intake Modal
  const [isCustomJdOpen, setIsCustomJdOpen] = useState(false);
  const [customRole, setCustomRole] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customJdText, setCustomJdText] = useState('');

  // Active Analysis Drawer / Modal
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingJobId, setAnalyzingJobId] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'saved') {
      return savedJobIds.includes(job.id);
    }
    if (filterType !== 'all') {
      return job.type === filterType;
    }
    return true;
  });

  const handleRunAnalysis = async (jobId?: string, customText?: string, role?: string, company?: string) => {
    setAnalysisError(null);
    setIsAnalyzing(true);
    if (jobId) setAnalyzingJobId(jobId);

    try {
      await onAnalyzeJob(jobId, customText, role, company);
      setIsAnalysisDrawerOpen(true);
      if (isCustomJdOpen) setIsCustomJdOpen(false);
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to complete AI analysis. Please verify your connection.');
    } finally {
      setIsAnalyzing(false);
      setAnalyzingJobId(null);
    }
  };

  const handleCustomJdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customJdText.trim()) return;
    await handleRunAnalysis(
      undefined,
      customJdText.trim(),
      customRole.trim() || 'Software Engineer Intern',
      customCompany.trim() || 'Custom Organization'
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header, Search & Custom JD Trigger */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#CBD5E1] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] font-display tracking-tight">
              Opportunities & AI Job Analysis
            </h1>
            <p className="text-xs sm:text-sm text-[#334155] mt-1 font-medium">
              Explore 10 curated listings or paste any real job description to generate an instant skill-gap report and 7-day plan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomJdOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-extrabold text-xs uppercase tracking-wide transition-all flex items-center gap-1.5 shadow-xs"
            >
              <FilePlus className="w-4 h-4" />
              <span>Paste Custom JD</span>
            </button>

            {activeGapReport && (
              <button
                onClick={() => setIsAnalysisDrawerOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-[#FAF7F2] hover:bg-[#E2D9C8] text-[#0F172A] text-xs font-bold border border-[#CBD5E1] transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#FF6B5B]" />
                <span>View Active Roadmap</span>
              </button>
            )}
          </div>
        </div>

        {/* Search bar & Type filter segmented controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by role, fictional company, skill (e.g. Python, SQL, Docker)..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-[#CBD5E1] focus:border-[#14213D] bg-white outline-hidden text-[#0F172A] placeholder-[#64748B]"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-lg border border-[#CBD5E1] w-full sm:w-auto overflow-x-auto shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                  : 'text-[#334155] font-semibold hover:text-[#0F172A]'
              }`}
            >
              All (10)
            </button>
            <button
              onClick={() => setFilterType('Internship')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
                filterType === 'Internship'
                  ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                  : 'text-[#334155] font-semibold hover:text-[#0F172A]'
              }`}
            >
              Internships
            </button>
            <button
              onClick={() => setFilterType('Full-time')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
                filterType === 'Full-time'
                  ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                  : 'text-[#334155] font-semibold hover:text-[#0F172A]'
              }`}
            >
              Full-time
            </button>
            <button
              onClick={() => setFilterType('saved')}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap ${
                filterType === 'saved'
                  ? 'bg-white text-[#0F172A] shadow-xs font-bold'
                  : 'text-[#334155] font-semibold hover:text-[#0F172A]'
              }`}
            >
              Saved ({savedJobIds.length})
            </button>
          </div>
        </div>

        {analysisError && (
          <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-lg text-xs flex items-center justify-between">
            <span>{analysisError}</span>
            <button onClick={() => setAnalysisError(null)} className="text-red-900 font-bold ml-2">×</button>
          </div>
        )}

        <p className="text-xs text-[#475569] font-medium">
          A-viora explains matching skills transparently based on your verified code. Skill alignment is not an arbitrary hiring percentage or guarantee.
        </p>
      </div>

      {/* Listings Grid */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFFFF] rounded-xl border border-[#CBD5E1] space-y-3">
          <AlertCircle className="w-8 h-8 text-[#475569] mx-auto" />
          <h3 className="font-bold text-sm text-[#0F172A]">No opportunities match your filter</h3>
          <p className="text-xs text-[#334155]">
            Try adjusting your search query or reset the filter to view all listings.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="px-4 py-1.5 rounded-md bg-[#14213D] text-[#F8FAFC] text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredJobs.map(job => {
            const matchedSkills = job.requiredSkills.filter(s => profile.skills.includes(s));
            const missingSkills = job.requiredSkills.filter(s => !profile.skills.includes(s));
            const isSaved = savedJobIds.includes(job.id);
            const isTargetedInAnalysis = activeAnalysis?.role === job.role;

            return (
              <div
                key={job.id}
                className="p-5 sm:p-6 rounded-xl bg-[#FFFFFF] border border-[#CBD5E1] flex flex-col justify-between hover:border-[#14213D] transition-colors shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#475569] font-mono font-medium">
                        <span>{job.type}</span>
                        <span aria-hidden="true">·</span>
                        <span>{job.location}</span>
                        <span aria-hidden="true">·</span>
                        <span>Deadline {job.deadline}</span>
                      </div>

                      <h2 className="text-base sm:text-lg font-bold text-[#0F172A] font-display mt-0.5">
                        {job.role}
                      </h2>
                      <div className="text-xs font-bold text-[#334155]">
                        {job.company}
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleSaveJob(job.id)}
                      className={`p-2 rounded-lg border text-xs font-bold transition-colors ${
                        isSaved
                          ? 'bg-[#14213D] text-white border-[#14213D]'
                          : 'bg-[#FAF7F2] text-[#334155] border-[#CBD5E1] hover:text-[#0F172A]'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save opportunity'}
                      aria-label="Save opportunity"
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  <p className="text-xs text-[#334155] leading-relaxed">
                    {job.description}
                  </p>

                  {/* Skill Alignment Breakdown */}
                  <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#CBD5E1] space-y-1.5 text-xs">
                    <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6B5B]" />
                      <span>Skill Evidence Assessment</span>
                    </div>

                    <p className="text-[#334155]">
                      <strong className="text-emerald-800">Verified matches:</strong>{' '}
                      {matchedSkills.length > 0 ? matchedSkills.join(', ') : 'Computing fundamentals'}
                    </p>

                    {missingSkills.length > 0 && (
                      <p className="text-[#334155]">
                        <strong className="text-amber-900">Growth areas:</strong>{' '}
                        {missingSkills.join(', ')}
                      </p>
                    )}

                    <p className="text-[#475569] text-[11px] pt-1">
                      <strong>Relevance to your project:</strong> {job.whyRelevant}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-3 border-t border-[#CBD5E1] flex flex-wrap items-center justify-between gap-2.5">
                  <button
                    onClick={() => handleRunAnalysis(job.id)}
                    disabled={isAnalyzing}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#E2D9C8] text-[#0F172A] text-xs font-bold border border-[#CBD5E1] transition-colors flex items-center gap-1.5"
                  >
                    {isAnalyzing && analyzingJobId === job.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FF6B5B]" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6B5B]" />
                    )}
                    <span>{isTargetedInAnalysis ? 'View AI Roadmap' : 'AI Match & 7-Day Plan'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedJobDetails(job)}
                      className="text-xs font-bold text-[#334155] hover:text-[#0F172A] px-2 py-1.5"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => {
                        onSelectJobForApplication(job.id);
                        onNavigateToStudio();
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-extrabold text-xs uppercase tracking-wide transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Prepare Draft</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Job Description Modal */}
      {isCustomJdOpen && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-[#CBD5E1] space-y-4">
            <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-3">
              <div className="flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-[#FF6B5B]" />
                <h2 className="font-display font-bold text-base text-[#0F172A]">
                  Paste Custom Job Description for AI Analysis
                </h2>
              </div>
              <button
                onClick={() => setIsCustomJdOpen(false)}
                className="p-1 rounded-md text-[#334155] hover:text-[#0F172A] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomJdSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Job Role / Title
                  </label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value)}
                    placeholder="e.g. Backend Engineer Intern"
                    className="w-full p-2.5 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:border-[#14213D]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={e => setCustomCompany(e.target.value)}
                    placeholder="e.g. Acme Tech Labs"
                    className="w-full p-2.5 text-xs rounded-lg border border-[#CBD5E1] bg-white text-[#0F172A] focus:border-[#14213D]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-1">
                  Job Description Text
                </label>
                <textarea
                  value={customJdText}
                  onChange={e => setCustomJdText(e.target.value)}
                  rows={8}
                  placeholder="Paste the full job posting text here (responsibilities, technical requirements, qualifications)..."
                  className="w-full p-3 text-xs font-mono text-[#0F172A] rounded-lg border border-[#CBD5E1] bg-white focus:border-[#14213D] leading-relaxed"
                  required
                />
              </div>

              <div className="pt-2 border-t border-[#CBD5E1] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCustomJdOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#334155]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing || !customJdText.trim()}
                  className="px-5 py-2 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-extrabold text-xs uppercase tracking-wide transition-colors flex items-center gap-2 shadow-xs"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Job with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Run AI Analysis & Match</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Skill Gap Report & 7-Day Roadmap Drawer / Modal */}
      {isAnalysisDrawerOpen && activeGapReport && activeRoadmap && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-[#CBD5E1] space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#CBD5E1] pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#475569]">
                  <Sparkles className="w-4 h-4 text-[#FF6B5B]" />
                  <span>AI Match Assessment & Preparation Plan</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#0F172A] font-display mt-1">
                  {activeGapReport.jobRole} — {activeGapReport.company}
                </h2>
                <div className="mt-1">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {activeGapReport.confidenceAlignment}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsAnalysisDrawerOpen(false)}
                className="p-1.5 rounded-md text-[#334155] hover:text-[#0F172A] hover:bg-[#FAF7F2]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assessment Narrative */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#CBD5E1] space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F172A]">
                Match Summary
              </h3>
              <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed">
                {activeGapReport.matchAssessment}
              </p>
            </div>

            {/* Side-by-side Skill Matrix: Matched vs Missing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Verified Candidate Skills ({activeGapReport.matchedSkills.length})</span>
                </div>
                <div className="space-y-2">
                  {activeGapReport.matchedSkills.map(m => (
                    <div key={m.skill} className="text-xs space-y-0.5">
                      <div className="font-bold text-emerald-950">{m.skill}</div>
                      <div className="text-[11px] text-emerald-800 font-mono italic">"{m.evidence}"</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Skills / Growth Gaps */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2.5">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-amber-800" />
                  <span>Identified Growth Gaps ({activeGapReport.missingSkills.length})</span>
                </div>
                <div className="space-y-2">
                  {activeGapReport.missingSkills.map(m => (
                    <div key={m.skill} className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-950">{m.skill}</span>
                        <span className="text-[10px] uppercase font-mono font-bold text-amber-900">
                          {m.importance} Priority
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-snug">{m.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7-Day Personalized Preparation Roadmap */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#FF6B5B]" />
                  <h3 className="font-display font-bold text-sm text-[#0F172A]">
                    7-Day Actionable Preparation Roadmap
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#334155] font-semibold">
                  {activeRoadmap.dailyPlan.filter(d => d.completed).length} of 7 Days Completed
                </span>
              </div>

              <div className="space-y-2">
                {activeRoadmap.dailyPlan.map(day => (
                  <div
                    key={day.id}
                    className={`p-3 rounded-lg border text-xs transition-colors flex items-start gap-3 ${
                      day.completed ? 'bg-[#FAF7F2] border-[#CBD5E1] opacity-75' : 'bg-white border-[#CBD5E1]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleRoadmapTask && onToggleRoadmapTask(day.id, day.dayNumber)}
                      className="mt-0.5 text-[#0F172A] hover:text-[#FF6B5B]"
                      title="Toggle completion"
                    >
                      {day.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#CBD5E1]" />
                      )}
                    </button>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${day.completed ? 'line-through text-[#475569]' : 'text-[#0F172A]'}`}>
                          Day {day.dayNumber}: {day.title}
                        </span>
                        <span className="text-[11px] font-mono text-[#475569]">
                          ~{day.estimatedHours} hrs
                        </span>
                      </div>
                      <p className="text-xs text-[#334155]">{day.objective}</p>
                      <ul className="list-disc pl-4 text-[11px] text-[#475569] space-y-0.5 pt-0.5">
                        {day.tasks.map((t, tidx) => (
                          <li key={tidx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Action Buttons */}
            <div className="pt-4 border-t border-[#CBD5E1] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setIsAnalysisDrawerOpen(false)}
                className="px-4 py-2 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#334155]"
              >
                Close Plan
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsAnalysisDrawerOpen(false);
                    onNavigateToPractice();
                  }}
                  className="px-4 py-2 rounded-lg bg-[#14213D] hover:bg-[#1E2F52] text-[#F8FAFC] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Brain className="w-4 h-4 text-[#FF6B5B]" />
                  <span>Practise 5 Job Questions</span>
                </button>

                <button
                  onClick={() => {
                    setIsAnalysisDrawerOpen(false);
                    onNavigateToStudio();
                  }}
                  className="px-4 py-2 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-extrabold text-xs uppercase tracking-wide transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Prepare Verified Application</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Details Modal */}
      {selectedJobDetails && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CBD5E1] space-y-4">
            <div className="flex items-start justify-between border-b border-[#CBD5E1] pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#475569] uppercase">
                  {selectedJobDetails.type} · {selectedJobDetails.location}
                </span>
                <h3 className="text-lg font-bold text-[#0F172A] font-display">
                  {selectedJobDetails.role}
                </h3>
                <div className="text-xs text-[#334155] font-bold">
                  {selectedJobDetails.company}
                </div>
              </div>
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="text-[#334155] hover:text-[#0F172A] font-bold text-base"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#334155]">
              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">Role Description</h4>
                <p>{selectedJobDetails.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">Application Deadline</h4>
                <p className="font-mono text-[#0F172A]">{selectedJobDetails.deadline}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0F172A] mb-1">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedJobDetails.requiredSkills.map(s => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#CBD5E1] text-[#0F172A] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#CBD5E1] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#CBD5E1] text-xs font-semibold text-[#334155]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectJobForApplication(selectedJobDetails.id);
                  setSelectedJobDetails(null);
                  onNavigateToStudio();
                }}
                className="px-4 py-1.5 rounded-lg bg-[#FF6B5B] text-[#14213D] font-extrabold text-xs uppercase shadow-xs hover:bg-[#E05A4A]"
              >
                Prepare Application Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

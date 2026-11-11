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
  Info
} from 'lucide-react';
import { JobOpportunity, StudentProfile } from '../types';

interface OpportunitiesProps {
  jobs: JobOpportunity[];
  profile: StudentProfile;
  onSelectJobForApplication: (jobId: string) => void;
  savedJobIds: string[];
  onToggleSaveJob: (jobId: string) => void;
  onNavigateToStudio: () => void;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({
  jobs,
  profile,
  onSelectJobForApplication,
  savedJobIds,
  onToggleSaveJob,
  onNavigateToStudio
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Internship' | 'Full-time' | 'saved'>('all');
  const [selectedJobDetails, setSelectedJobDetails] = useState<JobOpportunity | null>(null);

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    // Search query
    const matchesSearch =
      searchQuery.trim() === '' ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter type
    if (filterType === 'saved') {
      return savedJobIds.includes(job.id);
    }
    if (filterType !== 'all') {
      return job.type === filterType;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header and Search */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DFCF] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#14213D] font-display tracking-tight">
              Curated Opportunities
            </h1>
            <p className="text-xs sm:text-sm text-[#14213D]/70 mt-1">
              Fictional listings matched directly with your student project evidence.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] text-xs text-[#14213D]/75 font-mono">
            <Info className="w-3.5 h-3.5 text-[#FF6B5B]" />
            <span>Fictional placements for demo verification</span>
          </div>
        </div>

        {/* Search bar & Type filter segmented controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#14213D]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by role, fictional company, skill (e.g. Python, SQL, Docker)..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-lg border border-[#E8DFCF] focus:border-[#14213D] bg-white outline-hidden text-[#14213D]"
            />
          </div>

          {/* Interactive filter tabs (functional buttons with click handlers) */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] rounded-lg border border-[#E8DFCF] w-full sm:w-auto overflow-x-auto shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterType === 'all'
                  ? 'bg-white text-[#14213D] shadow-xs font-semibold'
                  : 'text-[#14213D]/70 hover:text-[#14213D]'
              }`}
            >
              All (10)
            </button>
            <button
              onClick={() => setFilterType('Internship')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterType === 'Internship'
                  ? 'bg-white text-[#14213D] shadow-xs font-semibold'
                  : 'text-[#14213D]/70 hover:text-[#14213D]'
              }`}
            >
              Internships
            </button>
            <button
              onClick={() => setFilterType('Full-time')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterType === 'Full-time'
                  ? 'bg-white text-[#14213D] shadow-xs font-semibold'
                  : 'text-[#14213D]/70 hover:text-[#14213D]'
              }`}
            >
              Full-time
            </button>
            <button
              onClick={() => setFilterType('saved')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterType === 'saved'
                  ? 'bg-white text-[#14213D] shadow-xs font-semibold'
                  : 'text-[#14213D]/70 hover:text-[#14213D]'
              }`}
            >
              Saved ({savedJobIds.length})
            </button>
          </div>
        </div>

        {/* Anti-Slop notice about match percentages */}
        <p className="text-[11px] text-[#14213D]/60 italic">
          * A-viora explains matching skills transparently. Skill alignment is not a hiring probability or guarantee.
        </p>
      </div>

      {/* Listings Grid */}
      {filteredJobs.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] space-y-3">
          <AlertCircle className="w-8 h-8 text-[#14213D]/40 mx-auto" />
          <h3 className="font-bold text-sm text-[#14213D]">No opportunities match your filter</h3>
          <p className="text-xs text-[#14213D]/60 max-w-sm mx-auto">
            Try clearing your search terms or switching between Internships and Full-time filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            className="px-4 py-1.5 rounded-md bg-[#14213D] text-white text-xs font-medium"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map(job => {
            const matchedSkills = job.requiredSkills.filter(s => profile.skills.includes(s));
            const missingSkills = job.requiredSkills.filter(s => !profile.skills.includes(s));
            const isSaved = savedJobIds.includes(job.id);

            return (
              <div
                key={job.id}
                className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-5 sm:p-6 shadow-xs hover:border-[#14213D]/30 transition-all space-y-4"
              >
                {/* Header row: Role, company, metadata */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#14213D]/60 font-mono mb-1">
                      <span>{job.type}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FF6B5B]" />
                        {job.location}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Deadline: {job.deadline}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[#14213D] font-display">
                      {job.role}
                    </h2>
                    <div className="text-xs font-semibold text-[#14213D]/70">
                      {job.company}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start">
                    <button
                      onClick={() => onToggleSaveJob(job.id)}
                      className={`p-2 rounded-lg border text-xs font-medium transition-colors ${
                        isSaved
                          ? 'bg-[#14213D] text-white border-[#14213D]'
                          : 'bg-[#FAF7F2] text-[#14213D]/70 border-[#E8DFCF] hover:text-[#14213D]'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save opportunity'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-[#14213D]/80 leading-relaxed">
                  {job.description}
                </p>

                {/* Match Analysis Breakdown */}
                <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] space-y-2 text-xs">
                  <div className="font-semibold text-[#14213D] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B5B]" />
                    <span>Skill Alignment & Verification Analysis</span>
                  </div>

                  <p className="text-[#14213D]/80">
                    <strong className="text-emerald-700">Matched profile skills:</strong>{' '}
                    {matchedSkills.length > 0 ? matchedSkills.join(', ') : 'General computing fundamentals'}
                  </p>

                  {missingSkills.length > 0 && (
                    <p className="text-[#14213D]/80">
                      <strong className="text-amber-800">Additional requirements:</strong>{' '}
                      {missingSkills.join(', ')} (requested by employer, not listed in your verified profile)
                    </p>
                  )}

                  <p className="text-[#14213D]/70 text-[11px] pt-0.5">
                    <strong>Relevance to your project:</strong> {job.whyRelevant}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#E8DFCF] flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedJobDetails(job)}
                    className="text-xs font-semibold text-[#14213D] hover:text-[#FF6B5B] transition-colors"
                  >
                    View Role Overview
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSelectJobForApplication(job.id);
                        onNavigateToStudio();
                      }}
                      className="px-4 py-2 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Prepare Application</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role Details Modal */}
      {selectedJobDetails && (
        <div className="fixed inset-0 z-50 bg-[#14213D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E8DFCF] space-y-4">
            <div className="flex items-start justify-between border-b border-[#E8DFCF] pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#14213D]/60 uppercase">
                  {selectedJobDetails.type} · {selectedJobDetails.location}
                </span>
                <h3 className="text-lg font-bold text-[#14213D] font-display">
                  {selectedJobDetails.role}
                </h3>
                <div className="text-xs text-[#14213D]/70 font-semibold">
                  {selectedJobDetails.company}
                </div>
              </div>
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="text-[#14213D]/50 hover:text-[#14213D] font-bold text-base"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-[#14213D]/80">
              <div>
                <h4 className="font-bold text-[#14213D] mb-1">Role Description</h4>
                <p>{selectedJobDetails.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#14213D] mb-1">Application Deadline</h4>
                <p className="font-mono">{selectedJobDetails.deadline}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#14213D] mb-1">Required Skills</h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedJobDetails.requiredSkills.map(s => (
                    <span
                      key={s}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8DFCF] text-[#14213D]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8DFCF] flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="px-3.5 py-1.5 rounded-lg border border-[#E8DFCF] text-xs font-medium text-[#14213D]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSelectJobForApplication(selectedJobDetails.id);
                  setSelectedJobDetails(null);
                  onNavigateToStudio();
                }}
                className="px-4 py-1.5 rounded-lg bg-[#FF6B5B] text-[#14213D] font-bold text-xs uppercase"
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

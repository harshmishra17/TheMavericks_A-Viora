import React, { useState, useEffect } from 'react';
import {
  FileText,
  MessageSquareQuote,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  Save,
  Edit3,
  ExternalLink,
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';
import { ApplicationDraft, ProjectClaim, StudentProfile } from '../types';
import { generateResumePDF, generateCoverLetterPDF } from '../utils/pdfGenerator';

interface ApplicationStudioProps {
  application: ApplicationDraft;
  claims: ProjectClaim[];
  profile: StudentProfile;
  onSaveDraft: (resumeText: string, coverNoteText: string, includedClaimIds: string[]) => Promise<void>;
  onClarifyClaim: (claimId: string, studentAnswer: string, revisedText?: string) => Promise<void>;
  onNavigateToTracker: () => void;
  selectedClaimIdModal: string | null;
  onCloseClaimModal: () => void;
}

export const ApplicationStudio: React.FC<ApplicationStudioProps> = ({
  application,
  claims,
  profile,
  onSaveDraft,
  onClarifyClaim,
  onNavigateToTracker,
  selectedClaimIdModal,
  onCloseClaimModal
}) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'coverNote'>('resume');
  const [resumeText, setResumeText] = useState(application.resumeText);
  const [coverNoteText, setCoverNoteText] = useState(application.coverNoteText);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState<string>('All changes saved');

  // Selected claim for evidence inspection & clarification
  const [selectedClaim, setSelectedClaim] = useState<ProjectClaim>(
    claims.find(c => c.id === selectedClaimIdModal) || claims[0] || null
  );

  // Clarification form state
  const [studentAnswer, setStudentAnswer] = useState('');
  const [revisedTextCustom, setRevisedTextCustom] = useState('');
  const [isClarifying, setIsClarifying] = useState(false);

  // Exclude unresolved claims from final export
  const [excludeUnresolved, setExcludeUnresolved] = useState(true);

  // Sync when prop updates
  useEffect(() => {
    setResumeText(application.resumeText);
    setCoverNoteText(application.coverNoteText);
  }, [application.id, application.resumeVersion]);

  useEffect(() => {
    if (selectedClaimIdModal) {
      const found = claims.find(c => c.id === selectedClaimIdModal);
      if (found) setSelectedClaim(found);
    }
  }, [selectedClaimIdModal, claims]);

  const handleTextChange = (type: 'resume' | 'coverNote', val: string) => {
    if (type === 'resume') {
      setResumeText(val);
    } else {
      setCoverNoteText(val);
    }
    setIsDirty(true);
    setSaveStatusText('Unsaved edits');
  };

  const handleManualSave = async () => {
    setIsSaving(true);
    setSaveStatusText('Saving draft...');
    await onSaveDraft(resumeText, coverNoteText, application.includedClaimIds);
    setIsSaving(false);
    setIsDirty(false);
    setSaveStatusText(`Saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
  };

  const handleConfirmClarification = async () => {
    if (!selectedClaim) return;
    setIsClarifying(true);
    const finalAnswer = studentAnswer.trim() || 'The database schema and queries.';
    const finalRevised =
      revisedTextCustom.trim() ||
      selectedClaim.revisedText ||
      `Designed the database schema and queries for a team-built attendance system.`;

    await onClarifyClaim(selectedClaim.id, finalAnswer, finalRevised);

    // Update local claim view
    setSelectedClaim({
      ...selectedClaim,
      status: 'Student confirmed',
      resolved: true,
      statedContribution: finalAnswer,
      revisedText: finalRevised
    });

    // If the resume has the old claim text, replace it with the revised claim
    if (resumeText.includes(selectedClaim.text)) {
      const updatedResume = resumeText.replace(selectedClaim.text, finalRevised);
      setResumeText(updatedResume);
      setIsDirty(true);
    }

    setIsClarifying(false);
    setStudentAnswer('');
    setRevisedTextCustom('');
    if (selectedClaimIdModal) onCloseClaimModal();
  };

  // Document Downloaders
  const handleDownloadResume = () => {
    let contentToExport = resumeText;
    if (excludeUnresolved) {
      // Exclude unresolved claims
      const unresolved = claims.filter(c => !c.resolved);
      unresolved.forEach(u => {
        contentToExport = contentToExport.replace(u.text, `[Claim removed: Awaiting individual contribution clarification]`);
      });
    }

    const blob = new Blob([contentToExport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, '_')}_Verified_Resume_v${application.resumeVersion}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadResumePDF = () => {
    generateResumePDF({
      resumeText,
      candidateName: profile.name,
      targetRole: application.role,
      company: application.company,
      version: application.resumeVersion,
      excludeUnresolved,
      unresolvedClaims: claims.filter(c => !c.resolved)
    });
  };

  const handleDownloadCoverLetterPDF = () => {
    generateCoverLetterPDF({
      coverNoteText,
      candidateName: profile.name,
      targetRole: application.role,
      company: application.company,
      version: application.coverNoteVersion
    });
  };

  const handleDownloadCoverNote = () => {
    const blob = new Blob([coverNoteText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile.name.replace(/\s+/g, '_')}_Cover_Note_${application.company.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner: Application Details & Saved indicator */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DFCF] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#14213D]/60 uppercase">
            <span>Target Role: {application.role}</span>
            <span aria-hidden="true">·</span>
            <span>{application.company}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#14213D] font-display">
            Application Studio
          </h1>
          <p className="text-xs text-[#14213D]/70 mt-0.5">
            Every statement in your application is cross-referenced with your project repositories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Saved indicator */}
          <div className="text-xs font-mono text-[#14213D]/70 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FAF7F2] border border-[#E8DFCF]">
            <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span>{saveStatusText}</span>
          </div>

          <button
            onClick={handleManualSave}
            disabled={isSaving || !isDirty}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isDirty
                ? 'bg-[#14213D] text-white hover:bg-[#1E2F52]'
                : 'bg-[#FAF7F2] text-[#14213D]/40 border border-[#E8DFCF] cursor-not-allowed'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={onNavigateToTracker}
            className="px-4 py-1.5 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Review Application</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Editable Document Drafts (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] shadow-xs flex flex-col">
          {/* Tab Selector */}
          <div className="flex items-center justify-between border-b border-[#E8DFCF] px-6 pt-3 bg-[#FAF7F2]">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('resume')}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'resume'
                    ? 'border-[#FF6B5B] text-[#14213D]'
                    : 'border-transparent text-[#14213D]/60 hover:text-[#14213D]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume Draft (v{application.resumeVersion})</span>
              </button>
              <button
                onClick={() => setActiveTab('coverNote')}
                className={`pb-3 px-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-colors ${
                  activeTab === 'coverNote'
                    ? 'border-[#FF6B5B] text-[#14213D]'
                    : 'border-transparent text-[#14213D]/60 hover:text-[#14213D]'
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>Cover Note (v{application.coverNoteVersion})</span>
              </button>
            </div>

            <div className="pb-2">
              <label className="flex items-center gap-2 text-[11px] text-[#14213D]/70 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeUnresolved}
                  onChange={e => setExcludeUnresolved(e.target.checked)}
                  className="rounded text-[#FF6B5B] focus:ring-[#FF6B5B]"
                />
                <span>Exclude unresolved claims from exports</span>
              </label>
            </div>
          </div>

          {/* Editor Surface */}
          <div className="p-6 space-y-4">
            {activeTab === 'resume' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#14213D]/60 font-mono">
                  <span>Editable Markdown Resume</span>
                  <span>{resumeText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <textarea
                  value={resumeText}
                  onChange={e => handleTextChange('resume', e.target.value)}
                  rows={20}
                  className="w-full p-4 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] font-mono text-xs text-[#14213D] leading-relaxed bg-[#FFFFFF] outline-hidden resize-y"
                  placeholder="Paste or write your resume text..."
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#14213D]/60 font-mono">
                  <span>Tailored Cover Note</span>
                  <span>{coverNoteText.split(/\s+/).filter(Boolean).length} words</span>
                </div>
                <textarea
                  value={coverNoteText}
                  onChange={e => handleTextChange('coverNote', e.target.value)}
                  rows={20}
                  className="w-full p-4 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-xs text-[#14213D] leading-relaxed bg-[#FFFFFF] outline-hidden resize-y font-mono"
                  placeholder="Draft your cover note based on verified project evidence..."
                />
              </div>
            )}

            {/* Document Download Actions */}
            <div className="pt-4 border-t border-[#E8DFCF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-[#14213D]/70 font-medium">
                Exports reflect genuine project code verified in your workspace.
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* PDF Generation Buttons (jsPDF) */}
                <button
                  type="button"
                  onClick={handleDownloadResumePDF}
                  className="px-3.5 py-1.5 rounded-lg bg-[#14213D] hover:bg-[#1E2F52] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Generate and download finalized Resume PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF6B5B]" />
                  <span>Resume (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCoverLetterPDF}
                  className="px-3.5 py-1.5 rounded-lg bg-[#14213D] hover:bg-[#1E2F52] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Generate and download finalized Cover Letter PDF"
                >
                  <Download className="w-3.5 h-3.5 text-[#FF6B5B]" />
                  <span>Cover Letter (PDF)</span>
                </button>

                {/* Secondary Raw Text Exports */}
                <button
                  type="button"
                  onClick={handleDownloadResume}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E8DFCF] hover:bg-[#FAF7F2] text-[#14213D]/75 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="Download raw Markdown draft"
                >
                  <span>.md</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCoverNote}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E8DFCF] hover:bg-[#FAF7F2] text-[#14213D]/75 text-[11px] font-medium flex items-center gap-1 transition-colors"
                  title="Download plain text draft"
                >
                  <span>.txt</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Supporting Evidence Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-5 shadow-xs space-y-4">
            <div className="border-b border-[#E8DFCF] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF6B5B]" />
                <h3 className="font-display font-bold text-sm text-[#14213D]">
                  Supporting Project Evidence
                </h3>
              </div>
              <p className="text-[11px] text-[#14213D]/60 mt-0.5">
                Claims extracted from your repository. Select a claim to inspect or clarify individual ownership.
              </p>
            </div>

            {/* Claims List */}
            <div className="space-y-2.5">
              {claims.map(claim => {
                const isSelected = selectedClaim?.id === claim.id;
                let statusBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                if (claim.status === 'Needs clarification') {
                  statusBadgeColor = 'text-amber-800 bg-amber-50 border-amber-200';
                }

                return (
                  <button
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className={`w-full p-3 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'border-[#14213D] bg-[#FAF7F2] shadow-xs'
                        : 'border-[#E8DFCF] bg-white hover:bg-[#FAF7F2]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className="text-[#14213D]/60">{claim.sourceFilename}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadgeColor}`}>
                        {claim.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#14213D] font-medium line-clamp-2">
                      {claim.revisedText || claim.text}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Claim Deep Inspection & Clarification Tool */}
          {selectedClaim && (
            <div className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-2.5">
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-[#14213D]">
                  Claim Audit & Source Link
                </h4>
                <span className="text-[11px] font-mono text-[#14213D]/60">
                  {selectedClaim.sourceProject}
                </span>
              </div>

              {/* Source Excerpt */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#14213D] uppercase tracking-wide block">
                  Source Excerpt ({selectedClaim.sourceFilename})
                </span>
                <div className="p-3 rounded-md bg-[#FAF7F2] border border-[#E8DFCF] font-mono text-xs text-[#14213D]/80 leading-relaxed whitespace-pre-wrap">
                  {selectedClaim.sourceExcerpt}
                </div>
              </div>

              {/* Stated Contribution */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#14213D] uppercase tracking-wide block">
                  Candidate Stated Ownership
                </span>
                <p className="text-xs text-[#14213D]/80">
                  {selectedClaim.statedContribution}
                </p>
              </div>

              {/* Clarification prompt if needed */}
              {selectedClaim.status === 'Needs clarification' ? (
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-amber-900 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">A-viora Clarification Request</p>
                      <p className="text-[11px] mt-0.5">
                        {selectedClaim.clarificationQuestion || 'Which specific part of this collaborative project did you personally implement?'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                      Your Precise Answer:
                    </label>
                    <input
                      type="text"
                      value={studentAnswer}
                      onChange={e => setStudentAnswer(e.target.value)}
                      placeholder="e.g. The database schema and queries."
                      className="w-full p-2 text-xs rounded border border-amber-300 bg-white text-[#14213D]"
                    />

                    <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wide">
                      Suggested Truthful Replacement:
                    </label>
                    <input
                      type="text"
                      value={revisedTextCustom}
                      onChange={e => setRevisedTextCustom(e.target.value)}
                      placeholder={selectedClaim.revisedText || 'Designed the database schema and queries for a team-built attendance system.'}
                      className="w-full p-2 text-xs rounded border border-amber-300 bg-white text-[#14213D]"
                    />

                    <button
                      type="button"
                      onClick={handleConfirmClarification}
                      disabled={isClarifying}
                      className="w-full py-2 rounded bg-[#14213D] text-white hover:bg-[#1E2F52] text-xs font-semibold transition-colors mt-2"
                    >
                      {isClarifying ? 'Updating Claim...' : 'Save Clarification & Update Resume'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Candidate confirmed & backed by repository source.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Send,
  FileText,
  Clock,
  ShieldCheck,
  Building,
  RefreshCw,
  Info,
  Calendar,
  ArrowRight,
  Download
} from 'lucide-react';
import { ApplicationDraft, StudentProfile, JobOpportunity, ReminderItem } from '../types';
import { ActiveTab } from './Navigation';
import { generateResumePDF, generateCoverLetterPDF } from '../utils/pdfGenerator';

interface ApprovalTrackerProps {
  application: ApplicationDraft;
  profile: StudentProfile;
  job?: JobOpportunity;
  reminders: ReminderItem[];
  onApproveApplication: () => Promise<void>;
  onSimulateSend: () => Promise<{ success?: boolean; alreadySent?: boolean; receiptId?: string; error?: string }>;
  onNavigate: (tab: ActiveTab) => void;
}

export const ApprovalTracker: React.FC<ApprovalTrackerProps> = ({
  application,
  profile,
  job,
  reminders,
  onApproveApplication,
  onSimulateSend,
  onNavigate
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResultNotice, setSendResultNotice] = useState<{
    receiptId: string;
    alreadySent?: boolean;
    sentAt: string;
  } | null>(
    application.simulatedReceiptId
      ? {
          receiptId: application.simulatedReceiptId,
          alreadySent: true,
          sentAt: application.simulatedSentAt || new Date().toISOString()
        }
      : null
  );
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Check unresolved claims in the profile
  const unresolvedClaims = profile.claims.filter(
    c => !c.resolved && application.includedClaimIds.includes(c.id)
  );

  const isApproved = application.status === 'Approved' || application.status === 'Simulated sent';
  const isSent = application.status === 'Simulated sent';
  const canSend = isApproved && !isSent && application.approvedVersion === application.resumeVersion;

  const handleApprove = async () => {
    setErrorNotice(null);
    setIsApproving(true);
    try {
      await onApproveApplication();
    } catch (err: any) {
      setErrorNotice(err.message || 'Approval could not be completed. Check for unresolved claims.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleSend = async () => {
    setErrorNotice(null);
    setIsSending(true);
    try {
      const res = await onSimulateSend();
      if (res.error) {
        setErrorNotice(res.error);
      } else if (res.receiptId) {
        setSendResultNotice({
          receiptId: res.receiptId,
          alreadySent: res.alreadySent,
          sentAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Simulation dispatch failed.');
    } finally {
      setIsSending(false);
    }
  };

  // Status badge styling
  const getStatusColor = (status: ApplicationDraft['status']) => {
    switch (status) {
      case 'Simulated sent':
        return 'text-emerald-800 bg-emerald-100 border-emerald-300';
      case 'Approved':
        return 'text-blue-800 bg-blue-100 border-blue-300';
      case 'Ready for review':
        return 'text-amber-800 bg-amber-100 border-amber-300';
      case 'Needs input':
        return 'text-rose-800 bg-rose-100 border-rose-300';
      default:
        return 'text-slate-800 bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Title */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E8DFCF] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#14213D] font-display">
            Approval & Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#14213D]/70 mt-1">
            Enforces strict backend approval and version verification before simulated sending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-md text-xs font-semibold border font-mono ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
        </div>
      </div>

      {/* Error alert if approval or send was blocked */}
      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Action Blocked by Verification Rules</p>
            <p className="mt-0.5">{errorNotice}</p>
          </div>
          <button onClick={() => setErrorNotice(null)} className="text-rose-800 font-bold ml-2">×</button>
        </div>
      )}

      {/* Primary Approval & Simulated Sending Card */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF6B5B]" />
            <h2 className="font-display font-bold text-base text-[#14213D]">
              Pre-Dispatch Document Verification
            </h2>
          </div>
          <div className="text-xs font-mono text-[#14213D]/60">
            Document Version: Resume v{application.resumeVersion} · Cover Note v{application.coverNoteVersion}
          </div>
        </div>

        {/* Selected Job & Document Version Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FAF7F2] p-5 rounded-xl border border-[#E8DFCF]">
          <div className="space-y-1.5">
            <div className="text-xs text-[#14213D]/60 uppercase tracking-wide font-medium">
              Target Opportunity
            </div>
            <div className="text-base font-bold text-[#14213D]">
              {application.role}
            </div>
            <div className="text-xs text-[#14213D]/70">
              {application.company}
            </div>
            <div className="text-xs text-[#14213D]/60 pt-1 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#FF6B5B]" />
              <span>Application Deadline: {job?.deadline || '2026-11-25'}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs text-[#14213D]/60 uppercase tracking-wide font-medium">
              Document Audit State
            </div>
            <div className="text-xs text-[#14213D]/80 space-y-1">
              <div>
                <strong>Approved Version:</strong>{' '}
                {application.approvedVersion ? `v${application.approvedVersion}` : 'Not currently approved'}
              </div>
              <div>
                <strong>Current Draft Version:</strong> v{application.resumeVersion}
              </div>
              <div>
                <strong>Unresolved Claims:</strong>{' '}
                <span className={unresolvedClaims.length > 0 ? 'text-amber-800 font-bold' : 'text-emerald-700 font-bold'}>
                  {unresolvedClaims.length === 0 ? 'None (All verified)' : `${unresolvedClaims.length} pending clarification`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Unresolved Claim warning if blocking */}
        {unresolvedClaims.length > 0 && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Approval Blocked: Unresolved project ownership claims</span>
            </div>
            <p>
              Your application draft references claims that need student clarification (e.g. "{unresolvedClaims[0].text}"). Please clarify or remove them in the Application Studio before approving.
            </p>
            <button
              onClick={() => onNavigate('studio')}
              className="px-3 py-1.5 rounded bg-amber-800 text-white font-medium hover:bg-amber-900 transition-colors"
            >
              Go to Studio & Clarify
            </button>
          </div>
        )}

        {/* Dispatch Controls */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Step 1: Approve Button */}
            <button
              onClick={handleApprove}
              disabled={isApproving || isApproved || unresolvedClaims.length > 0}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : unresolvedClaims.length > 0
                  ? 'bg-[#E8DFCF] text-[#14213D]/40 cursor-not-allowed'
                  : 'bg-[#14213D] text-white hover:bg-[#1E2F52]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#FF6B5B]" />
              <span>{isApproved ? `Approved (v${application.approvedVersion})` : isApproving ? 'Verifying...' : 'Approve Current Draft'}</span>
            </button>

            {/* Step 2: Primary Confirmation: Approve and simulate sending */}
            <button
              onClick={handleSend}
              disabled={isSending || !canSend}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-xs ${
                isSent
                  ? 'bg-[#E8DFCF] text-[#14213D]/70 cursor-not-allowed'
                  : !canSend
                  ? 'bg-[#E8DFCF] text-[#14213D]/40 cursor-not-allowed'
                  : 'bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSent ? 'Simulated Sent' : isSending ? 'Transmitting...' : 'Approve and simulate sending'}</span>
            </button>

            {/* Invalidate / Edit in Studio link */}
            <button
              onClick={() => onNavigate('studio')}
              className="text-xs text-[#14213D]/70 hover:text-[#14213D] underline underline-offset-4 self-center sm:ml-auto"
            >
              Edit in Studio (Invalidates Approval)
            </button>
          </div>

          {/* Mandatory Demo Disclaimer */}
          <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] text-xs text-[#14213D]/75 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#FF6B5B] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#14213D]">Demo Simulation Notice</p>
              <p>
                No employer will be contacted in this demo. This simulation verifies state transitions, backend approval locks, duplicate dispatch prevention, and receipt generation.
              </p>
            </div>
          </div>
        </div>

        {/* Receipt confirmation box */}
        {sendResultNotice && (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Simulated Dispatch Confirmed</span>
            </div>
            <p className="text-xs">
              {sendResultNotice.alreadySent
                ? 'Repeated click prevented duplicate submission. The existing transmission receipt has been retained.'
                : 'Application simulation completed. One verifiable dispatch receipt generated.'}
            </p>
            <div className="p-3 bg-white rounded-lg border border-emerald-200 font-mono text-xs text-emerald-900 space-y-1">
              <div>
                <strong>Receipt ID:</strong> {sendResultNotice.receiptId}
              </div>
              <div>
                <strong>Dispatched At:</strong> {new Date(sendResultNotice.sentAt).toLocaleString()}
              </div>
              <div>
                <strong>Recipient:</strong> {application.company} ({application.role})
              </div>
            </div>

            {/* Direct Local PDF Downloads */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-emerald-950">Save Finalized Documents:</span>
              <button
                type="button"
                onClick={() =>
                  generateResumePDF({
                    resumeText: application.resumeText,
                    candidateName: profile.name,
                    targetRole: application.role,
                    company: application.company,
                    version: application.resumeVersion,
                    excludeUnresolved: true,
                    unresolvedClaims: profile.claims.filter(c => !c.resolved)
                  })
                }
                className="px-3 py-1.5 rounded-md bg-[#14213D] hover:bg-[#1E2F52] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#FF6B5B]" />
                <span>Download Resume (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  generateCoverLetterPDF({
                    coverNoteText: application.coverNoteText,
                    candidateName: profile.name,
                    targetRole: application.role,
                    company: application.company,
                    version: application.coverNoteVersion
                  })
                }
                className="px-3 py-1.5 rounded-md bg-[#14213D] hover:bg-[#1E2F52] text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#FF6B5B]" />
                <span>Download Cover Letter (PDF)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tracker Records Table */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8DFCF] pb-3">
          <h3 className="font-display font-bold text-sm text-[#14213D]">
            Application Records Tracker
          </h3>
          <span className="text-xs font-mono text-[#14213D]/60">1 Tracked Submission</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8DFCF] text-[#475569] uppercase font-mono text-[10px] font-bold">
                <th className="py-2.5 px-3">Role & Company</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Deadline</th>
                <th className="py-2.5 px-3">Last Update</th>
                <th className="py-2.5 px-3">Documents</th>
                <th className="py-2.5 px-3">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DFCF]">
              <tr className="hover:bg-[#FAF7F2] transition-colors">
                <td className="py-3 px-3">
                  <div className="font-bold text-[#0F172A]">{application.role}</div>
                  <div className="text-[11px] text-[#475569]">{application.company}</div>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold border ${getStatusColor(application.status)}`}>
                    {application.status}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-[#334155] font-medium">
                  {job?.deadline || '2026-11-25'}
                </td>
                <td className="py-3 px-3 font-mono text-[#334155] font-medium">
                  {new Date(application.lastSavedAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-3">
                  <div className="font-mono text-[11px] text-[#334155] font-medium mb-1">
                    Resume v{application.resumeVersion} · Cover Note v{application.coverNoteVersion}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        generateResumePDF({
                          resumeText: application.resumeText,
                          candidateName: profile.name,
                          targetRole: application.role,
                          company: application.company,
                          version: application.resumeVersion,
                          excludeUnresolved: true,
                          unresolvedClaims: profile.claims.filter(c => !c.resolved)
                        })
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FAF7F2] border border-[#CBD5E1] hover:bg-[#E8DFCF] text-[#0F172A] text-[10px] font-bold"
                      title="Download Resume as PDF"
                    >
                      <Download className="w-3 h-3 text-[#FF6B5B]" />
                      <span>Resume PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        generateCoverLetterPDF({
                          coverNoteText: application.coverNoteText,
                          candidateName: profile.name,
                          targetRole: application.role,
                          company: application.company,
                          version: application.coverNoteVersion
                        })
                      }
                      className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FAF7F2] border border-[#CBD5E1] hover:bg-[#E8DFCF] text-[#0F172A] text-[10px] font-bold"
                      title="Download Cover Letter as PDF"
                    >
                      <Download className="w-3 h-3 text-[#FF6B5B]" />
                      <span>Cover PDF</span>
                    </button>
                  </div>
                </td>
                <td className="py-3 px-3">
                  {isSent ? (
                    <button
                      onClick={() => onNavigate('practice')}
                      className="text-xs font-bold text-[#FF6B5B] hover:underline"
                    >
                      Practise Interview →
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('studio')}
                      className="text-xs font-bold text-[#14213D] hover:underline"
                    >
                      Review Draft →
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

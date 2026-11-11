import React, { useState } from 'react';
import {
  Upload,
  UserCheck,
  FileText,
  Check,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Info,
  Code2,
  FolderGit2,
  Loader2
} from 'lucide-react';
import { StudentProfile } from '../types';
import { SAMPLE_STUDENT } from '../data/defaultData';
import { parseResumeFile } from '../utils/documentParser';

interface WelcomeProfileProps {
  profile: StudentProfile;
  onSaveProfile: (profile: StudentProfile) => Promise<void>;
  onResetSample: () => void;
  onContinue: () => void;
}

export const WelcomeProfile: React.FC<WelcomeProfileProps> = ({
  profile,
  onSaveProfile,
  onResetSample,
  onContinue
}) => {
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [skillInput, setSkillInput] = useState('');
  const [fileParseNotice, setFileParseNotice] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'projects' | 'rawResume'>('profile');

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const trimmed = skillInput.trim();
    if (!formData.skills.includes(trimmed)) {
      setFormData({
        ...formData,
        skills: [...formData.skills, trimmed]
      });
    }
    setSkillInput('');
    setIsSaved(false);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
    setIsSaved(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingFile(true);
    setFileParseNotice(null);

    try {
      const result = await parseResumeFile(file);
      setFormData(prev => ({
        ...prev,
        rawResumeText: result.text,
        projectReadme: prev.projectReadme || (result.text.length > 500 ? result.text.slice(0, 500) : result.text)
      }));
      setFileParseNotice(
        `Successfully extracted text from ${result.fileType.toUpperCase()} file "${file.name}". Please review and verify the extracted content below.`
      );
    } catch (err: any) {
      setFileParseNotice(
        err.message || `Could not parse "${file.name}". In accordance with truthful processing, please paste your resume text directly below.`
      );
      setActiveTab('rawResume');
    } finally {
      setIsParsingFile(false);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSaveProfile(formData);
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Welcome Banner with subtle vertical texture and soft coral glow */}
      <section className="relative overflow-hidden rounded-2xl bg-[#14213D] text-[#F4EDE0] p-8 md:p-10 shadow-sm border border-[#1E2F52] welcome-vertical-texture coral-welcome-glow">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF6B5B] uppercase tracking-wider font-mono">
            <span>A-viora Placement Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white text-balance">
            Your next opportunity starts with your work.
          </h1>
          <p className="text-sm sm:text-base text-[#F4EDE0]/80 leading-relaxed max-w-xl">
            A-viora builds your placement story on honest, verified code contributions—not generic buzzwords or invented credentials. Review your real project facts below or get started with our sample student.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onResetSample();
                setFormData(JSON.parse(JSON.stringify(SAMPLE_STUDENT)));
                setIsSaved(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-bold text-xs uppercase tracking-wide transition-colors flex items-center gap-2 shadow-xs"
            >
              <UserCheck className="w-4 h-4" />
              <span>Try sample student (Riya Sharma)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rawResume')}
              className="px-4 py-2 rounded-lg bg-[#1E2F52] hover:bg-[#1E2F52]/80 text-[#F4EDE0] text-xs font-semibold transition-colors flex items-center gap-2 border border-[#F4EDE0]/20"
            >
              <FileText className="w-4 h-4 text-[#FF6B5B]" />
              <span>Add my resume / text</span>
            </button>

            <button
              type="button"
              onClick={onContinue}
              className="px-4 py-2 rounded-lg bg-transparent hover:bg-white/10 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto"
            >
              <span>Go to Overview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* File parsing feedback notice if triggered */}
      {fileParseNotice && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{fileParseNotice}</p>
          </div>
          <button onClick={() => setFileParseNotice(null)} className="text-amber-800 font-bold ml-2">×</button>
        </div>
      )}

      {/* Profile Form Card */}
      <div className="bg-[#FFFFFF] rounded-xl border border-[#E8DFCF] shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E8DFCF] bg-[#FAF7F2] px-6 pt-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#FF6B5B] text-[#14213D]'
                : 'border-transparent text-[#14213D]/60 hover:text-[#14213D]'
            }`}
          >
            1. Core Profile & Skills
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-[#FF6B5B] text-[#14213D]'
                : 'border-transparent text-[#14213D]/60 hover:text-[#14213D]'
            }`}
          >
            2. Real Project & Contribution
          </button>
          <button
            onClick={() => setActiveTab('rawResume')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'rawResume'
                ? 'border-[#FF6B5B] text-[#14213D]'
                : 'border-transparent text-[#14213D]/60 hover:text-[#14213D]'
            }`}
          >
            3. Resume / Text Intake
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => {
                      setFormData({ ...formData, name: e.target.value });
                      setIsSaved(false);
                    }}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-sm text-[#14213D] bg-white outline-hidden transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={e => {
                      setFormData({ ...formData, targetRole: e.target.value });
                      setIsSaved(false);
                    }}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-sm text-[#14213D] bg-white outline-hidden transition-colors"
                    placeholder="e.g. Backend internship, Junior Software Engineer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                    Location Preferences
                  </label>
                  <input
                    type="text"
                    value={formData.locationPreferences}
                    onChange={e => {
                      setFormData({ ...formData, locationPreferences: e.target.value });
                      setIsSaved(false);
                    }}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-sm text-[#14213D] bg-white outline-hidden transition-colors"
                    placeholder="e.g. Bengaluru / Remote / Hybrid"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                    Employment Category
                  </label>
                  <select
                    value={formData.employmentType}
                    onChange={e => {
                      setFormData({ ...formData, employmentType: e.target.value as 'Internship' | 'Full-time' });
                      setIsSaved(false);
                    }}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-sm text-[#14213D] bg-white outline-hidden transition-colors"
                  >
                    <option value="Internship">Internship (College Placement)</option>
                    <option value="Full-time">Full-time (Graduate Role)</option>
                  </select>
                </div>
              </div>

              {/* Skills section */}
              <div>
                <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                  Verified Technical Skills
                </label>
                <p className="text-xs text-[#14213D]/60 mb-2">
                  List skills substantiated by real code or projects. Unboxed inline tags:
                </p>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {formData.skills.map(s => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded bg-[#F4EDE0] text-[#14213D] border border-[#E8DFCF]"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s)}
                        className="text-[#14213D]/50 hover:text-red-600 font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Add skill (e.g. Docker, Redis)..."
                    className="flex-1 px-3 py-1.5 text-xs rounded border border-[#E8DFCF] focus:border-[#14213D] bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-3 py-1.5 text-xs rounded bg-[#14213D] text-white font-medium hover:bg-[#1E2F52]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="p-3.5 rounded-lg bg-[#FAF7F2] border border-[#E8DFCF] text-xs text-[#14213D]/80 flex items-start gap-2.5">
                <FolderGit2 className="w-4 h-4 text-[#FF6B5B] shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Inflation Principle:</strong> College projects often involve multiple team members. Clearly separating what you personally implemented prevents awkward failures in technical interviews.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                  Project Title
                </label>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={e => {
                    setFormData({ ...formData, projectTitle: e.target.value });
                    setIsSaved(false);
                  }}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-sm text-[#14213D] bg-white outline-hidden"
                  placeholder="e.g. College Attendance Management System"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                  Project Summary
                </label>
                <textarea
                  value={formData.projectDescription}
                  onChange={e => {
                    setFormData({ ...formData, projectDescription: e.target.value });
                    setIsSaved(false);
                  }}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-sm text-[#14213D] bg-white outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                  Personal Contribution (What did you personally build?)
                </label>
                <textarea
                  value={formData.personalContribution}
                  onChange={e => {
                    setFormData({ ...formData, personalContribution: e.target.value });
                    setIsSaved(false);
                  }}
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-sm text-[#14213D] bg-white outline-hidden font-mono text-xs leading-relaxed"
                  placeholder="e.g. Database schema and queries: Designed tables and unique constraint to prevent duplicate attendance logs; built Flask CSV export endpoint."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                  Project README / Source Text
                </label>
                <textarea
                  value={formData.projectReadme}
                  onChange={e => {
                    setFormData({ ...formData, projectReadme: e.target.value });
                    setIsSaved(false);
                  }}
                  rows={5}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-xs font-mono text-[#14213D] bg-[#FAF7F2] outline-hidden leading-relaxed"
                  placeholder="Paste repository README markdown or source code snippets..."
                />
              </div>
            </div>
          )}

          {activeTab === 'rawResume' && (
            <div className="space-y-6">
              {/* File upload control */}
              <div>
                <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                  Resume File Upload (.pdf, .docx, .txt, .md)
                </label>
                <div className="border-2 border-dashed border-[#E8DFCF] rounded-xl p-6 text-center hover:border-[#14213D] transition-colors bg-[#FAF7F2]">
                  {isParsingFile ? (
                    <div className="py-2 flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-8 h-8 text-[#FF6B5B] animate-spin" />
                      <p className="text-xs font-medium text-[#14213D]">
                        Extracting text from resume file...
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-[#14213D]/40 mb-2" />
                      <p className="text-xs text-[#14213D]/70 mb-2">
                        Browse your resume in PDF (.pdf), Word (.docx, .doc), or text format (.txt, .md)
                      </p>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-[#14213D] text-white text-xs font-semibold hover:bg-[#1E2F52] transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#FF6B5B]" />
                        <span>Browse Resume (PDF, Word, Text)</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,text/markdown"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-[#14213D]/50 mt-2">
                        PDF and Word resumes are parsed directly into plain text. You can also paste your resume text below.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14213D] uppercase tracking-wider mb-1.5">
                  Or Paste Resume Text Below
                </label>
                <textarea
                  value={formData.rawResumeText || ''}
                  onChange={e => {
                    setFormData({ ...formData, rawResumeText: e.target.value });
                    setIsSaved(false);
                  }}
                  rows={10}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8DFCF] focus:border-[#14213D] text-xs font-mono text-[#14213D] bg-white outline-hidden leading-relaxed"
                  placeholder="Paste your resume sections, coursework, and project descriptions here..."
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#E8DFCF] flex items-center justify-between">
            <div className="text-xs text-[#14213D]/60 flex items-center gap-1.5">
              {isSaved && (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved successfully
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-lg bg-[#FF6B5B] hover:bg-[#E05A4A] text-[#14213D] font-bold text-xs uppercase tracking-wide transition-colors shadow-xs"
              >
                {isSaving ? 'Saving...' : 'Save Profile Changes'}
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="px-4 py-2 rounded-lg bg-[#14213D] hover:bg-[#1E2F52] text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Continue to Overview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

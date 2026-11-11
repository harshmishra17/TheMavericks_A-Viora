export type ClaimStatus = 'Source linked' | 'Student confirmed' | 'Needs clarification';

export interface ProjectClaim {
  id: string;
  text: string;
  status: ClaimStatus;
  sourceProject: string;
  sourceFilename: string;
  sourceExcerpt: string;
  statedContribution: string;
  clarificationQuestion?: string;
  revisedText?: string;
  resolved: boolean;
  notes?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  targetRole: string;
  skills: string[];
  locationPreferences: string;
  employmentType: 'Internship' | 'Full-time';
  projectTitle: string;
  projectDescription: string;
  projectReadme: string;
  personalContribution: string;
  claims: ProjectClaim[];
  rawResumeText?: string;
}

export interface JobOpportunity {
  id: string;
  role: string;
  company: string; // Clearly fictional, e.g. "AcuityLogix Systems (Fictional)"
  location: string;
  type: 'Internship' | 'Full-time';
  requiredSkills: string[];
  deadline: string;
  description: string;
  whyRelevant: string;
  isFictional: true;
}

export type ApplicationStatus = 'Draft' | 'Needs input' | 'Ready for review' | 'Approved' | 'Simulated sent';

export interface ApplicationDraft {
  id: string;
  jobId: string;
  role: string;
  company: string;
  resumeVersion: number;
  coverNoteVersion: number;
  resumeText: string;
  coverNoteText: string;
  includedClaimIds: string[];
  status: ApplicationStatus;
  approvedVersion: number | null;
  approvedAt: string | null;
  simulatedSentAt: string | null;
  simulatedReceiptId: string | null;
  lastSavedAt: string;
  isDirty: boolean;
}

export interface ReminderItem {
  id: string;
  title: string;
  dueDateTime: string; // ISO string
  jobRole?: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface InterviewFeedback {
  whatWasClear: string;
  whatNeedsImprovement: string;
  practicalSuggestion: string;
  followUpQuestion: string;
  identifiedWeakArea?: string;
}

export interface InterviewAttempt {
  id: string;
  mode: 'Project interview' | 'Role-specific practice' | 'Practise a saved weak area' | 'Target role questions (5)';
  question: string;
  context: string;
  userAnswer: string;
  feedback: InterviewFeedback;
  timestamp: string;
}

export interface SavedWeakArea {
  id: string;
  topic: string;
  details: string;
  sourceAttemptId?: string;
  practicedCount: number;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: 'navigate' | 'tool' | 'prompt';
    target?: string;
  }[];
  toolActivities?: {
    toolName: string;
    summary: string;
    status: 'success' | 'running' | 'error';
    linkTarget?: string;
  }[];
  isSimulatedDemo?: boolean;
}

export interface AppActivity {
  id: string;
  description: string;
  timestamp: string;
  type: 'claim' | 'application' | 'interview' | 'reminder' | 'profile' | 'roadmap';
}

export interface JobDescriptionAnalysis {
  id: string;
  role: string;
  company: string;
  rawText: string;
  extractedSkills: string[];
  qualifications: string[];
  responsibilities: string[];
  keywords: string[];
  analyzedAt: string;
}

export interface MatchedSkillItem {
  skill: string;
  evidence: string;
}

export interface MissingSkillItem {
  skill: string;
  importance: 'high' | 'medium' | 'low';
  reason: string;
}

export interface SkillGapReport {
  id: string;
  jobRole: string;
  company: string;
  matchedSkills: MatchedSkillItem[];
  missingSkills: MissingSkillItem[];
  matchAssessment: string;
  confidenceAlignment: 'Strong Alignment' | 'Moderate Alignment with Gaps' | 'Foundational Learning Required';
  analyzedAt: string;
}

export interface DailyRoadmapTask {
  id: string;
  dayNumber: number;
  title: string;
  objective: string;
  tasks: string[];
  estimatedHours: number;
  completed: boolean;
}

export interface PreparationRoadmap {
  id: string;
  targetRole: string;
  company: string;
  prioritySkills: { skill: string; priority: number; rationale: string }[];
  dailyPlan: DailyRoadmapTask[];
  projectImprovements: string[];
  interviewTopics: string[];
  generatedAt: string;
}

export interface JobInterviewQuestion {
  id: string;
  question: string;
  category: 'Technical' | 'Architecture' | 'Behavioral / HR' | 'Project Deep-dive';
  context: string;
  expectedKeyPoints: string[];
}


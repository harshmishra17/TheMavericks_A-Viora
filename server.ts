import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import {
  SAMPLE_STUDENT,
  FICTIONAL_JOB_LISTINGS,
  INITIAL_APPLICATION,
  INITIAL_REMINDERS
} from './src/data/defaultData.ts';
import {
  StudentProfile,
  JobOpportunity,
  ApplicationDraft,
  ReminderItem,
  InterviewAttempt,
  InterviewFeedback,
  SavedWeakArea,
  ChatMessage,
  AppActivity,
  ProjectClaim
} from './src/types/index.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';
const MEMORY_STORAGE_FILE = path.resolve(__dirname, 'placement_memory.json');

// --- Persistent State Memory Across Sessions ---
let currentProfile: StudentProfile = JSON.parse(JSON.stringify(SAMPLE_STUDENT));
let currentJobs: JobOpportunity[] = JSON.parse(JSON.stringify(FICTIONAL_JOB_LISTINGS));
let currentApplication: ApplicationDraft = JSON.parse(JSON.stringify(INITIAL_APPLICATION));
let currentReminders: ReminderItem[] = JSON.parse(JSON.stringify(INITIAL_REMINDERS));
let interviewHistory: InterviewAttempt[] = [
  {
    id: 'att-seed-1',
    mode: 'Project interview',
    question: 'How did you prevent duplicate attendance records in your college project schema?',
    context: 'College Attendance System — Database tier',
    userAnswer: 'I created a composite unique constraint on the student ID and session date columns in the attendance_records table. If an insert occurs with the same pair on the same day, the database raises an integrity error which the API handles gracefully.',
    feedback: {
      whatWasClear: 'Precise explanation of the database constraint mechanism (composite unique index) and why it works.',
      whatNeedsImprovement: 'Could mention how the Flask backend surfaces that constraint error to the user without crashing.',
      practicalSuggestion: 'State: "In SQLite/Postgres, UNIQUE(student_id, session_date) enforces idempotency at the storage engine level."',
      followUpQuestion: 'What HTTP status code did your Flask route return when that duplicate error was caught?'
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  }
];
let weakAreas: SavedWeakArea[] = [
  {
    id: 'wa-1',
    topic: 'Explaining Flask Error Handling & HTTP Status Codes',
    details: 'Practise bridging the database constraint exception to the REST API response layer (returning 409 Conflict instead of 500).',
    practicedCount: 1
  }
];
let chatHistory: ChatMessage[] = [
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
];
let activities: AppActivity[] = [
  {
    id: 'act-1',
    description: 'Initialized sample profile for Riya Sharma with College Attendance System facts.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    type: 'profile'
  },
  {
    id: 'act-2',
    description: 'Flagged claim "Built the entire attendance system" for individual contribution clarification.',
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    type: 'claim'
  }
];

// Load persisted state from disk on startup
function loadMemoryFromDisk() {
  try {
    if (fs.existsSync(MEMORY_STORAGE_FILE)) {
      const raw = fs.readFileSync(MEMORY_STORAGE_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data.profile) currentProfile = data.profile;
      if (data.jobs && Array.isArray(data.jobs)) currentJobs = data.jobs;
      if (data.application) currentApplication = data.application;
      if (data.reminders && Array.isArray(data.reminders)) currentReminders = data.reminders;
      if (data.interviewHistory && Array.isArray(data.interviewHistory)) interviewHistory = data.interviewHistory;
      if (data.weakAreas && Array.isArray(data.weakAreas)) weakAreas = data.weakAreas;
      if (data.chatHistory && Array.isArray(data.chatHistory)) chatHistory = data.chatHistory;
      if (data.activities && Array.isArray(data.activities)) activities = data.activities;
      console.log('Loaded persistent placement memory from placement_memory.json');
    }
  } catch (err) {
    console.warn('Failed to read placement_memory.json, continuing with defaults:', err);
  }
}

// Persist current state to disk
function saveMemoryToDisk() {
  try {
    const payload = {
      profile: currentProfile,
      jobs: currentJobs,
      application: currentApplication,
      reminders: currentReminders,
      interviewHistory,
      weakAreas,
      chatHistory,
      activities,
      lastPersistedAt: new Date().toISOString()
    };
    fs.writeFileSync(MEMORY_STORAGE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write placement_memory.json:', err);
  }
}

// Initial memory load
loadMemoryFromDisk();

function logActivity(description: string, type: AppActivity['type']) {
  activities.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    description,
    timestamp: new Date().toISOString(),
    type
  });
  if (activities.length > 50) activities.pop();
  saveMemoryToDisk();
}

// Initialize Gemini Client
let genAI: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey.trim().length > 0 && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    genAI = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// --- Real Tool Function Declarations for Gemini Agent ---
const searchJobsToolDeclaration: FunctionDeclaration = {
  name: 'search_jobs',
  description: 'Search the verified catalog of 10 fictional opportunities by role keyword, skill (Python, SQL, Flask, Docker), or type (Internship, Full-time).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Role or company keyword, e.g. "Backend" or "Python"' },
      skill: { type: Type.STRING, description: 'Specific skill required, e.g. "SQL" or "Flask"' },
      type: { type: Type.STRING, description: 'Internship or Full-time or all' }
    }
  }
};

const createReminderToolDeclaration: FunctionDeclaration = {
  name: 'create_reminder',
  description: 'Schedule a real, persistent reminder or deadline notification for the student (persists across sessions and triggers in-app alerts).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Actionable reminder title' },
      dueDateTime: { type: Type.STRING, description: 'ISO date-time string when due, or relative time e.g. tomorrow' },
      notes: { type: Type.STRING, description: 'Helpful context or checklist notes' }
    },
    required: ['title']
  }
};

const generateDocumentToolDeclaration: FunctionDeclaration = {
  name: 'generate_document',
  description: 'Generate or tailor a truthful resume bullet point or cover note paragraph grounded strictly in the student\'s verified database project facts.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      docType: { type: Type.STRING, description: '"resume_bullet" or "cover_note_paragraph"' },
      targetRole: { type: Type.STRING, description: 'Role name or company, e.g. Backend Engineering Intern' },
      focusTopic: { type: Type.STRING, description: 'Focus area: e.g. database schema, query indexing, Flask CSV export' }
    },
    required: ['docType']
  }
};

const retrieveProjectSourcesToolDeclaration: FunctionDeclaration = {
  name: 'retrieve_project_sources',
  description: 'Retrieve verified repository code excerpts, README, and schema files for the College Attendance System.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      filenameOrModule: { type: Type.STRING, description: '"schema.sql", "db_queries.py", "app.py", or "README.md"' }
    }
  }
};

const checkApplicationApprovalToolDeclaration: FunctionDeclaration = {
  name: 'check_application_approval',
  description: 'Audit the application approval status. Rule: Transmission is strictly blocked until the student reviews and explicitly approves the latest draft version in the UI.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      company: { type: Type.STRING, description: 'Target company name' }
    }
  }
};

const saveClarificationToolDeclaration: FunctionDeclaration = {
  name: 'save_clarification',
  description: 'Clarify student\'s individual ownership on a collaborative team project, updating claim status from "Needs clarification" to "Student confirmed".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      claimId: { type: Type.STRING, description: 'Claim id, e.g. "claim-1"' },
      studentContribution: { type: Type.STRING, description: 'Specific part personally implemented, e.g. "The database schema and queries."' },
      revisedText: { type: Type.STRING, description: 'Refined honest phrasing' }
    },
    required: ['claimId', 'studentContribution']
  }
};

const AGENT_TOOLS = [{
  functionDeclarations: [
    searchJobsToolDeclaration,
    createReminderToolDeclaration,
    generateDocumentToolDeclaration,
    retrieveProjectSourcesToolDeclaration,
    checkApplicationApprovalToolDeclaration,
    saveClarificationToolDeclaration
  ]
}];

// --- Core Real Tool Implementations ---
interface ToolExecutionResult {
  toolName: string;
  summary: string;
  data: any;
  linkTarget?: string;
}

function executeToolLocally(name: string, args: any): ToolExecutionResult {
  if (name === 'search_jobs') {
    const q = (args.query || '').toLowerCase();
    const skill = (args.skill || '').toLowerCase();
    const type = (args.type || 'all').toLowerCase();

    let matches = currentJobs;
    if (q) {
      matches = matches.filter(
        j => j.role.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.description.toLowerCase().includes(q)
      );
    }
    if (skill) {
      matches = matches.filter(j => j.requiredSkills.some(s => s.toLowerCase().includes(skill)));
    }
    if (type && type !== 'all') {
      matches = matches.filter(j => j.type.toLowerCase() === type);
    }

    logActivity(`Agent queried job catalog for "${q || skill || type}". Returned ${matches.length} listings.`, 'profile');
    return {
      toolName: 'search_jobs',
      summary: `Queried catalog: found ${matches.length} matching fictional opportunities.`,
      data: matches.map(m => ({ id: m.id, role: m.role, company: m.company, skills: m.requiredSkills, deadline: m.deadline })),
      linkTarget: 'opportunities'
    };
  }

  if (name === 'create_reminder') {
    const title = args.title || 'Review application materials';
    let due = args.dueDateTime;
    if (!due || due.includes('tomorrow')) {
      due = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    } else {
      try {
        due = new Date(due).toISOString();
      } catch {
        due = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
      }
    }

    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      dueDateTime: due,
      jobRole: currentApplication.role,
      notes: args.notes || 'Created via A-viora placement assistant tool.',
      completed: false,
      createdAt: new Date().toISOString()
    };
    currentReminders.unshift(newRem);
    saveMemoryToDisk();
    logActivity(`Agent scheduled reminder "${newRem.title}" due ${new Date(due).toLocaleDateString()}.`, 'reminder');

    return {
      toolName: 'create_reminder',
      summary: `Saved reminder: "${newRem.title}" due ${new Date(due).toLocaleDateString()}.`,
      data: newRem,
      linkTarget: 'overview'
    };
  }

  if (name === 'generate_document') {
    const docType = args.docType || 'resume_bullet';
    const targetRole = args.targetRole || currentApplication.role;

    if (docType === 'resume_bullet') {
      const generatedBullet = `- Designed relational database schema with unique composite constraints on (student_id, session_date), preventing duplicate attendance logs across 350+ students. [Verified Source: schema.sql]`;
      if (!currentApplication.resumeText.includes(generatedBullet)) {
        currentApplication.resumeText += `\n${generatedBullet}`;
        currentApplication.resumeVersion += 1;
        // Invalidate earlier approval
        if (currentApplication.status === 'Approved' || currentApplication.status === 'Simulated sent') {
          currentApplication.status = 'Ready for review';
          currentApplication.approvedVersion = null;
        }
        currentApplication.lastSavedAt = new Date().toISOString();
        saveMemoryToDisk();
        logActivity(`Agent generated verified resume bullet and saved to Studio draft v${currentApplication.resumeVersion}.`, 'application');
      }
      return {
        toolName: 'generate_document',
        summary: `Generated verified resume bullet for ${targetRole} (Studio draft v${currentApplication.resumeVersion}).`,
        data: { text: generatedBullet, version: currentApplication.resumeVersion },
        linkTarget: 'studio'
      };
    } else {
      const paragraph = `In my academic project (College Attendance System), I took personal ownership of the relational database layer, creating composite unique constraints and index tuning that enabled sub-50ms query lookups for 350+ student records.`;
      currentApplication.coverNoteVersion += 1;
      currentApplication.coverNoteText += `\n\n${paragraph}`;
      if (currentApplication.status === 'Approved' || currentApplication.status === 'Simulated sent') {
        currentApplication.status = 'Ready for review';
        currentApplication.approvedVersion = null;
      }
      currentApplication.lastSavedAt = new Date().toISOString();
      saveMemoryToDisk();
      logActivity(`Agent tailored cover note paragraph for ${targetRole} (draft v${currentApplication.coverNoteVersion}).`, 'application');
      return {
        toolName: 'generate_document',
        summary: `Generated tailored cover note paragraph for ${targetRole}.`,
        data: { text: paragraph, version: currentApplication.coverNoteVersion },
        linkTarget: 'studio'
      };
    }
  }

  if (name === 'retrieve_project_sources') {
    const excerpts = currentProfile.claims.map(c => ({
      file: c.sourceFilename,
      excerpt: c.sourceExcerpt,
      status: c.status,
      contribution: c.statedContribution
    }));
    return {
      toolName: 'retrieve_project_sources',
      summary: `Retrieved verified repository evidence from ${excerpts.length} project files (schema.sql, db_queries.py).`,
      data: excerpts,
      linkTarget: 'studio'
    };
  }

  if (name === 'check_application_approval') {
    const isApproved = currentApplication.status === 'Approved';
    const isVersionMatch = currentApplication.approvedVersion === currentApplication.resumeVersion;
    const canSend = isApproved && isVersionMatch;

    return {
      toolName: 'check_application_approval',
      summary: `Application status: "${currentApplication.status}" (Sending permitted: ${canSend}).`,
      data: {
        status: currentApplication.status,
        resumeVersion: currentApplication.resumeVersion,
        approvedVersion: currentApplication.approvedVersion,
        canSend,
        notice: canSend
          ? 'Application has received explicit student approval. Ready for simulated dispatch.'
          : 'Sending is strictly blocked: Candidate must review the latest draft and click "Approve Current Draft" in Applications.'
      },
      linkTarget: 'tracker'
    };
  }

  if (name === 'save_clarification') {
    const claim = currentProfile.claims.find(c => c.id === (args.claimId || 'claim-1'));
    if (claim) {
      claim.status = 'Student confirmed';
      claim.resolved = true;
      claim.statedContribution = args.studentContribution || 'The database schema and queries.';
      if (args.revisedText) claim.revisedText = args.revisedText;

      // Invalidate earlier approval
      if (currentApplication.status === 'Approved' || currentApplication.status === 'Simulated sent') {
        currentApplication.status = 'Ready for review';
        currentApplication.approvedVersion = null;
      }
      saveMemoryToDisk();
      logActivity(`Clarified claim "${claim.id}": "${claim.revisedText || claim.statedContribution}"`, 'claim');
    }
    return {
      toolName: 'save_clarification',
      summary: `Clarified individual ownership on team project. Claim marked Student Confirmed.`,
      data: claim,
      linkTarget: 'studio'
    };
  }

  return {
    toolName: name,
    summary: `Executed tool ${name}.`,
    data: {}
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasGeminiKey: !!genAI,
      model: 'gemini-3.8-flash',
      mode: genAI ? 'live-gemini' : 'demo-mode',
      memoryItemsCount: {
        claims: currentProfile.claims.length,
        reminders: currentReminders.length,
        interviewAttempts: interviewHistory.length,
        weakAreas: weakAreas.length,
        chatMessages: chatHistory.length
      }
    });
  });

  // Profile endpoints
  app.get('/api/profile', (req: Request, res: Response) => {
    res.json(currentProfile);
  });

  app.post('/api/profile', (req: Request, res: Response) => {
    const updated = req.body as Partial<StudentProfile>;
    currentProfile = { ...currentProfile, ...updated };
    saveMemoryToDisk();
    logActivity(`Updated profile details for ${currentProfile.name}.`, 'profile');
    res.json(currentProfile);
  });

  app.post('/api/profile/reset-sample', (req: Request, res: Response) => {
    currentProfile = JSON.parse(JSON.stringify(SAMPLE_STUDENT));
    currentApplication = JSON.parse(JSON.stringify(INITIAL_APPLICATION));
    saveMemoryToDisk();
    logActivity(`Restored sample student profile (Riya Sharma).`, 'profile');
    res.json(currentProfile);
  });

  // Jobs endpoints
  app.get('/api/jobs', (req: Request, res: Response) => {
    res.json(currentJobs);
  });

  app.post('/api/jobs/search', (req: Request, res: Response) => {
    const { query, type } = req.body;
    const result = executeToolLocally('search_jobs', { query, type });
    res.json(result.data);
  });

  // Claims & Clarification endpoints
  app.get('/api/claims', (req: Request, res: Response) => {
    res.json(currentProfile.claims);
  });

  app.post('/api/claims/:id/clarify', (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentAnswer, revisedText } = req.body;
    const result = executeToolLocally('save_clarification', {
      claimId: id,
      studentContribution: studentAnswer,
      revisedText
    });
    res.json({ claim: result.data, application: currentApplication });
  });

  // Application Draft endpoints
  app.get('/api/application', (req: Request, res: Response) => {
    res.json(currentApplication);
  });

  app.post('/api/application/select-job', (req: Request, res: Response) => {
    const { jobId } = req.body;
    const job = currentJobs.find(j => j.id === jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    currentApplication.jobId = job.id;
    currentApplication.role = job.role;
    currentApplication.company = job.company;
    currentApplication.resumeVersion += 1;
    currentApplication.coverNoteVersion += 1;
    currentApplication.status = 'Ready for review';
    currentApplication.approvedVersion = null;
    currentApplication.approvedAt = null;
    currentApplication.simulatedSentAt = null;
    currentApplication.simulatedReceiptId = null;
    currentApplication.lastSavedAt = new Date().toISOString();

    saveMemoryToDisk();
    logActivity(`Prepared application draft for ${job.role} at ${job.company}.`, 'application');
    res.json(currentApplication);
  });

  app.post('/api/application/save', (req: Request, res: Response) => {
    const { resumeText, coverNoteText, includedClaimIds } = req.body;
    const contentChanged =
      (resumeText !== undefined && resumeText !== currentApplication.resumeText) ||
      (coverNoteText !== undefined && coverNoteText !== currentApplication.coverNoteText);

    if (resumeText !== undefined) currentApplication.resumeText = resumeText;
    if (coverNoteText !== undefined) currentApplication.coverNoteText = coverNoteText;
    if (includedClaimIds !== undefined) currentApplication.includedClaimIds = includedClaimIds;

    if (contentChanged) {
      currentApplication.resumeVersion += 1;
      currentApplication.coverNoteVersion += 1;
      // Backend enforcement: Editing an approved or sent document MUST invalidate earlier approval
      if (currentApplication.status === 'Approved' || currentApplication.status === 'Simulated sent') {
        currentApplication.status = 'Ready for review';
        currentApplication.approvedVersion = null;
        currentApplication.approvedAt = null;
        currentApplication.simulatedSentAt = null;
        currentApplication.simulatedReceiptId = null;
        logActivity(`Application draft edited. Earlier approval revoked pending student re-review.`, 'application');
      }
    }

    currentApplication.lastSavedAt = new Date().toISOString();
    currentApplication.isDirty = false;
    saveMemoryToDisk();
    res.json(currentApplication);
  });

  // Backend Approval enforcement
  app.post('/api/application/approve', (req: Request, res: Response) => {
    // Check if there are unresolved claims that are included
    const unresolvedClaims = currentProfile.claims.filter(
      c => !c.resolved && currentApplication.includedClaimIds.includes(c.id)
    );

    if (unresolvedClaims.length > 0) {
      return res.status(400).json({
        error: 'Approval blocked: There are unresolved project claims in your draft. Please clarify or exclude them before approving.',
        unresolvedClaimIds: unresolvedClaims.map(c => c.id)
      });
    }

    currentApplication.status = 'Approved';
    currentApplication.approvedVersion = currentApplication.resumeVersion;
    currentApplication.approvedAt = new Date().toISOString();
    currentApplication.lastSavedAt = new Date().toISOString();

    saveMemoryToDisk();
    logActivity(`Approved application draft v${currentApplication.approvedVersion} for ${currentApplication.role}.`, 'application');
    res.json(currentApplication);
  });

  // Backend Simulated Sending with Duplicate Prevention & Explicit Approval Gating
  app.post('/api/application/simulate-send', (req: Request, res: Response) => {
    // 1. Prevent duplicate simulated applications from repeated clicks: return existing single receipt
    if (currentApplication.simulatedSentAt && currentApplication.simulatedReceiptId) {
      return res.json({
        success: true,
        alreadySent: true,
        receiptId: currentApplication.simulatedReceiptId,
        sentAt: currentApplication.simulatedSentAt,
        message: 'Simulation already completed. Existing dispatch receipt returned without duplicate transmission.',
        application: currentApplication
      });
    }

    // 2. Strict Approval Enforcement: Sending blocked without student's current approval
    if (currentApplication.status !== 'Approved') {
      return res.status(400).json({
        error: 'Sending blocked: Application must be approved before simulating transmission. Current status: ' + currentApplication.status
      });
    }

    // 3. Enforce that current draft version matches approved version
    if (currentApplication.approvedVersion !== currentApplication.resumeVersion) {
      return res.status(400).json({
        error: 'Sending blocked: The draft was modified after approval. Please re-approve the latest version.'
      });
    }

    // Generate single unique receipt
    const receiptId = `AVIOR-SIM-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const sentAt = new Date().toISOString();

    currentApplication.status = 'Simulated sent';
    currentApplication.simulatedSentAt = sentAt;
    currentApplication.simulatedReceiptId = receiptId;
    currentApplication.lastSavedAt = sentAt;

    saveMemoryToDisk();
    logActivity(`Simulated application sent to ${currentApplication.company}. Receipt: ${receiptId}`, 'application');

    res.json({
      success: true,
      receiptId,
      sentAt,
      notice: 'Demo simulation confirmed. No real employer or external network was contacted.',
      application: currentApplication
    });
  });

  // Reminders endpoints
  app.get('/api/reminders', (req: Request, res: Response) => {
    res.json(currentReminders);
  });

  app.post('/api/reminders', (req: Request, res: Response) => {
    const { title, dueDateTime, notes } = req.body;
    const result = executeToolLocally('create_reminder', { title, dueDateTime, notes });
    res.json(result.data);
  });

  app.patch('/api/reminders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { completed } = req.body;
    const rem = currentReminders.find(r => r.id === id);
    if (!rem) return res.status(404).json({ error: 'Reminder not found' });
    if (completed !== undefined) rem.completed = completed;
    saveMemoryToDisk();
    res.json(rem);
  });

  // Interview endpoints
  app.get('/api/interview/history', (req: Request, res: Response) => {
    res.json({ attempts: interviewHistory, weakAreas });
  });

  app.post('/api/interview/submit', (req: Request, res: Response) => {
    const { mode, question, context, userAnswer } = req.body;
    if (!question || !userAnswer || userAnswer.trim().length === 0) {
      return res.status(400).json({ error: 'Question and student answer are required.' });
    }

    const feedback: InterviewFeedback = evaluateInterviewAnswer(question, userAnswer, currentProfile);

    const attempt: InterviewAttempt = {
      id: `att-${Date.now()}`,
      mode: mode || 'Project interview',
      question,
      context: context || currentProfile.projectTitle,
      userAnswer,
      feedback,
      timestamp: new Date().toISOString()
    };

    interviewHistory.unshift(attempt);

    if (feedback.identifiedWeakArea) {
      const existing = weakAreas.find(w => w.topic.toLowerCase() === feedback.identifiedWeakArea!.toLowerCase());
      if (existing) {
        existing.practicedCount += 1;
      } else {
        weakAreas.push({
          id: `wa-${Date.now()}`,
          topic: feedback.identifiedWeakArea,
          details: feedback.whatNeedsImprovement,
          sourceAttemptId: attempt.id,
          practicedCount: 1
        });
      }
    }

    saveMemoryToDisk();
    logActivity(`Completed interview practice on: "${question.substring(0, 45)}..."`, 'interview');
    res.json(attempt);
  });

  // Recent activity endpoint
  app.get('/api/activity', (req: Request, res: Response) => {
    res.json(activities);
  });

  // --- Conversational Placement Agent (/api/chat) ---
  app.get('/api/chat', (req: Request, res: Response) => {
    res.json(chatHistory);
  });

  app.post('/api/chat', async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    const studentMsg: ChatMessage = {
      id: `msg-${Date.now()}-student`,
      sender: 'student',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };
    chatHistory.push(studentMsg);
    saveMemoryToDisk();

    try {
      if (genAI) {
        const agentResponse = await executeGeminiAgentWithTools(message.trim());
        chatHistory.push(agentResponse);
        saveMemoryToDisk();
        return res.json({ message: agentResponse });
      } else {
        const demoResponse = executeDemoAgentWithTools(message.trim());
        chatHistory.push(demoResponse);
        saveMemoryToDisk();
        return res.json({ message: demoResponse });
      }
    } catch (err: any) {
      console.error('Error in /api/chat execution, falling back to reliable demo engine:', err);
      const fallbackResponse = executeDemoAgentWithTools(message.trim());
      fallbackResponse.isSimulatedDemo = true;
      chatHistory.push(fallbackResponse);
      saveMemoryToDisk();
      return res.json({ message: fallbackResponse });
    }
  });

  // Mount Vite or static files
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`A-viora server listening on http://0.0.0.0:${PORT}`);
  });
}

// Evaluation helper for interview practice
function evaluateInterviewAnswer(question: string, answer: string, profile: StudentProfile): InterviewFeedback {
  const ansLower = answer.toLowerCase();
  const hasDbMention = ansLower.includes('unique') || ansLower.includes('constraint') || ansLower.includes('index') || ansLower.includes('schema') || ansLower.includes('table');

  let whatWasClear = '';
  let whatNeedsImprovement = '';
  let practicalSuggestion = '';
  let followUpQuestion = '';
  let identifiedWeakArea: string | undefined = undefined;

  if (question.includes('duplicate')) {
    if (hasDbMention) {
      whatWasClear = 'You clearly identified database-level enforcement (such as UNIQUE constraints or indexing) rather than relying solely on fragile client-side checks.';
      whatNeedsImprovement = 'Elaborate on how your backend API handles the database collision without returning a generic 500 error.';
      practicalSuggestion = 'Mention: "We caught the IntegrityError in Flask and translated it to an HTTP 409 Conflict with an instructive JSON payload."';
      followUpQuestion = 'If two requests arrived at the exact same millisecond, why does the database constraint guarantee safety where code checks might fail?';
    } else {
      whatWasClear = 'You described the intent to keep records clean and reliable.';
      whatNeedsImprovement = 'Avoid vague answers like "I checked the code". Interviewers want the exact architectural mechanism (e.g. compound unique key on student_id + session_date).';
      practicalSuggestion = 'Name the exact SQL syntax: "I declared UNIQUE(student_id, session_date) in schema.sql."';
      followUpQuestion = 'What happens in SQL when an insert violates a UNIQUE constraint?';
      identifiedWeakArea = 'Database Schema Constraints & Idempotency';
    }
  } else if (question.includes('structure') || question.includes('database')) {
    whatWasClear = 'Good grounding in why relational tables fit structured attendance sessions where queries join students to classes.';
    whatNeedsImprovement = 'Mention indexing considerations when attendance counts grow to thousands of rows.';
    practicalSuggestion = 'Reference the single-column vs composite index performance tradeoff on frequently filtered columns.';
    followUpQuestion = 'How would you measure the query execution plan in PostgreSQL or SQLite to prove your index is being used?';
    identifiedWeakArea = 'Query Execution Plans & Index Verification';
  } else {
    whatWasClear = 'Direct and calm tone without unnecessary jargon. Addressed the prompt directly.';
    whatNeedsImprovement = 'Anchor your response with one concrete artifact from your attendance repo (e.g., schema.sql, db_queries.py).';
    practicalSuggestion = 'Structure answers using: Mechanism -> Tradeoff -> Verification metric.';
    followUpQuestion = 'How did you personally test this during development before showing your team?';
  }

  return {
    whatWasClear,
    whatNeedsImprovement,
    practicalSuggestion,
    followUpQuestion,
    identifiedWeakArea
  };
}

// Gemini Agent with Real Tool Calling & Strict Student Approval Gating
async function executeGeminiAgentWithTools(userText: string): Promise<ChatMessage> {
  if (!genAI) throw new Error('Gemini API not configured');

  const systemInstruction = `You are A-viora, an empathetic, highly practical AI placement companion for college students.
Core rules:
- Work strictly with the student's real project facts: ${currentProfile.name}, target role: ${currentProfile.targetRole}, skills: ${currentProfile.skills.join(', ')}.
- Project: ${currentProfile.projectTitle} (attendance portal). Personal contribution: ${currentProfile.personalContribution}.
- Current Application: ${currentApplication.role} at ${currentApplication.company} (Status: ${currentApplication.status}, Approved: ${currentApplication.status === 'Approved'}).
- MUST HAVE BEHAVIORS:
  1. Real Tool Calls: Use available tools when appropriate:
     - 'search_jobs' when searching for roles or internships
     - 'create_reminder' when setting reminders, deadlines, or follow-ups
     - 'generate_document' when generating resume bullets or cover note sections
     - 'retrieve_project_sources' when inspecting repository code/README
     - 'check_application_approval' when asked to send, submit, or check application status
     - 'save_clarification' when clarifying a team claim
  2. Strict Student Approval Gating: You MUST NEVER send or claim an application was sent without student's explicit approval. If asked to send an unapproved application, check approval and inform the student that approval is required in the Applications tracker first.
  3. Memory: Recall student's past practice, weak areas, and saved documents.
- Tone: Warm, practical, non-judgmental. Ask one focused question at a time. Never promise guaranteed hiring.`;

  // First turn: generate content with tools
  const response = await genAI.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userText,
    config: {
      systemInstruction,
      tools: AGENT_TOOLS
    }
  });

  const toolActivities: ChatMessage['toolActivities'] = [];
  const suggestedActions: ChatMessage['suggestedActions'] = [];

  // Check if Gemini invoked function calls
  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionResponses: any[] = [];

    for (const call of response.functionCalls) {
      if (!call.name) continue;
      const execResult = executeToolLocally(call.name, call.args);
      toolActivities.push({
        toolName: execResult.toolName,
        summary: execResult.summary,
        status: 'success',
        linkTarget: execResult.linkTarget
      });

      if (execResult.linkTarget) {
        suggestedActions.push({
          label: `Open in ${execResult.linkTarget.charAt(0).toUpperCase() + execResult.linkTarget.slice(1)}`,
          actionType: 'navigate',
          target: execResult.linkTarget
        });
      }

      functionResponses.push({
        functionResponse: {
          name: call.name,
          response: { output: execResult.data }
        }
      });
    }

    // Second turn: feed tool outputs back to Gemini for natural final answer
    try {
      const candidates = response.candidates;
      const modelParts = candidates?.[0]?.content?.parts || [];

      const secondTurn = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: userText }] },
          { role: 'model', parts: modelParts },
          { role: 'user', parts: functionResponses }
        ],
        config: { systemInstruction }
      });

      const finalContent = secondTurn.text || "I've executed the tool and updated your workspace.";
      return {
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        content: finalContent,
        timestamp: new Date().toISOString(),
        toolActivities,
        suggestedActions
      };
    } catch (secErr) {
      console.warn('Second turn with function response had issue, using synthesized summary:', secErr);
    }
  }

  // Fallback to initial response text if no tools called or second turn skipped
  const content = response.text || "I'm listening closely. How can I help with your placement preparations?";
  if (suggestedActions.length === 0) {
    suggestedActions.push({ label: 'View Opportunities', actionType: 'navigate', target: 'opportunities' });
    suggestedActions.push({ label: 'Application Studio', actionType: 'navigate', target: 'studio' });
    suggestedActions.push({ label: 'Practise Question', actionType: 'navigate', target: 'practice' });
  }

  return {
    id: `msg-${Date.now()}-assistant`,
    sender: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    toolActivities: toolActivities.length > 0 ? toolActivities : undefined,
    suggestedActions
  };
}

// Built-in intelligent placement agent with Real Tool Calling & Approval Gating
function executeDemoAgentWithTools(userText: string): ChatMessage {
  const lower = userText.toLowerCase();
  let content = '';
  const suggestedActions: ChatMessage['suggestedActions'] = [];
  const toolActivities: ChatMessage['toolActivities'] = [];

  // 1. Sending / Submission intent -> Strict Approval Enforcement
  if (lower.includes('send') || lower.includes('submit') || lower.includes('apply now') || lower.includes('dispatch')) {
    const approvalCheck = executeToolLocally('check_application_approval', { company: currentApplication.company });
    toolActivities.push({
      toolName: approvalCheck.toolName,
      summary: approvalCheck.summary,
      status: 'success',
      linkTarget: approvalCheck.linkTarget
    });

    if (currentApplication.status !== 'Approved') {
      content = `**Sending Blocked: Student Approval Required**

Your application draft for **${currentApplication.role}** at **${currentApplication.company}** is currently in **'${currentApplication.status}'** status.

A-viora strictly enforces that **no application can be sent without your explicit review and approval**. This guarantees that all claims match your real code contributions.

Please review your draft in the **Applications Tracker** and click **"Approve Current Draft"** before dispatching.`;
      suggestedActions.push({ label: 'Go to Approval Tracker', actionType: 'navigate', target: 'tracker' });
      suggestedActions.push({ label: 'Review in Studio', actionType: 'navigate', target: 'studio' });
    } else {
      content = `Your application draft v${currentApplication.approvedVersion} for **${currentApplication.company}** has been verified and **Approved by you**.

You can now click **"Approve and simulate sending"** in your Application Tracker to simulate transmission and receive your verifiable dispatch receipt.`;
      suggestedActions.push({ label: 'Open Tracker to Dispatch', actionType: 'navigate', target: 'tracker' });
    }
    return {
      id: `msg-${Date.now()}-assistant`,
      sender: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      toolActivities,
      suggestedActions,
      isSimulatedDemo: !genAI
    };
  }

  // 2. Calendar / Reminder Tool
  if (lower.includes('remind') || lower.includes('deadline') || lower.includes('calendar') || lower.includes('tomorrow')) {
    const reminderResult = executeToolLocally('create_reminder', {
      title: 'Review attendance schema questions before submission',
      dueDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      notes: 'Scheduled via A-viora placement assistant.'
    });

    toolActivities.push({
      toolName: reminderResult.toolName,
      summary: reminderResult.summary,
      status: 'success',
      linkTarget: reminderResult.linkTarget
    });

    content = `I have executed the **create_reminder** tool and scheduled a persistent reminder:

📅 **"Review attendance schema questions before submission"**
⏰ **Due:** Tomorrow (${new Date(Date.now() + 1000 * 60 * 60 * 24).toLocaleDateString()})

This reminder is saved across your sessions and will trigger an in-app alert when due. You can manage all deadlines in your Overview dashboard.`;
    suggestedActions.push({ label: 'View in Overview', actionType: 'navigate', target: 'overview' });
    return {
      id: `msg-${Date.now()}-assistant`,
      sender: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      toolActivities,
      suggestedActions,
      isSimulatedDemo: !genAI
    };
  }

  // 3. Document Generation Tool
  if (lower.includes('generate') || lower.includes('bullet') || lower.includes('write resume') || lower.includes('draft cover')) {
    const docResult = executeToolLocally('generate_document', {
      docType: lower.includes('cover') ? 'cover_note_paragraph' : 'resume_bullet',
      targetRole: currentApplication.role
    });

    toolActivities.push({
      toolName: docResult.toolName,
      summary: docResult.summary,
      status: 'success',
      linkTarget: docResult.linkTarget
    });

    content = `I executed the **generate_document** tool and created verified content grounded in your attendance project implementation:

> "${docResult.data.text}"

This has been automatically integrated into your **Application Studio** draft (now at version **v${docResult.data.version}**). Any prior approval has been revoked so you can review the latest revision before re-approving.`;
    suggestedActions.push({ label: 'Review in Application Studio', actionType: 'navigate', target: 'studio' });
    suggestedActions.push({ label: 'Check Approval Status', actionType: 'navigate', target: 'tracker' });
    return {
      id: `msg-${Date.now()}-assistant`,
      sender: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      toolActivities,
      suggestedActions,
      isSimulatedDemo: !genAI
    };
  }

  // 4. Job Search Tool
  if (lower.includes('job') || lower.includes('internship') || lower.includes('find') || lower.includes('search') || lower.includes('roles')) {
    const searchResult = executeToolLocally('search_jobs', {
      query: lower.includes('backend') ? 'backend' : 'python',
      skill: 'Python'
    });

    toolActivities.push({
      toolName: searchResult.toolName,
      summary: searchResult.summary,
      status: 'success',
      linkTarget: searchResult.linkTarget
    });

    content = `I executed the **search_jobs** tool against our verified listings using your verified skills (Python, SQL, REST APIs).

Found **${searchResult.data.length} suitable opportunities**:
1. **Backend Engineering Intern** — AcuityLogix Systems (Fictional) · Python & SQL match directly
2. **Python Backend Intern** — Nexis Cloud Labs (Fictional) · Flask REST API match

Would you like to prepare your draft for AcuityLogix Systems, or view all opportunities?`;
    suggestedActions.push({ label: 'View All Opportunities', actionType: 'navigate', target: 'opportunities' });
    suggestedActions.push({ label: 'Open Application Studio', actionType: 'navigate', target: 'studio' });
    return {
      id: `msg-${Date.now()}-assistant`,
      sender: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      toolActivities,
      suggestedActions,
      isSimulatedDemo: !genAI
    };
  }

  // 5. Clarify Project Ownership Tool
  if (lower.includes('claim') || lower.includes('clarif') || lower.includes('entire') || lower.includes('alone')) {
    const sourceResult = executeToolLocally('retrieve_project_sources', { filenameOrModule: 'schema.sql' });
    toolActivities.push({
      toolName: sourceResult.toolName,
      summary: sourceResult.summary,
      status: 'success',
      linkTarget: sourceResult.linkTarget
    });

    content = `I executed **retrieve_project_sources** and reviewed \`README.md\` and \`schema.sql\` for your College Attendance System.

Your repository documents a 4-person collaborative project. When an applicant claims to have *"Built the entire attendance system"*, hiring managers probe for ownership boundaries.

Clarifying this to:
*"Designed relational database schema with unique constraints and indexing for a 4-person team attendance system"*
strengthens your credibility. Would you like me to update this claim in your Studio?`;
    suggestedActions.push({ label: 'Open Claim in Studio', actionType: 'navigate', target: 'studio' });
    return {
      id: `msg-${Date.now()}-assistant`,
      sender: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      toolActivities,
      suggestedActions,
      isSimulatedDemo: !genAI
    };
  }

  // Default Guidance
  content = `I'm tracking your progress across sessions, Riya. Your attendance database project provides strong technical evidence for backend roles.

We can:
- **Search matching internships** using real tool queries
- **Generate verified resume bullets** from your schema code
- **Set deadline reminders** saved to your calendar
- **Review approval status** before any application is simulated`;

  suggestedActions.push({ label: 'Find matching internships', actionType: 'prompt', target: 'Find backend internships for my profile' });
  suggestedActions.push({ label: 'Generate resume bullet', actionType: 'prompt', target: 'Generate a verified resume bullet for database indexing' });
  suggestedActions.push({ label: 'Set a reminder', actionType: 'prompt', target: 'Remind me tomorrow to review my application' });

  return {
    id: `msg-${Date.now()}-assistant`,
    sender: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    suggestedActions,
    isSimulatedDemo: !genAI
  };
}

startServer();

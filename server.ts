import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  SAMPLE_STUDENT,
  FICTIONAL_JOB_LISTINGS,
  INITIAL_APPLICATION,
  INITIAL_REMINDERS,
  INITIAL_CLAIMS
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

// In-Memory state with default data
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

function logActivity(description: string, type: AppActivity['type']) {
  activities.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    description,
    timestamp: new Date().toISOString(),
    type
  });
  if (activities.length > 50) activities.pop();
}

// Initialize Gemini Client if key exists
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
      mode: genAI ? 'live-gemini' : 'demo-mode'
    });
  });

  // Profile endpoints
  app.get('/api/profile', (req: Request, res: Response) => {
    res.json(currentProfile);
  });

  app.post('/api/profile', (req: Request, res: Response) => {
    const updated = req.body as Partial<StudentProfile>;
    currentProfile = { ...currentProfile, ...updated };
    logActivity(`Updated profile details for ${currentProfile.name}.`, 'profile');
    res.json(currentProfile);
  });

  app.post('/api/profile/reset-sample', (req: Request, res: Response) => {
    currentProfile = JSON.parse(JSON.stringify(SAMPLE_STUDENT));
    currentApplication = JSON.parse(JSON.stringify(INITIAL_APPLICATION));
    logActivity(`Restored sample student profile (Riya Sharma).`, 'profile');
    res.json(currentProfile);
  });

  // Jobs endpoints
  app.get('/api/jobs', (req: Request, res: Response) => {
    res.json(currentJobs);
  });

  app.post('/api/jobs/search', (req: Request, res: Response) => {
    const { query, type } = req.body;
    let filtered = currentJobs;
    if (query && typeof query === 'string') {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        j =>
          j.role.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.requiredSkills.some(s => s.toLowerCase().includes(q)) ||
          j.description.toLowerCase().includes(q)
      );
    }
    if (type && type !== 'all') {
      filtered = filtered.filter(j => j.type.toLowerCase() === type.toLowerCase());
    }
    res.json(filtered);
  });

  // Claims & Clarification endpoints
  app.get('/api/claims', (req: Request, res: Response) => {
    res.json(currentProfile.claims);
  });

  app.post('/api/claims/:id/clarify', (req: Request, res: Response) => {
    const { id } = req.params;
    const { studentAnswer, revisedText } = req.body;

    const claimIndex = currentProfile.claims.findIndex(c => c.id === id);
    if (claimIndex === -1) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const claim = currentProfile.claims[claimIndex];
    claim.status = 'Student confirmed';
    claim.resolved = true;
    claim.statedContribution = studentAnswer || claim.statedContribution;
    if (revisedText) {
      claim.revisedText = revisedText;
    } else if (!claim.revisedText) {
      claim.revisedText = `Designed the database schema and queries for a team-built attendance system.`;
    }

    // Invalidate earlier application approval because a core claim was updated
    if (currentApplication.status === 'Approved') {
      currentApplication.status = 'Ready for review';
      currentApplication.approvedVersion = null;
      currentApplication.approvedAt = null;
      logActivity(`Clarified claim "${claim.id}". Previous application approval invalidated for re-verification.`, 'claim');
    } else {
      logActivity(`Clarified claim "${claim.id}": "${claim.revisedText}"`, 'claim');
    }

    res.json({ claim, application: currentApplication });
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
      // Backend enforcement: Editing an approved or sent document MUST invalidate the earlier approval
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

    logActivity(`Approved application draft v${currentApplication.approvedVersion} for ${currentApplication.role}.`, 'application');
    res.json(currentApplication);
  });

  // Backend Simulated Sending with Duplicate Prevention
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

    // 2. Enforce that document is currently approved
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
    const { title, dueDateTime, jobRole, notes } = req.body;
    if (!title || !dueDateTime) {
      return res.status(400).json({ error: 'Title and due date/time are required.' });
    }

    const newReminder: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      dueDateTime: new Date(dueDateTime).toISOString(),
      jobRole: jobRole || currentApplication.role,
      notes: notes || '',
      completed: false,
      createdAt: new Date().toISOString()
    };

    currentReminders.unshift(newReminder);
    logActivity(`Created reminder: "${newReminder.title}" due ${new Date(newReminder.dueDateTime).toLocaleDateString()}`, 'reminder');
    res.json(newReminder);
  });

  app.patch('/api/reminders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { completed } = req.body;
    const rem = currentReminders.find(r => r.id === id);
    if (!rem) return res.status(404).json({ error: 'Reminder not found' });
    if (completed !== undefined) rem.completed = completed;
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

    // Generate grounded feedback based on student's actual project & answer
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

    // If an improvement area is identified, add or update weak area
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

    try {
      // Check if Gemini API is available and can execute tools
      if (genAI) {
        const agentResponse = await executeGeminiAgent(message.trim(), currentProfile, currentJobs, currentApplication);
        chatHistory.push(agentResponse);
        return res.json({ message: agentResponse });
      } else {
        // High-fidelity domain-native demo placement engine
        const demoResponse = executeDemoAgent(message.trim(), currentProfile, currentJobs, currentApplication);
        chatHistory.push(demoResponse);
        return res.json({ message: demoResponse });
      }
    } catch (err: any) {
      console.error('Error in /api/chat execution, falling back to reliable demo engine:', err);
      const fallbackResponse = executeDemoAgent(message.trim(), currentProfile, currentJobs, currentApplication);
      fallbackResponse.isSimulatedDemo = true;
      chatHistory.push(fallbackResponse);
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
  const hasMetricOrTech = ansLower.includes('sql') || ansLower.includes('python') || ansLower.includes('flask') || ansLower.includes('query');

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

// Gemini Agent with server-side SDK
async function executeGeminiAgent(
  userText: string,
  profile: StudentProfile,
  jobs: JobOpportunity[],
  application: ApplicationDraft
): Promise<ChatMessage> {
  if (!genAI) throw new Error('Gemini API not configured');

  const systemInstruction = `You are A-viora, an empathetic, highly practical AI placement companion for college students.
Brand tone:
- Warm, practical, non-judgmental, grounded in reality.
- Ask ONE focused clarification question at a time.
- Avoid generic motivational speeches and NEVER promise guaranteed hiring or fabricate match percentages.
- Work strictly with the student's real project facts: ${profile.name}, target: ${profile.targetRole}, skills: ${profile.skills.join(', ')}.
- Project: ${profile.projectTitle}. Stated personal contribution: ${profile.personalContribution}.
- Current application role: ${application.role} at ${application.company}.
- When student asks for job search, resume help, interview questions, or reminders, formulate actionable advice and reference tools.`;

  const response = await genAI.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: userText,
    config: {
      systemInstruction
    }
  });

  const content = response.text || "I'm listening closely. Tell me more about what you're working on.";
  return {
    id: `msg-${Date.now()}-assistant`,
    sender: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    suggestedActions: [
      { label: 'View Opportunities', actionType: 'navigate', target: 'opportunities' },
      { label: 'Application Studio', actionType: 'navigate', target: 'studio' },
      { label: 'Practise Question', actionType: 'navigate', target: 'practice' }
    ]
  };
}

// Built-in intelligent placement agent (active when API key not set or as fallback)
function executeDemoAgent(
  userText: string,
  profile: StudentProfile,
  jobs: JobOpportunity[],
  application: ApplicationDraft
): ChatMessage {
  const lower = userText.toLowerCase();
  let content = '';
  const suggestedActions: ChatMessage['suggestedActions'] = [];
  const toolActivities: ChatMessage['toolActivities'] = [];

  if (lower.includes('no experience') || lower.includes('no internship') || lower.includes('enough') || lower.includes('worry') || lower.includes('nervous')) {
    content = `Your college project is genuine engineering work—you don't need a past company brand to demonstrate real technical competence.

In your College Attendance System, you personally designed the relational schema, composite constraints, and query indexes. Tech interviewers care about whether you understand how data flows and why systems don't fail.

What part of the attendance database feels most challenging for you to explain out loud right now?`;
    suggestedActions.push({ label: 'Practise database explanation', actionType: 'navigate', target: 'practice' });
    suggestedActions.push({ label: 'Inspect verified claims', actionType: 'navigate', target: 'studio' });
  } else if (lower.includes('job') || lower.includes('internship') || lower.includes('find') || lower.includes('search') || lower.includes('opportunity')) {
    const matching = jobs.filter(j => j.requiredSkills.some(s => profile.skills.includes(s)));
    toolActivities.push({
      toolName: 'search_jobs',
      summary: `Queried catalog for roles matching skills: [${profile.skills.join(', ')}] — Found ${matching.length} suitable opportunities.`,
      status: 'success',
      linkTarget: 'opportunities'
    });
    content = `I searched our listings against your profile skills (Python, SQL, REST APIs).

I found ${matching.length} relevant roles. For example:
1. **Backend Engineering Intern** at AcuityLogix Systems (Python & SQL match directly; Docker is requested as a growth skill).
2. **Python Backend Intern** at Nexis Cloud Labs (Exact stack match for Flask routes).

Would you like to prepare your application for AcuityLogix Systems, or explore the full list?`;
    suggestedActions.push({ label: 'View Opportunities', actionType: 'navigate', target: 'opportunities' });
    suggestedActions.push({ label: 'Open Application Studio', actionType: 'navigate', target: 'studio' });
  } else if (lower.includes('claim') || lower.includes('attendance') || lower.includes('clarif') || lower.includes('entire')) {
    toolActivities.push({
      toolName: 'retrieve_project_sources',
      summary: 'Inspected README.md and schema.sql for College Attendance System ownership boundaries.',
      status: 'success',
      linkTarget: 'studio'
    });
    content = `Let's look at your attendance claim: "Built the entire attendance system."

Your repository README shows a 4-person collaborative project. When an interviewer sees an intern claiming to have built the entire system solo, it raises red flags. But when you state:
"Designed the database schema, unique student constraints, and query indexing for a 4-person attendance portal", it immediately conveys integrity and depth.

I can help you update this claim right in your Application Studio so only verified contributions appear on your exported resume.`;
    suggestedActions.push({ label: 'Open Claim in Studio', actionType: 'navigate', target: 'studio' });
  } else if (lower.includes('remind') || lower.includes('deadline') || lower.includes('tomorrow')) {
    const newRemTitle = 'Follow up on backend application review';
    const due = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
    currentReminders.unshift({
      id: `rem-${Date.now()}`,
      title: newRemTitle,
      dueDateTime: due,
      jobRole: application.role,
      notes: 'Created via A-viora chat assistant.',
      completed: false,
      createdAt: new Date().toISOString()
    });
    toolActivities.push({
      toolName: 'create_reminder',
      summary: `Saved reminder: "${newRemTitle}" set for tomorrow.`,
      status: 'success',
      linkTarget: 'reminders'
    });
    content = `I've set a reminder for you: **"${newRemTitle}"** scheduled for tomorrow. You'll see this in your Overview reminders section.

What specific area do you want to review before that?`;
    suggestedActions.push({ label: 'View Reminders', actionType: 'navigate', target: 'overview' });
  } else if (lower.includes('interview') || lower.includes('practice') || lower.includes('question')) {
    content = `Let's practise right now. Here is a real question an interviewer will ask about your database work:

**"How did you prevent duplicate attendance records if a teacher tapped the submit button twice?"**

Type your response below just as you would answer in an interview.`;
    suggestedActions.push({ label: 'Open Practice Simulator', actionType: 'navigate', target: 'practice' });
  } else if (lower.includes('resume') || lower.includes('cover note') || lower.includes('prepare')) {
    content = `Your Application Studio is loaded with your current verified facts for **${application.role}** at **${application.company}**.

Notice that unverified claims can be excluded from your final exported document so your application is 100% truthful and backed by your code.

Would you like to review the evidence excerpts or download the draft?`;
    suggestedActions.push({ label: 'Open Application Studio', actionType: 'navigate', target: 'studio' });
    suggestedActions.push({ label: 'Review Approval Status', actionType: 'navigate', target: 'tracker' });
  } else {
    content = `I hear you. When approaching campus placements, the secret isn't having ten projects—it's speaking with absolute precision about the one project you truly understand.

What would help you most right now? We can:
- Look at matching backend internships
- Strengthen your attendance project narrative
- Practise explaining technical decisions`;
    suggestedActions.push({ label: 'Find matching internships', actionType: 'navigate', target: 'opportunities' });
    suggestedActions.push({ label: 'Review project claims', actionType: 'navigate', target: 'studio' });
    suggestedActions.push({ label: 'Practise interview questions', actionType: 'navigate', target: 'practice' });
  }

  return {
    id: `msg-${Date.now()}-assistant`,
    sender: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    suggestedActions,
    toolActivities,
    isSimulatedDemo: !genAI
  };
}

startServer();

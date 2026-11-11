import { StudentProfile, JobOpportunity, ReminderItem, ApplicationDraft, ProjectClaim } from '../types';

export const INITIAL_CLAIMS: ProjectClaim[] = [
  {
    id: 'claim-1',
    text: 'Built the entire attendance system.',
    status: 'Needs clarification',
    sourceProject: 'College Attendance System',
    sourceFilename: 'README.md',
    sourceExcerpt: 'Collaborative college project built by a team of 4. Features: Student roster, faculty marking, daily export.',
    statedContribution: 'Team project with unclear individual ownership.',
    clarificationQuestion: 'Which part did you personally build?',
    revisedText: 'Designed the database schema and queries for a team-built attendance system.',
    resolved: false,
    notes: 'README states 4-person team. Claiming entire project risks credibility during technical evaluation.'
  },
  {
    id: 'claim-2',
    text: 'Designed relational database schema with unique constraints on student ID and session date to prevent duplicate attendance records.',
    status: 'Source linked',
    sourceProject: 'College Attendance System',
    sourceFilename: 'schema.sql',
    sourceExcerpt: 'CREATE TABLE attendance_records (id INTEGER PRIMARY KEY, student_id VARCHAR(16), session_date DATE, status VARCHAR(8), UNIQUE(student_id, session_date));',
    statedContribution: 'Authored schema.sql and migration script.',
    resolved: true
  },
  {
    id: 'claim-3',
    text: 'Implemented optimized SQL queries and indexing to retrieve weekly attendance metrics for 350+ students in under 50ms.',
    status: 'Student confirmed',
    sourceProject: 'College Attendance System',
    sourceFilename: 'db_queries.py',
    sourceExcerpt: 'CREATE INDEX idx_student_session ON attendance_records(student_id, session_date);',
    statedContribution: 'Wrote raw SQL queries and benchmarked response time with seeded test data.',
    resolved: true
  },
  {
    id: 'claim-4',
    text: 'Engineered Python Flask REST endpoints for recording daily attendance and exporting CSV summaries.',
    status: 'Source linked',
    sourceProject: 'College Attendance System',
    sourceFilename: 'app.py',
    sourceExcerpt: '@app.route("/api/attendance/export", methods=["GET"])\ndef export_csv():\n    return generate_attendance_csv()',
    statedContribution: 'Built the export route and CSV generation helper function.',
    resolved: true
  }
];

export const SAMPLE_STUDENT: StudentProfile = {
  id: 'student-riya-sharma',
  name: 'Riya Sharma',
  targetRole: 'Backend internship',
  skills: ['Python', 'SQL', 'Git', 'REST APIs', 'Flask'],
  locationPreferences: 'Bengaluru / Remote',
  employmentType: 'Internship',
  projectTitle: 'College Attendance System',
  projectDescription: 'Automated attendance tracking portal with secure role-based student and faculty access, daily CSV summary exports, and structured SQL storage.',
  projectReadme: `# College Attendance Management System
Collaborative college project built by a team of 4.
Repository: github.com/riya-sharma/college-attendance-system (fictional)

## Modules
1. Authentication & Faculty Auth (Built by teammate A)
2. Attendance Schema & SQL Engine (Built by Riya Sharma)
3. Web UI Templates (Built by teammate B)
4. Notification Service (Built by teammate C)

## Database Architecture
SQLite / PostgreSQL compatible schema with strict unique constraints on student IDs and session timestamps to prevent duplicate submissions.`,
  personalContribution: 'Designed the database schema and queries: Authored relational tables, unique constraints, and SQL indexing for rapid student attendance lookups; built Flask endpoints for daily CSV exports.',
  claims: INITIAL_CLAIMS,
  rawResumeText: `RIYA SHARMA
Bengaluru, India | riya.sharma@college.edu | github.com/riya-sharma (fictional)

OBJECTIVE:
Enthusiastic computer science student seeking a Backend Internship to apply database modeling, Python programming, and API engineering skills to reliable software systems.

SKILLS:
- Languages: Python, SQL
- Frameworks & Tools: Flask, SQLite, PostgreSQL basics, Git, RESTful APIs

PROJECTS:
College Attendance System (Team Project)
- Built the entire attendance system.
- Designed relational database schema with unique constraints on student ID and session date to prevent duplicate attendance records.
- Implemented optimized SQL queries and indexing to retrieve weekly attendance metrics for 350+ students in under 50ms.
- Engineered Python Flask REST endpoints for recording daily attendance and exporting CSV summaries.

EDUCATION:
B.Tech in Computer Science & Engineering (Final Year)
Relevant Coursework: Database Management Systems, Data Structures & Algorithms, Object-Oriented Programming.`
};

export const FICTIONAL_JOB_LISTINGS: JobOpportunity[] = [
  {
    id: 'job-1',
    role: 'Backend Engineering Intern',
    company: 'AcuityLogix Systems (Fictional)',
    location: 'Bengaluru (Hybrid)',
    type: 'Internship',
    requiredSkills: ['Python', 'SQL', 'REST APIs', 'Docker'],
    deadline: '2026-11-25',
    description: 'Join our data platform team building scalable microservices and database query optimization pipelines for internal analytics.',
    whyRelevant: 'Direct match for Python and relational database modeling from your attendance portal project.',
    isFictional: true
  },
  {
    id: 'job-2',
    role: 'Python Backend Intern',
    company: 'Nexis Cloud Labs (Fictional)',
    location: 'Remote',
    type: 'Internship',
    requiredSkills: ['Python', 'Flask', 'SQL', 'Git'],
    deadline: '2026-11-20',
    description: 'Help develop and maintain RESTful API endpoints for cloud infrastructure reporting and user access auditing.',
    whyRelevant: 'Exact stack alignment with your Flask routes and SQL indexing work.',
    isFictional: true
  },
  {
    id: 'job-3',
    role: 'Database & Backend Associate Intern',
    company: 'Krypton Dataworks (Fictional)',
    location: 'Hyderabad (On-site)',
    type: 'Internship',
    requiredSkills: ['SQL', 'Python', 'PostgreSQL', 'Query Optimization'],
    deadline: '2026-12-02',
    description: 'Focus on schema architecture, automated database migrations, and writing high-efficiency SQL queries for financial transaction feeds.',
    whyRelevant: 'Deep alignment with your demonstrated skills in unique constraints, query indexing, and benchmark testing.',
    isFictional: true
  },
  {
    id: 'job-4',
    role: 'Junior API Developer Intern',
    company: 'Veloce Mobility Labs (Fictional)',
    location: 'Remote',
    type: 'Internship',
    requiredSkills: ['Python', 'REST APIs', 'FastAPI', 'Redis'],
    deadline: '2026-11-28',
    description: 'Work with the telematics squad constructing fast ingest endpoints and queue consumers for electric vehicle telemetry.',
    whyRelevant: 'Your Python and REST API foundation is directly transferable; provides a bridge into asynchronous frameworks.',
    isFictional: true
  },
  {
    id: 'job-5',
    role: 'Data Infrastructure Intern',
    company: 'Meridian Analytics (Fictional)',
    location: 'Bengaluru (In-office)',
    type: 'Internship',
    requiredSkills: ['Python', 'SQL', 'ETL Pipelines', 'Pandas'],
    deadline: '2026-12-05',
    description: 'Support our core data team parsing structured datasets, scheduling validation runs, and publishing sanitized warehouse tables.',
    whyRelevant: 'Your experience exporting and validating attendance CSV summaries mirrors data ingestion fundamentals.',
    isFictional: true
  },
  {
    id: 'job-6',
    role: 'Software Engineer - Backend (Graduate)',
    company: 'Stratos Platform Technologies (Fictional)',
    location: 'Bengaluru / Pune (Hybrid)',
    type: 'Full-time',
    requiredSkills: ['Python', 'SQL', 'System Design', 'Linux', 'Docker'],
    deadline: '2026-12-15',
    description: 'Entry-level full-time backend role for graduating seniors passionate about resilient server architectures and clean domain modeling.',
    whyRelevant: 'Strong trajectory if you intend to transition immediately from your final year into production backend systems.',
    isFictional: true
  },
  {
    id: 'job-7',
    role: 'Platform Operations & Backend Intern',
    company: 'AuraGrid Solutions (Fictional)',
    location: 'Remote',
    type: 'Internship',
    requiredSkills: ['Python', 'Git', 'Linux Basics', 'CI/CD'],
    deadline: '2026-11-22',
    description: 'Build automated diagnostic scripts, review system logging schemas, and assist engineers with integration test harnesses.',
    whyRelevant: 'Leverages your Python scripting and version control workflow.',
    isFictional: true
  },
  {
    id: 'job-8',
    role: 'Web Services & API Intern',
    company: 'CognitiveWave Systems (Fictional)',
    location: 'Gurugram (Hybrid)',
    type: 'Internship',
    requiredSkills: ['Python', 'Flask', 'Postman', 'SQL'],
    deadline: '2026-11-30',
    description: 'Partner with senior developers to construct secure authentication layers, request validation middleware, and automated API docs.',
    whyRelevant: 'Matches your Flask routing experience and SQL table relationships.',
    isFictional: true
  },
  {
    id: 'job-9',
    role: 'Junior Backend Integrations Specialist',
    company: 'TetherLink Enterprise (Fictional)',
    location: 'Remote',
    type: 'Full-time',
    requiredSkills: ['Python', 'SQL', 'Webhooks', 'REST APIs', 'PostgreSQL'],
    deadline: '2026-12-10',
    description: 'Build dependable webhook receivers and database sync monitors bridging third-party CRM records with internal databases.',
    whyRelevant: 'Great fit for students with verified schema integrity skills who value transactional consistency.',
    isFictional: true
  },
  {
    id: 'job-10',
    role: 'Distributed Systems Intern',
    company: 'OmniStream Networks (Fictional)',
    location: 'Bengaluru (On-site)',
    type: 'Internship',
    requiredSkills: ['Go', 'C++', 'Distributed Consensus', 'Networking'],
    deadline: '2026-11-18',
    description: 'Research low-level packet processing and consensus mechanisms for distributed caching clusters.',
    whyRelevant: 'Showcases contrast: Go and C++ required; Python background provides general computing concepts but stack differs.',
    isFictional: true
  }
];

export const INITIAL_APPLICATION: ApplicationDraft = {
  id: 'app-default-1',
  jobId: 'job-1',
  role: 'Backend Engineering Intern',
  company: 'AcuityLogix Systems (Fictional)',
  resumeVersion: 1,
  coverNoteVersion: 1,
  resumeText: `RIYA SHARMA
Bengaluru, India | riya.sharma@college.edu

TARGET ROLE:
Backend Engineering Intern — AcuityLogix Systems (Fictional)

TECHNICAL SUMMARY:
Computer Science undergraduate with focused practical experience in relational database design, Python service development, and query indexing. Strives for honest, verifiable software representations backed by actual project implementation.

CORE SKILLS:
Python · SQL · Relational Schema Modeling · Flask · RESTful APIs · Indexing & Query Tuning · Git

EVIDENCE-BACKED PROJECT EXPERIENCE:
College Attendance System (4-Person Team Project)
- Designed relational database schema with unique constraints on student ID and session date to prevent duplicate attendance records. [Source: schema.sql]
- Implemented optimized SQL queries and indexing to retrieve weekly attendance metrics for 350+ students in under 50ms. [Source: db_queries.py]
- Engineered Python Flask REST endpoints for recording daily attendance and exporting CSV summaries. [Source: app.py]
- Designed the database schema and queries for a team-built attendance system. [Clarified Contribution]

EDUCATION:
B.Tech in Computer Science & Engineering | Anticipated 2026`,
  coverNoteText: `Dear Hiring Team at AcuityLogix Systems (Fictional),

I am applying for the Backend Engineering Intern position.

In my recent academic project—a College Attendance Management System built with a team of four—I took personal ownership of the database tier. Specifically, I designed the relational schema, configured compound unique constraints on student identifiers and session dates to eliminate duplicate entries, and implemented query indexing that retrieved 350+ student records in under 50 milliseconds.

Your opening highlights Python, SQL, and database optimization. While I am still gaining hands-on familiarity with Docker in production, my grounding in Python REST APIs and relational consistency enables me to contribute immediately to your microservices team.

I look forward to discussing how my project experience aligns with your backend engineering needs.

Sincerely,
Riya Sharma`,
  includedClaimIds: ['claim-2', 'claim-3', 'claim-4', 'claim-1'],
  status: 'Ready for review',
  approvedVersion: null,
  approvedAt: null,
  simulatedSentAt: null,
  simulatedReceiptId: null,
  lastSavedAt: new Date().toISOString(),
  isDirty: false
};

export const INITIAL_REMINDERS: ReminderItem[] = [
  {
    id: 'rem-1',
    title: 'Review attendance schema questions before AcuityLogix review',
    dueDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow
    jobRole: 'Backend Engineering Intern',
    notes: 'Practise explaining the unique composite index on (student_id, session_date).',
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'rem-2',
    title: 'Follow up on Nexis Cloud Labs submission deadline',
    dueDateTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 2 days
    jobRole: 'Python Backend Intern',
    notes: 'Check submission requirements and ensure cover note is tailored.',
    completed: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

export const INITIAL_JOB_ANALYSIS = {
  id: 'analysis-job-1',
  role: 'Backend Engineering Intern',
  company: 'AcuityLogix Systems (Fictional)',
  rawText: 'Join our data platform team building scalable microservices and database query optimization pipelines for internal analytics. Requirements: Python, SQL, REST APIs, Docker.',
  extractedSkills: ['Python', 'SQL', 'REST APIs', 'Docker', 'Relational Databases', 'Query Optimization'],
  qualifications: [
    'Enrolled in Computer Science or related degree',
    'Demonstrated experience with relational databases and query optimization',
    'Hands-on experience building backend APIs in Python',
    'Familiarity with containerization (Docker) is a plus'
  ],
  responsibilities: [
    'Build and maintain microservice endpoints in Python',
    'Optimize slow SQL queries and design composite indices',
    'Collaborate with distributed team members using Git',
    'Participate in code reviews and test validation'
  ],
  keywords: ['Python', 'SQL', 'REST APIs', 'Docker', 'Microservices', 'Query Optimization', 'Indexes'],
  analyzedAt: new Date().toISOString()
};

export const INITIAL_SKILL_GAP_REPORT = {
  id: 'gap-job-1',
  jobRole: 'Backend Engineering Intern',
  company: 'AcuityLogix Systems (Fictional)',
  matchedSkills: [
    { skill: 'Python', evidence: 'Engineered Python Flask REST endpoints for recording daily attendance and exporting CSV summaries.' },
    { skill: 'SQL & Relational Schema', evidence: 'Designed relational schema with unique composite constraints and indexed queries in schema.sql.' },
    { skill: 'REST APIs', evidence: 'Built Flask API routes for CSV exports and session verification in app.py.' },
    { skill: 'Git & Collaboration', evidence: '4-person team attendance repo with modular architecture and Git branching.' }
  ],
  missingSkills: [
    { skill: 'Docker Containerization', importance: 'high' as const, reason: 'Requested for microservices deployment and local test environments; not currently demonstrated in student repo.' },
    { skill: 'Microservices Communication', importance: 'medium' as const, reason: 'Attendance system is a monolithic Flask app; AcuityLogix builds distributed service meshes.' },
    { skill: 'Production Load Benchmarking', importance: 'medium' as const, reason: 'Attendance queries tested with 350+ mock students; needs demonstration under high concurrency.' }
  ],
  matchAssessment: 'Strong foundational match on core backend disciplines (Python, SQL modeling, REST APIs). Docker and containerized deployment represent the primary technical growth area to address in your application narrative and preparation.',
  confidenceAlignment: 'Strong Alignment' as const,
  analyzedAt: new Date().toISOString()
};

export const INITIAL_ROADMAP = {
  id: 'roadmap-job-1',
  targetRole: 'Backend Engineering Intern',
  company: 'AcuityLogix Systems (Fictional)',
  prioritySkills: [
    { skill: 'Docker & Containerization', priority: 1, rationale: 'Docker is explicitly requested in AcuityLogix requirements but unverified in your repo.' },
    { skill: 'SQL Execution Plans & EXPLAIN ANALYZE', priority: 2, rationale: 'Crucial for passing AcuityLogix query tuning and indexing technical screen.' },
    { skill: 'API Concurrency & Idempotency', priority: 3, rationale: 'Essential for discussing real-world scale and transaction isolation.' }
  ],
  dailyPlan: [
    {
      id: 'day-1',
      dayNumber: 1,
      title: 'Dockerizing the Attendance Backend',
      objective: 'Write a clean multi-stage Dockerfile for your Flask attendance app and run it locally with docker-compose.',
      tasks: [
        'Write Dockerfile for Python Flask backend with lightweight python:3.11-slim base',
        'Create docker-compose.yml mounting PostgreSQL and the Flask service',
        'Verify database migrations execute on container start'
      ],
      estimatedHours: 2,
      completed: true
    },
    {
      id: 'day-2',
      dayNumber: 2,
      title: 'Deep-Dive: SQL EXPLAIN & Indexing Mechanics',
      objective: 'Master B-tree indexing trade-offs and query execution plans for candidate interviews.',
      tasks: [
        'Run EXPLAIN ANALYZE on attendance query with and without composite index',
        'Document performance delta in README (retrieval time under 50ms)',
        'Draft crisp interview phrasing for index overhead on write operations'
      ],
      estimatedHours: 2.5,
      completed: true
    },
    {
      id: 'day-3',
      dayNumber: 3,
      title: 'HTTP Status Codes & Conflict Handling',
      objective: 'Bridge database integrity exceptions to clean REST responses (409 Conflict instead of 500 Internal Error).',
      tasks: [
        'Implement Flask exception handler for UniqueViolation integrity errors',
        'Return structured JSON error payload with error code and user-friendly message',
        'Write unit test asserting 409 status on duplicate student attendance submission'
      ],
      estimatedHours: 2,
      completed: false
    },
    {
      id: 'day-4',
      dayNumber: 4,
      title: 'API Concurrency & Connection Pooling',
      objective: 'Prepare answers for multi-user classroom submission scenarios at 9:00 AM.',
      tasks: [
        'Review SQLAlchemy / psycopg2 connection pool sizing and timeout configurations',
        'Understand database row-level locking vs table locking under concurrent inserts',
        'Practise explaining transaction isolation levels (Read Committed vs Serializable)'
      ],
      estimatedHours: 2.5,
      completed: false
    },
    {
      id: 'day-5',
      dayNumber: 5,
      title: 'Project Evidence & README Strengthening',
      objective: 'Clarify 4-person collaborative project boundaries in repository documentation.',
      tasks: [
        'Update GitHub repository README with an explicit architecture diagram showing your database tier',
        'Include benchmark stats and sample CSV export payloads in documentation',
        'Remove ambiguous "built everything" claims and anchor to authored files'
      ],
      estimatedHours: 1.5,
      completed: false
    },
    {
      id: 'day-6',
      dayNumber: 6,
      title: 'Job-Specific Technical Mock Interview',
      objective: 'Drill 5 AcuityLogix technical interview questions under timed simulated pressure.',
      tasks: [
        'Answer questions on composite indices, Docker container lifecycle, and REST idempotency',
        'Review AI feedback on technical precision and refine phrasing',
        'Save any identified weak areas to the review list'
      ],
      estimatedHours: 2,
      completed: false
    },
    {
      id: 'day-7',
      dayNumber: 7,
      title: 'Behavioral Prep & Final Application Polish',
      objective: 'Articulate collaborative teamwork, code reviews, and honest handling of knowledge gaps.',
      tasks: [
        'Practise the STAR method response for handling team disagreements on schema design',
        'Generate and download finalized PDF resume and tailored cover note',
        'Submit simulated application and secure dispatch verification receipt'
      ],
      estimatedHours: 1.5,
      completed: false
    }
  ],
  projectImprovements: [
    'Add a working Dockerfile and docker-compose.yml to the attendance repository root.',
    'Write a pytest test suite covering the 409 Conflict duplicate attendance error handler.',
    'Include benchmark script (`benchmark_queries.py`) demonstrating indexed vs unindexed query speeds.'
  ],
  interviewTopics: [
    'Composite indexing vs single-column indexing in relational databases',
    'Docker containerization best practices and multi-stage builds',
    'HTTP idempotency (PUT vs POST) and handling duplicate requests',
    'Communicating project ownership boundaries honestly in collaborative software'
  ],
  generatedAt: new Date().toISOString()
};

export const INITIAL_JOB_QUESTIONS = [
  {
    id: 'jq-1',
    question: 'In your attendance project, you configured a composite unique constraint on (student_id, session_date). How would that affect performance if we scale to 500,000 records, and what does the B-Tree index structure look like internally?',
    category: 'Technical' as const,
    context: 'Database Tier & Index Mechanics (AcuityLogix Core Requirement)',
    expectedKeyPoints: [
      'B-tree index depth increases logarithmically O(log N)',
      'Composite index evaluates leftmost column (student_id) first',
      'Index imposes write amplification on INSERTs but provides O(log N) lookup'
    ]
  },
  {
    id: 'jq-2',
    question: 'AcuityLogix relies heavily on containerized microservices. How would you containerize your Flask and database application using Docker, and how do you ensure the database is ready before the API accepts traffic?',
    category: 'Architecture' as const,
    context: 'Docker & Containerization (Growth Gap Requirement)',
    expectedKeyPoints: [
      'Multi-stage Dockerfile for lightweight image size',
      'Healthcheck and depends_on with condition: service_healthy in docker-compose',
      'Environment variable separation for credentials'
    ]
  },
  {
    id: 'jq-3',
    question: 'If two faculty members submit attendance for the same classroom simultaneously at 9:00 AM, how does your backend prevent duplicate database records without returning a 500 Internal Server Error?',
    category: 'Technical' as const,
    context: 'Concurrency, Transactions & REST Error Handling',
    expectedKeyPoints: [
      'Database unique constraint catches concurrent duplicates atomically',
      'Flask catches IntegrityError / UniqueViolation exception',
      'Translates exception to HTTP 409 Conflict with descriptive message'
    ]
  },
  {
    id: 'jq-4',
    question: 'Your college attendance system was built by a team of 4. Tell me about a time you and a teammate disagreed on a technical choice—such as database design vs frontend API contracts—and how you resolved it.',
    category: 'Behavioral / HR' as const,
    context: 'Team Collaboration & Technical Communication (STAR Method)',
    expectedKeyPoints: [
      'Clear definition of team roles and shared API contract (OpenAPI/JSON schema)',
      'Constructive debate backed by testing or prototyping',
      'Commitment to team delivery over personal ego'
    ]
  },
  {
    id: 'jq-5',
    question: 'Why AcuityLogix Systems, and how does this internship align with what you personally want to build in your backend engineering career?',
    category: 'Behavioral / HR' as const,
    context: 'Motivation & Role Fit',
    expectedKeyPoints: [
      'Passion for scalable data platforms and query tuning',
      'Desire to master production containerization (Docker) alongside senior engineers',
      'Commitment to honest, verifiable engineering contributions'
    ]
  }
];


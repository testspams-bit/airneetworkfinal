export interface SubjectScoreBreakdown {
  score: number;
  maxScore: number;
  accuracy: number; // e.g. 82%
  attempted: number;
  correct: number;
  incorrect: number;
  weakChapters: string[];
  strongChapters: string[];
}

export interface MockTestResult {
  id: string;
  testName: string;
  date: string;
  physicsScore: number;
  chemistryScore: number;
  biologyScore: number;
  totalScore: number; // out of 720
  predictedAir: string;
  percentile: number;
  negativeMarks: number;
}

export interface AspirantAssessment {
  currentScore: number;
  targetScore: number;
  predictedAir: string;
  accuracyRate: number; // e.g. 84.5
  negativeMarksLost: number;
  physics: SubjectScoreBreakdown;
  chemistry: SubjectScoreBreakdown;
  biology: SubjectScoreBreakdown;
  recentMockTests: MockTestResult[];
  mentorAuditNotes: string[];
}

export interface AspirantProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  neetTargetYear: '2025' | '2026' | '2027';
  category: 'Class 12th' | '1st Year Dropper' | '2nd Year Dropper' | 'Class 11th Foundation';
  coachingInstitute: string;
  dreamCollege: string;
  targetScore: number;
  currentMockScore: number;
  dailyStudyHours: number;
  strongSubject: 'Biology' | 'Physics' | 'Chemistry';
  weakSubject: 'Physics' | 'Chemistry' | 'Biology';
  bio: string;
  assignedMentorName: string;
  assignedMentorAir: string;
  assignedMentorCollege: string;
  streakDays: number;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  date: string;
  planName: string;
  tier: 'Purple Tier' | 'Diamond Tier' | 'Diagnostic Audit';
  amount: number;
  paymentMethod: string;
  status: 'Confirmed' | 'Completed' | 'Pending';
  mentorAssigned: string;
  mentorAir: string;
  sessionsAllocated: number;
  sessionsUsed: number;
  downloadUrl?: string;
}

export interface DialogueLine {
  timestamp: string; // e.g. "04:15"
  speaker: string; // e.g. "Ayush Prasad (AIR 200)" or "Aspirant"
  text: string;
}

export interface SessionRecordingItem {
  id: string;
  title: string;
  mentorName: string;
  mentorAir: string;
  mentorCollege: string;
  sessionDate: string;
  duration: string;
  thumbnailUrl: string;
  keyTakeaways: string[];
  actionItems: string[];
  transcript: DialogueLine[];
}

export interface StudyPlanChapter {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  name: string;
  priority: 'High Yield' | 'Moderate' | 'Foundation';
  weightage: string; // e.g. "8-12 Marks"
  completed: boolean;
}

export interface WeeklyMilestone {
  weekNumber: number;
  title: string;
  focus: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  deliverables: string[];
}

export interface DailyScheduleSlot {
  time: string;
  subject: string;
  activity: string;
  focusType: 'Theory & Recall' | 'Problem Solving' | 'PYQ Speed' | 'Error Analysis';
}

export interface MentorStudyPlan {
  planTitle: string;
  preparedBy: string;
  mentorAir: string;
  targetScoreGoal: string;
  dailySchedule: DailyScheduleSlot[];
  weeklyRoadmap: WeeklyMilestone[];
  highYieldChecklist: StudyPlanChapter[];
  mentorDirectives: string[];
  lastUpdated: string;
}

export interface DailyNeetQuestion {
  id: string;
  subject: 'Biology' | 'Physics' | 'Chemistry';
  chapter: string;
  examCitation: string;
  question: string;
  options: string[];
  correctAnswer: number; // 0-indexed
  explanation: string;
  difficulty: 'High Yield' | 'NEET Standard' | 'Tricky';
  formulaOrConceptTag: string;
}

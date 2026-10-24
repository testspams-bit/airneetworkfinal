import {
  AspirantProfile,
  AspirantAssessment,
  PaymentTransaction,
  SessionRecordingItem,
  MentorStudyPlan,
  DailyNeetQuestion,
  MockTestResult,
} from '../types/aspirant.ts';

const ASPIRANT_PROFILE_KEY = 'airneet_aspirant_profile';
const ASPIRANT_ASSESSMENT_KEY = 'airneet_aspirant_assessment';
const ASPIRANT_PAYMENTS_KEY = 'airneet_aspirant_payments';
const ASPIRANT_PLAN_KEY = 'airneet_aspirant_study_plan';
const ASPIRANT_DAILY_SOLVED_KEY = 'airneet_aspirant_daily_solved';
const ASPIRANT_STREAK_KEY = 'airneet_aspirant_streak';

export const DEFAULT_ASPIRANT_PROFILE: AspirantProfile = {
  id: 'asp_student_01',
  userId: 'student_current',
  fullName: 'Arjun Mehta',
  email: 'arjun.mehta@example.com',
  phone: '+91 98765 43210',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  neetTargetYear: '2026',
  category: 'Class 12th',
  coachingInstitute: 'Allen Career Institute, Kota',
  dreamCollege: 'AIIMS New Delhi',
  targetScore: 695,
  currentMockScore: 565,
  dailyStudyHours: 10,
  strongSubject: 'Biology',
  weakSubject: 'Physics',
  bio: 'Targeting Top 500 AIR in NEET UG. Currently focusing on eliminating -30 marks in Physics rotational motion and speeding up organic reaction conversions.',
  assignedMentorName: 'Ayush Prasad',
  assignedMentorAir: 'AIR 200',
  assignedMentorCollege: 'AIIMS New Delhi / Top Central GMC',
  streakDays: 8,
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_ASSESSMENT: AspirantAssessment = {
  currentScore: 565,
  targetScore: 695,
  predictedAir: 'AIR 4,800 – 6,200',
  accuracyRate: 83.2,
  negativeMarksLost: 36,
  physics: {
    score: 122,
    maxScore: 180,
    accuracy: 74,
    attempted: 41,
    correct: 33,
    incorrect: 8,
    weakChapters: ['Rotational Dynamics & Inertia', 'Ray Optics & Optical Instruments', 'Electromagnetic Induction'],
    strongChapters: ['Electrostatics', 'Kinematics', 'Modern Physics & Dual Nature'],
  },
  chemistry: {
    score: 148,
    maxScore: 180,
    accuracy: 84,
    attempted: 43,
    correct: 38,
    incorrect: 5,
    weakChapters: ['Ionic Equilibrium pH Numericals', 'Aldehydes, Ketones & Carboxylic Acids', 'p-Block Elements Trends'],
    strongChapters: ['Coordination Compounds', 'Solutions & Colligative Properties', 'Chemical Bonding'],
  },
  biology: {
    score: 295,
    maxScore: 360,
    accuracy: 90,
    attempted: 88,
    correct: 80,
    incorrect: 8,
    weakChapters: ['Photosynthesis & Respiration in Plants', 'Mineral Nutrition & Transport', 'Anatomy of Flowering Plants'],
    strongChapters: ['Human Physiology (Neural & Endocrine)', 'Genetics & Molecular Inheritance', 'Ecology & Environment'],
  },
  recentMockTests: [
    {
      id: 'mock_04',
      testName: 'All India Full Syllabus Major Test 04',
      date: '20 Oct 2026',
      physicsScore: 126,
      chemistryScore: 152,
      biologyScore: 302,
      totalScore: 580,
      predictedAir: 'AIR 3,900',
      percentile: 98.4,
      negativeMarks: 28,
    },
    {
      id: 'mock_03',
      testName: 'Part Syllabus Review Test (Class 12th Full)',
      date: '12 Oct 2026',
      physicsScore: 122,
      chemistryScore: 148,
      biologyScore: 295,
      totalScore: 565,
      predictedAir: 'AIR 5,100',
      percentile: 97.8,
      negativeMarks: 36,
    },
    {
      id: 'mock_02',
      testName: 'NEET Standard Full Test 02',
      date: '01 Oct 2026',
      physicsScore: 114,
      chemistryScore: 140,
      biologyScore: 288,
      totalScore: 542,
      predictedAir: 'AIR 7,400',
      percentile: 96.6,
      negativeMarks: 44,
    },
  ],
  mentorAuditNotes: [
    'Negative marks dropped from -44 in Test 02 to -28 in Test 04 after adopting the 2-pass question filtration strategy.',
    'Physics numerical accuracy in Mechanics improved +14% by sketching free-body diagrams before substituting variables.',
    'Key bottleneck remaining: Plant Physiology NCERT line memory. Advised 45 min early-morning active recall.',
  ],
};

export const DEFAULT_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'tx_984210',
    invoiceId: 'INV-NEET-2026-9842',
    date: '18 Oct 2026',
    planName: 'Purple Tier Strategy Mentorship (AIR 1 – 100 / 200)',
    tier: 'Purple Tier',
    amount: 1999,
    paymentMethod: 'UPI (Google Pay / PhonePe)',
    status: 'Confirmed',
    mentorAssigned: 'Ayush Prasad',
    mentorAir: 'AIR 200',
    sessionsAllocated: 2,
    sessionsUsed: 1,
  },
  {
    id: 'tx_981104',
    invoiceId: 'INV-NEET-2026-9811',
    date: '04 Oct 2026',
    planName: 'Diagnostic Score Audit & Negative Marking Roadmap',
    tier: 'Diagnostic Audit',
    amount: 499,
    paymentMethod: 'Razorpay UPI',
    status: 'Completed',
    mentorAssigned: 'Pree Sharma',
    mentorAir: 'AIR 1500',
    sessionsAllocated: 1,
    sessionsUsed: 1,
  },
];

export const DEFAULT_RECORDINGS: SessionRecordingItem[] = [
  {
    id: 'rec_session_01',
    title: 'Strategy Call 01: Physics Numerical Architecture & Negative Mark Protocol',
    mentorName: 'Ayush Prasad',
    mentorAir: 'AIR 200',
    mentorCollege: 'AIIMS New Delhi',
    sessionDate: '19 Oct 2026',
    duration: '42 min 18 sec',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
    keyTakeaways: [
      'Implement the "2-Pass NEET Examination Algorithm": Pass 1 covers 100% guaranteed questions in 80 mins. Pass 2 attacks calculation-heavy numericals in 60 mins.',
      'In Physics, never start solving without writing the units of given quantities. 3 out of your 8 incorrect questions were simple cm to meter conversion slips.',
      'Stop reading multiple reference books for Organic Chemistry; strictly stick to NCERT named reactions and solve MS Chouhan level-1 only.',
      'Set a timer of 45 seconds per Biology question during weekly mock drills to save a 20-minute buffer for Physics.',
    ],
    actionItems: [
      'Solve 45 numericals daily from Modern Physics and Current Electricity using a 50-minute stopwatch.',
      'Maintain a physical "Red Notebook" error log: write the exact misconception that caused each negative mark.',
      'Send weekly mock test score breakdown to Ayush on WhatsApp every Sunday evening.',
    ],
    transcript: [
      {
        timestamp: '00:15',
        speaker: 'Ayush Prasad (AIR 200)',
        text: 'Hi Arjun! I analyzed the detailed scorecard you uploaded before this call. Your Biology is sitting around 295, which is a solid foundation, but your Physics is at 122. Let’s isolate why you lost those 36 marks to negatives.',
      },
      {
        timestamp: '02:40',
        speaker: 'Arjun Mehta (Aspirant)',
        text: 'Thanks Ayush bhaiya. In Physics, whenever I see a numerical from Rotational Motion or Ray Optics, I start doing long calculations on the rough sheet, get rushed for time, and end up picking the wrong option.',
      },
      {
        timestamp: '05:10',
        speaker: 'Ayush Prasad (AIR 200)',
        text: 'That is the single most common reason students with high potential get stuck between 520 and 580. In NEET, you have roughly 1 minute per question. You must not fight questions in Pass 1. If a numerical has more than 3 lines of algebra, mark it for Pass 2 and move straight to the direct questions.',
      },
      {
        timestamp: '11:25',
        speaker: 'Ayush Prasad (AIR 200)',
        text: 'Also, look at your test paper: in Electrostatics question 14, you forgot to square the distance in Coulomb’s law. That is not a concept issue; that is anxiety and rushing. We will eliminate at least 20 negative marks simply by enforcing the units check.',
      },
      {
        timestamp: '23:45',
        speaker: 'Arjun Mehta (Aspirant)',
        text: 'Understood. What should my daily timetable look like for the next 30 days while balancing coaching classes?',
      },
      {
        timestamp: '24:10',
        speaker: 'Ayush Prasad (AIR 200)',
        text: 'I have uploaded your custom 90-day timetable right here in your Aspirant Dashboard under "Plan Prepared". You will do 2 hours of Bio NCERT line revision first thing at 6 AM, followed by 3 hours of Physics problem solving.',
      },
      {
        timestamp: '39:50',
        speaker: 'Ayush Prasad (AIR 200)',
        text: 'Remember, cracking Top 1,000 AIR in NEET is not about genius; it is an engineering discipline of eliminating silly mistakes. Follow the plan and we will review your progress in our next call next week!',
      },
    ],
  },
  {
    id: 'rec_session_02',
    title: 'Diagnostic Audit Call: Error Log Analysis & NCERT Extraction',
    mentorName: 'Pree Sharma',
    mentorAir: 'AIR 1500',
    mentorCollege: 'GMC Bhopal',
    sessionDate: '05 Oct 2026',
    duration: '34 min 50 sec',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    keyTakeaways: [
      'Identify the difference between "Unattempted" and "Wild Guess". In NEET, an incorrect guess penalizes you by -5 marks relative to a correct answer.',
      'Biology NCERT summary pages and scientist intro paragraphs contain 3-4 direct questions every year. Do not skip them.',
      'Physical chemistry formula sheet must be revised daily before sleeping for 15 minutes.',
    ],
    actionItems: [
      'Stop making blind guesses when 2 options remain; apply dimensional elimination.',
      'Prepare summary flashcards for inorganic oxidation states and anomalies.',
    ],
    transcript: [
      {
        timestamp: '01:05',
        speaker: 'Pree Sharma (AIR 1500)',
        text: 'Hello Arjun! Welcome to the AIR NEETwork audit. Let us go through your diagnostic sheet line by line to discover where your score is leaking.',
      },
      {
        timestamp: '08:20',
        speaker: 'Pree Sharma (AIR 1500)',
        text: 'You made 8 mistakes in Plant Physiology alone. If you just convert those 8 incorrects to corrects, your score jumps from 542 to 582 in one single paper!',
      },
    ],
  },
];

export const DEFAULT_STUDY_PLAN: MentorStudyPlan = {
  planTitle: 'Target 690+ 90-Day Tactical NEET Revision Blueprint',
  preparedBy: 'Ayush Prasad',
  mentorAir: 'AIR 200',
  targetScoreGoal: '690+ / 720 (AIIMS / Top GMC Admission)',
  lastUpdated: '20 Oct 2026',
  mentorDirectives: [
    'No new theory books or exotic question banks. Stick 100% to NCERT, class notes, and 2019–2024 NEET PYQs.',
    'Daily 45-minute timed sprint: Solve 45 Physics questions in 45 minutes every evening to build competitive exam temperament.',
    'Biology NCERT active recall: Read a chapter, close the book, and write down all key enzyme names, examples, and cycle steps from memory.',
    'Every Sunday afternoon 02:00 PM – 05:20 PM: Simulate the actual NEET exam under strict room conditions with an OMR sheet.',
  ],
  dailySchedule: [
    {
      time: '06:00 AM – 08:30 AM',
      subject: 'Biology (Botany / Zoology)',
      activity: 'NCERT Line-by-Line Active Recall & Diagram Labeling',
      focusType: 'Theory & Recall',
    },
    {
      time: '09:30 AM – 01:00 PM',
      subject: 'Physics',
      activity: 'High-Yield Numerical Problem Solving (45–50 Questions)',
      focusType: 'Problem Solving',
    },
    {
      time: '02:30 PM – 05:30 PM',
      subject: 'Chemistry',
      activity: 'Organic Reaction Pathways & Physical Chemistry PYQs',
      focusType: 'PYQ Speed',
    },
    {
      time: '06:30 PM – 08:30 PM',
      subject: 'Physics & Chemistry',
      activity: 'Error Notebook Review & Formula Retention Drill',
      focusType: 'Error Analysis',
    },
    {
      time: '09:30 PM – 10:45 PM',
      subject: 'All Subjects',
      activity: 'Daily NEET Question (OQAD) & Daily Performance Reflection',
      focusType: 'Theory & Recall',
    },
  ],
  weeklyRoadmap: [
    {
      weekNumber: 1,
      title: 'Foundation Mechanics & Electrostatics Consolidation',
      focus: 'Eliminate negative marking in vector mechanics and capacitor numericals.',
      status: 'completed',
      deliverables: [
        'Complete 150 PYQs from Kinematics and Work-Power-Energy',
        'Master Coulomb Law, Gauss Law & Dielectric Capacitors',
        'Score 130+ in Sunday Minor Test',
      ],
    },
    {
      weekNumber: 2,
      title: 'Organic Chemistry Reactions & Plant Physiology Surge',
      focus: 'Convert 8 weak chapters into strength areas with targeted NCERT flashcards.',
      status: 'in_progress',
      deliverables: [
        'Draw all named organic reactions on one chart paper (Reimer-Tiemann, Aldol, Cannizzaro)',
        'Master Photosynthesis Light & Dark reactions line-by-line',
        'Complete 90 Chemistry numericals from Solutions & Chemical Kinetics',
      ],
    },
    {
      weekNumber: 3,
      title: 'Current Electricity, Magnetism & Human Physiology Drill',
      focus: 'Speed mastery: aim for 40 seconds per question in Human Physiology.',
      status: 'upcoming',
      deliverables: [
        'Kirchhoff Law, Potentiometer, Galvanometer conversion numericals',
        'Endocrine & Nervous System high-yield diagram review',
        'Attempt NEET 2023 Original Paper under timed exam conditions',
      ],
    },
    {
      weekNumber: 4,
      title: 'Full Syllabus Major Mock 01 & Negative Marking Audit',
      focus: 'Benchmark full 720-mark score against Top 1,000 AIR cutoff curve.',
      status: 'upcoming',
      deliverables: [
        'Simulate full exam on official 200-question NTA pattern with OMR',
        'Attend 1-on-1 strategy review call with AIR 200 Ayush',
        'Push composite score above 600+ threshold',
      ],
    },
  ],
  highYieldChecklist: [
    { id: 'ch_phy_01', subject: 'Physics', name: 'Electrostatics & Electric Potential', priority: 'High Yield', weightage: '12-16 Marks', completed: true },
    { id: 'ch_phy_02', subject: 'Physics', name: 'Current Electricity & Circuit Solving', priority: 'High Yield', weightage: '12-16 Marks', completed: true },
    { id: 'ch_phy_03', subject: 'Physics', name: 'Modern Physics & Dual Nature of Radiation', priority: 'High Yield', weightage: '16-20 Marks', completed: true },
    { id: 'ch_phy_04', subject: 'Physics', name: 'Ray Optics & Optical Instruments', priority: 'High Yield', weightage: '12-16 Marks', completed: false },
    { id: 'ch_phy_05', subject: 'Physics', name: 'Rotational Motion & Moment of Inertia', priority: 'High Yield', weightage: '12-16 Marks', completed: false },
    { id: 'ch_phy_06', subject: 'Physics', name: 'Electromagnetic Induction & AC Circuits', priority: 'Moderate', weightage: '8-12 Marks', completed: false },
    { id: 'ch_chem_01', subject: 'Chemistry', name: 'Coordination Compounds & CFT', priority: 'High Yield', weightage: '12-16 Marks', completed: true },
    { id: 'ch_chem_02', subject: 'Chemistry', name: 'Chemical Bonding & Molecular Structure', priority: 'High Yield', weightage: '16 Marks', completed: true },
    { id: 'ch_chem_03', subject: 'Chemistry', name: 'Solutions & Colligative Properties', priority: 'High Yield', weightage: '8-12 Marks', completed: true },
    { id: 'ch_chem_04', subject: 'Chemistry', name: 'Aldehydes, Ketones & Carboxylic Acids', priority: 'High Yield', weightage: '12-16 Marks', completed: false },
    { id: 'ch_chem_05', subject: 'Chemistry', name: 'Ionic Equilibrium & Solubility Product (Ksp)', priority: 'High Yield', weightage: '8-12 Marks', completed: false },
    { id: 'ch_chem_06', subject: 'Chemistry', name: 'Hydrocarbons & Isomerism Basics', priority: 'Moderate', weightage: '8-12 Marks', completed: false },
    { id: 'ch_bio_01', subject: 'Biology', name: 'Principles of Inheritance & Variation (Genetics)', priority: 'High Yield', weightage: '24-28 Marks', completed: true },
    { id: 'ch_bio_02', subject: 'Biology', name: 'Molecular Basis of Inheritance (DNA/RNA)', priority: 'High Yield', weightage: '28-32 Marks', completed: true },
    { id: 'ch_bio_03', subject: 'Biology', name: 'Human Reproduction & Reproductive Health', priority: 'High Yield', weightage: '20-24 Marks', completed: true },
    { id: 'ch_bio_04', subject: 'Biology', name: 'Plant Physiology: Photosynthesis & Respiration', priority: 'High Yield', weightage: '20-24 Marks', completed: false },
    { id: 'ch_bio_05', subject: 'Biology', name: 'Cell Cycle & Cell Division', priority: 'High Yield', weightage: '16-20 Marks', completed: false },
    { id: 'ch_bio_06', subject: 'Biology', name: 'Biotechnology: Principles and Processes', priority: 'High Yield', weightage: '16-20 Marks', completed: false },
  ],
};

export const DAILY_NEET_QUESTIONS_BANK: DailyNeetQuestion[] = [
  {
    id: 'oqad_01',
    subject: 'Biology',
    chapter: 'Cell Cycle and Cell Division',
    examCitation: 'NEET 2022 Official Paper',
    question: 'Which of the following events does NOT take place during mitosis?',
    options: [
      'Chromosome condensation',
      'Spindle fiber attachment to kinetochores',
      'Homologous chromosome pairing and synapsis',
      'Centrioles moving to opposite poles',
    ],
    correctAnswer: 2,
    explanation: 'Homologous chromosome pairing and crossing-over (synapsis) occur exclusively during Prophase I of Meiosis (specifically Zygotene and Pachytene), never in Mitosis. Mitosis separates sister chromatids without pairing.',
    difficulty: 'High Yield',
    formulaOrConceptTag: 'NCERT Class 11 · Chapter 10 (Page 168)',
  },
  {
    id: 'oqad_02',
    subject: 'Physics',
    chapter: 'Electrostatics',
    examCitation: 'NEET High-Yield PYQ Pattern',
    question: 'A parallel-plate capacitor is charged by a battery and then disconnected. A dielectric slab of constant K is inserted to fill the space between the plates. What happens to its stored electrostatic energy?',
    options: [
      'Increases by a factor of K',
      'Decreases to 1/K of its original value',
      'Remains completely unchanged',
      'Increases by a factor of K²',
    ],
    correctAnswer: 1,
    explanation: 'When disconnected from the battery, charge Q remains constant. The capacitance increases to C\' = K·C. The electrostatic energy is U = Q² / (2C). Since capacitance is multiplied by K in the denominator, U\' = U / K.',
    difficulty: 'NEET Standard',
    formulaOrConceptTag: 'U = Q² / (2C) · Disconnected Battery Rule',
  },
  {
    id: 'oqad_03',
    subject: 'Chemistry',
    chapter: 'Coordination Compounds',
    examCitation: 'NEET 2023 Standard',
    question: 'Which among the following complexes is expected to absorb the longest wavelength of light in the visible region?',
    options: [
      '[Co(NH₃)₆]³⁺',
      '[Co(CN)₆]³⁻',
      '[Co(H₂O)₆]³⁺',
      '[CoF₆]³⁻',
    ],
    correctAnswer: 3,
    explanation: 'According to the Spectrochemical Series, crystal field splitting energy (Δ₀) follows: CN⁻ > NH₃ > H₂O > F⁻. Since Δ₀ = hc / λ, the wavelength absorbed (λ) is inversely proportional to Δ₀. The weakest field ligand F⁻ creates the smallest crystal field splitting Δ₀, thereby absorbing the longest wavelength (lowest frequency) of visible light.',
    difficulty: 'High Yield',
    formulaOrConceptTag: 'Spectrochemical Series · Δ₀ = hc/λ Inverse Relationship',
  },
  {
    id: 'oqad_04',
    subject: 'Biology',
    chapter: 'Molecular Basis of Inheritance',
    examCitation: 'NEET 2023 Manipur / 2021',
    question: 'If a double-stranded DNA contains 20% Cytosine, what will be the percentage of Adenine in this DNA sample?',
    options: [
      '20%',
      '30%',
      '40%',
      '60%',
    ],
    correctAnswer: 1,
    explanation: 'By Chargaff’s Rule: %C = %G, so Cytosine (20%) + Guanine (20%) = 40%. The remaining 60% consists equally of Adenine and Thymine (%A = %T). Therefore, %A = 60% / 2 = 30%.',
    difficulty: 'NEET Standard',
    formulaOrConceptTag: 'Chargaff’s Equivalence Rule (%A + %T + %G + %C = 100%)',
  },
  {
    id: 'oqad_05',
    subject: 'Physics',
    chapter: 'Current Electricity',
    examCitation: 'NEET 2024 Practice Drill',
    question: 'A wire of resistance R is stretched uniformly such that its length increases by 10%. Assuming density remains constant, the new percentage increase in its resistance is approximately:',
    options: [
      '10%',
      '21%',
      '19%',
      '25%',
    ],
    correctAnswer: 1,
    explanation: 'Since volume V = A·L is constant, stretching by 10% makes L\' = 1.1L and A\' = A / 1.1. New resistance R\' = ρ·L\'/A\' = ρ·(1.1L)/(A/1.1) = (1.1)²·R = 1.21·R. The percentage increase is ((1.21 - 1) / 1) × 100 = 21%.',
    difficulty: 'Tricky',
    formulaOrConceptTag: 'R ∝ L² when volume is conserved upon stretching',
  },
  {
    id: 'oqad_06',
    subject: 'Chemistry',
    chapter: 'Chemical Thermodynamics',
    examCitation: 'NEET 2022 Re-Exam',
    question: 'For a spontaneous process at all temperatures, which of the following conditions must be satisfied?',
    options: [
      'ΔH > 0 and ΔS > 0',
      'ΔH < 0 and ΔS > 0',
      'ΔH > 0 and ΔS < 0',
      'ΔH < 0 and ΔS < 0',
    ],
    correctAnswer: 1,
    explanation: 'From the Gibbs-Helmholtz equation ΔG = ΔH - TΔS. A process is strictly spontaneous when ΔG < 0. If ΔH is negative (exothermic) and ΔS is positive (entropy increase), ΔG will always remain negative regardless of the absolute temperature T.',
    difficulty: 'High Yield',
    formulaOrConceptTag: 'Gibbs Criterion ΔG = ΔH - TΔS < 0',
  },
];

// Persistent Helpers
export function getAspirantStorageKey(baseKey: string, userEmail?: string, userId?: string): string {
  const id = (userEmail || userId || '').trim().toLowerCase();
  if (!id || id === 'student_active' || id === 'student_current') {
    return baseKey;
  }
  const safeId = id.replace(/[^a-z0-9_-]/g, '_');
  return `${baseKey}_${safeId}`;
}

export function loadAspirantProfile(userEmail?: string, userName?: string, userId?: string): AspirantProfile {
  if (typeof window === 'undefined') return DEFAULT_ASPIRANT_PROFILE;
  try {
    const key = getAspirantStorageKey(ASPIRANT_PROFILE_KEY, userEmail, userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (userEmail && parsed.email !== userEmail) {
        parsed.email = userEmail;
      }
      if (userName && (!parsed.fullName || parsed.fullName === 'Arjun Mehta')) {
        parsed.fullName = userName;
      }
      return parsed;
    }

    // If this is an authenticated user logging in or registering for the first time
    if (userEmail || (userId && userId !== 'student_active' && userId !== 'student_current')) {
      const freshProfile: AspirantProfile = {
        ...DEFAULT_ASPIRANT_PROFILE,
        id: userId || 'asp_' + Math.random().toString(36).substring(2, 9),
        userId: userId || '',
        fullName: userName || (userEmail ? userEmail.split('@')[0] : 'NEET Aspirant'),
        email: userEmail || '',
        phone: '',
        coachingInstitute: '',
        dreamCollege: '',
        targetScore: 680,
        currentMockScore: 520,
        dailyStudyHours: 8,
        bio: 'Aiming for top rank in NEET UG. Ready to execute custom preparation roadmap.',
        isProfileComplete: false,
        streakDays: 1,
        updatedAt: new Date().toISOString(),
      };
      return freshProfile;
    }

    // Demo/guest fallback
    const fallbackRaw = localStorage.getItem(ASPIRANT_PROFILE_KEY);
    if (fallbackRaw) {
      return JSON.parse(fallbackRaw);
    }
  } catch (e) {
    console.error('Error loading aspirant profile:', e);
  }
  const initial = { ...DEFAULT_ASPIRANT_PROFILE };
  if (userEmail) initial.email = userEmail;
  if (userName) initial.fullName = userName;
  return initial;
}

export function saveAspirantProfile(profile: AspirantProfile, userEmail?: string, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    profile.updatedAt = new Date().toISOString();
    profile.isProfileComplete = true;
    const key = getAspirantStorageKey(ASPIRANT_PROFILE_KEY, profile.email || userEmail, profile.userId || userId);
    localStorage.setItem(key, JSON.stringify(profile));
    localStorage.setItem(ASPIRANT_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving aspirant profile:', e);
  }
}

export function loadAspirantAssessment(userEmail?: string, userId?: string): AspirantAssessment {
  if (typeof window === 'undefined') return DEFAULT_ASSESSMENT;
  try {
    const key = getAspirantStorageKey(ASPIRANT_ASSESSMENT_KEY, userEmail, userId);
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    const fallback = localStorage.getItem(ASPIRANT_ASSESSMENT_KEY);
    if (fallback) return JSON.parse(fallback);
  } catch (e) {
    console.error('Error loading aspirant assessment:', e);
  }
  return DEFAULT_ASSESSMENT;
}

export function saveAspirantAssessment(assessment: AspirantAssessment, userEmail?: string, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const key = getAspirantStorageKey(ASPIRANT_ASSESSMENT_KEY, userEmail, userId);
    localStorage.setItem(key, JSON.stringify(assessment));
    localStorage.setItem(ASPIRANT_ASSESSMENT_KEY, JSON.stringify(assessment));
  } catch (e) {
    console.error('Error saving aspirant assessment:', e);
  }
}

export function addMockTestToAssessment(newTest: MockTestResult, userEmail?: string, userId?: string): AspirantAssessment {
  const current = loadAspirantAssessment(userEmail, userId);
  const updatedTests = [newTest, ...current.recentMockTests];
  const updated: AspirantAssessment = {
    ...current,
    currentScore: newTest.totalScore,
    predictedAir: newTest.predictedAir,
    recentMockTests: updatedTests,
  };
  saveAspirantAssessment(updated, userEmail, userId);
  return updated;
}

export function loadAspirantPayments(): PaymentTransaction[] {
  if (typeof window === 'undefined') return DEFAULT_PAYMENTS;
  try {
    const raw = localStorage.getItem(ASPIRANT_PAYMENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading aspirant payments:', e);
  }
  return DEFAULT_PAYMENTS;
}

export function loadMentorStudyPlan(): MentorStudyPlan {
  if (typeof window === 'undefined') return DEFAULT_STUDY_PLAN;
  try {
    const raw = localStorage.getItem(ASPIRANT_PLAN_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading study plan:', e);
  }
  return DEFAULT_STUDY_PLAN;
}

export function togglePlanChapter(chapterId: string): MentorStudyPlan {
  const plan = loadMentorStudyPlan();
  const updatedChapters = plan.highYieldChecklist.map((ch) =>
    ch.id === chapterId ? { ...ch, completed: !ch.completed } : ch
  );
  const updatedPlan = { ...plan, highYieldChecklist: updatedChapters, lastUpdated: 'Today' };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ASPIRANT_PLAN_KEY, JSON.stringify(updatedPlan));
    } catch (e) {
      console.error('Error saving chapter toggle:', e);
    }
  }
  return updatedPlan;
}

export function loadSolvedQuestions(): string[] {
  if (typeof window === 'undefined') return ['oqad_01'];
  try {
    const raw = localStorage.getItem(ASPIRANT_DAILY_SOLVED_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading solved questions:', e);
  }
  return ['oqad_01'];
}

export function markQuestionSolved(questionId: string): string[] {
  const solved = loadSolvedQuestions();
  if (!solved.includes(questionId)) {
    const updated = [...solved, questionId];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ASPIRANT_DAILY_SOLVED_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving solved question:', e);
      }
    }
    return updated;
  }
  return solved;
}

export function getAspirantStreak(): number {
  if (typeof window === 'undefined') return 8;
  try {
    const raw = localStorage.getItem(ASPIRANT_STREAK_KEY);
    if (raw) return parseInt(raw, 10) || 8;
  } catch (e) {
    console.error('Error loading streak:', e);
  }
  return 8;
}

export function incrementAspirantStreak(): number {
  const current = getAspirantStreak();
  const next = current + 1;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ASPIRANT_STREAK_KEY, String(next));
    } catch (e) {
      console.error('Error saving streak:', e);
    }
  }
  return next;
}

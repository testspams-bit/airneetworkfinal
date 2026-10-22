import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  Trophy,
  ClipboardCheck,
  ShieldCheck,
  Award,
  ExternalLink,
  Info,
  Calendar,
  User,
  Phone,
  GraduationCap,
  LogIn,
  UserCheck,
  LayoutGrid,
  Sparkle
} from 'lucide-react';
import { getCurrentAuthUser, type AuthUserData } from '../lib/supabase.ts';
import { createSessionRequest } from '../utils/sessionRequestStorage.ts';

export interface BookingPaymentFlowProps {
  theme: 'dark' | 'light';
  initialMentor?: string;
  initialTier?: string;
  initialMode?: 'choose_topper' | 'diagnostic_test';
  onComplete?: (bookingRef: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export interface WireframeMentor {
  id: string;
  name: string;
  rank: string;
  score: string;
  college: string;
  specialty: string;
  tier: 'Purple' | 'Diamond';
  bracket: 'AIR 1–100' | 'AIR 100–5000';
}

const WIREFRAME_MENTORS: WireframeMentor[] = [
  {
    id: 'topper_ayush',
    name: 'Ayush Bhalotia',
    rank: 'AIR 04',
    score: '710/720',
    college: 'AIIMS New Delhi',
    specialty: 'Physics 180/180 Mastery, PYQ Pattern Decoding & Speed Drills',
    tier: 'Purple',
    bracket: 'AIR 1–100',
  },
  {
    id: 'topper_vanisha',
    name: 'Vanisha Satish',
    rank: 'AIR 51',
    score: '695/720',
    college: 'AIIMS New Delhi',
    specialty: 'Organic Chemistry Roadmaps, Elimination Techniques & Mock Stamina',
    tier: 'Purple',
    bracket: 'AIR 1–100',
  },
  {
    id: 'topper_soumya',
    name: 'Soumya Bhadole',
    rank: 'AIR 77',
    score: '700/720',
    college: 'AIIMS New Delhi',
    specialty: 'NCERT Biology Active Extraction & Zero Negative Marks Strategy',
    tier: 'Purple',
    bracket: 'AIR 1–100',
  },
  {
    id: 'topper_chaitra',
    name: 'Chaithra',
    rank: 'AIR 142',
    score: '695/720',
    college: 'Maulana Azad Medical College (MAMC), New Delhi',
    specialty: 'Physical Chemistry Calculations & Marathon Time Management',
    tier: 'Diamond',
    bracket: 'AIR 100–5000',
  },
  {
    id: 'topper_ayush_prasad',
    name: 'Ayush Prasad',
    rank: 'AIR 200',
    score: '686/720',
    college: 'University College of Medical Sciences (UCMS), Delhi',
    specialty: 'High-Yield Physics Formulas, Negative Mark Elimination & PYQs',
    tier: 'Diamond',
    bracket: 'AIR 100–5000',
  },
  {
    id: 'topper_pree_sharma',
    name: 'Pree Sharma',
    rank: 'AIR 1500',
    score: '662/720',
    college: "King George's Medical University (KGMU), Lucknow",
    specialty: 'Biology Diagram Memorization, NCERT Keywords & 90-Day Sprint',
    tier: 'Diamond',
    bracket: 'AIR 100–5000',
  },
  {
    id: 'topper_anushka',
    name: 'Anushka',
    rank: 'AIR 3000',
    score: '648/720',
    college: 'Bangalore Medical College and Research Institute (BMCRI)',
    specialty: 'Mock Test Error Analysis, Converting Negatives into Strengths',
    tier: 'Diamond',
    bracket: 'AIR 100–5000',
  },
];

interface DiagnosticQuestion {
  id: number;
  subject: 'Physics' | 'Chemistry' | 'Biology';
  question: string;
  options: string[];
  correctIndex: number;
  weaknessFlag: string;
}

const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    subject: 'Physics',
    question: 'A ball dropped from height H rebounds to height 0.81H after striking the floor. What is the coefficient of restitution (e)?',
    options: ['0.81', '0.90', '0.656', '0.729'],
    correctIndex: 1,
    weaknessFlag: 'Physics Numerical Speed & Direct Formula Intuition',
  },
  {
    id: 2,
    subject: 'Physics',
    question: 'A parallel-plate capacitor is charged to Q and disconnected from the battery. If plate separation is doubled, what happens to stored energy?',
    options: ['It remains unchanged', 'It is halved', 'It is doubled', 'It is quadrupled'],
    correctIndex: 2,
    weaknessFlag: 'Conceptual Physics Mechanics & Field Logic',
  },
  {
    id: 3,
    subject: 'Chemistry',
    question: 'For the reaction N₂(g) + 3H₂(g) ⇌ 2NH₃(g), what is the relationship between Kp and Kc?',
    options: ['Kp = Kc(RT)⁻²', 'Kp = Kc(RT)²', 'Kp = Kc(RT)⁻¹', 'Kp = Kc'],
    correctIndex: 0,
    weaknessFlag: 'Physical Chemistry Thermodynamic Relations',
  },
  {
    id: 4,
    subject: 'Chemistry',
    question: 'Which of the following alkyl halides undergoes S_N1 nucleophilic substitution at the fastest rate?',
    options: ['CH₃Cl (Methyl chloride)', 'CH₃CH₂Cl (Ethyl chloride)', '(CH₃)₂CHCl (Isopropyl chloride)', '(CH₃)₃CCl (tert-Butyl chloride)'],
    correctIndex: 3,
    weaknessFlag: 'Organic Chemistry Reaction Kinetics & Carbocation Stability',
  },
  {
    id: 5,
    subject: 'Biology',
    question: 'In a dihybrid cross between two heterozygous parents (AaBb × AaBb), what fraction of progeny will be homozygous recessive (aabb)?',
    options: ['1/4', '1/8', '1/16', '9/16'],
    correctIndex: 2,
    weaknessFlag: 'Genetics Probability & NCERT Pedigree Extraction',
  },
];

export const BookingPaymentFlow: React.FC<BookingPaymentFlowProps> = ({
  theme,
  initialMentor,
  initialTier = 'Purple',
  initialMode,
  onComplete,
  onClose,
  isModal = false,
}) => {
  const isDark = theme === 'dark';

  const [step, setStep] = useState<
    | 'reg_preference'
    | 'reg_wait'
    | 'advisory_decision'
    | 'login_check'
    | 'assessment_test'
    | 'mentors_wireframe'
    | 'details_and_payment'
    | 'confirmed'
  >(
    initialMode === 'diagnostic_test'
      ? 'assessment_test'
      : initialMode === 'choose_topper'
      ? 'mentors_wireframe'
      : 'reg_preference'
  );

  const [currentTier, setCurrentTier] = useState<string>(
    initialTier.toLowerCase().includes('diamond') ? 'Diamond' : 'Purple'
  );

  const [selectedMentor, setSelectedMentor] = useState<WireframeMentor>(() => {
    if (initialMentor) {
      const found = WIREFRAME_MENTORS.find((m) =>
        m.name.toLowerCase().includes(initialMentor.toLowerCase())
      );
      if (found) return found;
    }
    return initialTier.toLowerCase().includes('diamond')
      ? WIREFRAME_MENTORS[2]
      : WIREFRAME_MENTORS[0];
  });

  // Current logged in user status
  const [currentUser, setCurrentUser] = useState<AuthUserData | null>(() => getCurrentAuthUser());

  // Assessment state
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [diagnosedWeakness, setDiagnosedWeakness] = useState<string>('');

  // Minimal User Data (Only enough to locate payment)
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [targetYear, setTargetYear] = useState('NEET 2025 (Class 12 / Dropper)');
  const [utrNumber, setUtrNumber] = useState('');

  // Payment states
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingRef, setBookingRef] = useState('');

  const upiId = 'airneetwork@okaxis';
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=AIR%20NEETwork&am=1&cu=INR&tn=Slot%20Reservation%20Token`;

  useEffect(() => {
    if (initialTier) {
      setCurrentTier(initialTier.toLowerCase().includes('diamond') ? 'Diamond' : 'Purple');
    }
  }, [initialTier]);

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Step 1: Handle Register Later, Pay First
  const handleRegisterLaterPayFirst = () => {
    setStep('advisory_decision');
  };

  // Step 1: Handle Register Before Paying
  const handleRegisterBeforePaying = () => {
    setStep('reg_wait');
  };

  // Step 2: "Let us select" -> Assessment flow with Login Check
  const handleLetUsSelect = () => {
    const user = getCurrentAuthUser();
    setCurrentUser(user);
    if (!user) {
      // Must register/login before assessment
      setStep('login_check');
    } else {
      setQIndex(0);
      setUserAnswers({});
      setStep('assessment_test');
    }
  };

  // Step 2: "Let me select" -> Wireframe Mentors Page
  const handleLetMeSelect = () => {
    setStep('mentors_wireframe');
  };

  // Assessment question handler
  const handleAnswerQuestion = (ansIdx: number) => {
    const updated = { ...userAnswers, [qIndex]: ansIdx };
    setUserAnswers(updated);

    if (qIndex < DIAGNOSTIC_QUESTIONS.length - 1) {
      setQIndex((prev) => prev + 1);
    } else {
      // Complete diagnostic assessment & match
      let wrongBio = 0;
      let wrongChem = 0;
      let wrongPhys = 0;

      DIAGNOSTIC_QUESTIONS.forEach((q, idx) => {
        if (updated[idx] !== q.correctIndex) {
          if (q.subject === 'Biology') wrongBio++;
          else if (q.subject === 'Chemistry') wrongChem++;
          else if (q.subject === 'Physics') wrongPhys++;
        }
      });

      let weakness = 'Physics Mechanics & Speed Formula Retrieval';
      let match = WIREFRAME_MENTORS[0]; // Aryan AIR 48

      if (wrongBio > wrongPhys && wrongBio >= wrongChem) {
        weakness = 'NCERT Line Traps, Assertion-Reasoning & Zero Negative Elimination';
        match = WIREFRAME_MENTORS[1]; // Sneha AIR 84
      } else if (wrongChem > wrongPhys && wrongChem > wrongBio) {
        weakness = 'Organic Reaction Mechanisms & Negative Mark Elimination';
        match = WIREFRAME_MENTORS[2]; // Rohan AIR 184
      }

      setDiagnosedWeakness(weakness);
      setSelectedMentor(match);
      setStep('details_and_payment');
    }
  };

  // Wireframe mentor selection
  const handleSelectWireframeMentor = (mentor: WireframeMentor) => {
    setSelectedMentor(mentor);
    setStep('details_and_payment');
  };

  // Payment confirmation
  const handleConfirmPayRupeeOne = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!userName.trim()) {
      setErrorMsg('Please enter your full name so we can locate your payment.');
      return;
    }
    const cleanDigits = userPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const generated = `AIR-SLOT-${Math.floor(1000 + Math.random() * 9000)}`;
      setBookingRef(generated);

      const record = {
        bookingRef: generated,
        name: userName.trim(),
        phone: cleanDigits,
        targetYear,
        utr: utrNumber.trim() || `UPI-REC-${Date.now().toString().slice(-6)}`,
        tier: currentTier,
        mentor: selectedMentor.name,
        mentorRank: selectedMentor.rank,
        mentorCollege: selectedMentor.college,
        diagnosedWeakness: diagnosedWeakness || undefined,
        timestamp: new Date().toISOString(),
        feePaid: '₹1 (Slot Request Token)',
      };

      try {
        const stored = JSON.parse(localStorage.getItem('airneet_slot_bookings') || '[]');
        stored.unshift(record);
        localStorage.setItem('airneet_slot_bookings', JSON.stringify(stored));

        // Sync into session request storage for mentor confirmation
        createSessionRequest({
          studentId: currentUser?.id || `aspirant_${cleanDigits}`,
          studentName: userName.trim(),
          studentEmail: currentUser?.email || `${userName.trim().toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          studentPhone: cleanDigits,
          topperId: 'topper_active',
          topperName: selectedMentor.name,
          topperAir: selectedMentor.rank,
          topperCollege: selectedMentor.college,
          requestedDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          requestedSlotId: 'e1',
          requestedSlotLabel: '06:00 PM – 07:00 PM',
          neetAspirantYear: `NEET ${targetYear}`,
          doubtTopic: diagnosedWeakness || 'Strategy consultation & negative marking elimination',
          sessionFee: 1,
        });
      } catch {
        // storage fallback
      }

      setIsProcessing(false);
      setStep('confirmed');
      if (onComplete) onComplete(generated);
    }, 850);
  };

  const isPurple = currentTier === 'Purple';

  return (
    <div className={`w-full ${isModal ? 'max-w-2xl mx-auto' : 'max-w-3xl mx-auto'}`}>
      {/* Top Header Card Summary */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isPurple ? 'bg-[#c084fc]' : 'bg-[#38bdf8]'
            }`}
          />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Selected Tier: {isPurple ? 'AIR 1–100 (Purple Tier)' : 'Diamond (AIR 100–5000)'}
          </span>
          <span
            className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
              isPurple
                ? 'bg-purple-500/10 text-purple-300 border-purple-500/40'
                : 'bg-sky-500/10 text-sky-300 border-sky-500/40'
            }`}
          >
            {isPurple ? '₹1,999 (Offer)' : 'Fixed ₹1,499'}
          </span>
        </div>

        {step !== 'reg_preference' && step !== 'confirmed' && (
          <button
            type="button"
            onClick={() => {
              if (step === 'details_and_payment') setStep('advisory_decision');
              else if (step === 'mentors_wireframe') setStep('advisory_decision');
              else if (step === 'assessment_test') setStep('advisory_decision');
              else if (step === 'login_check') setStep('advisory_decision');
              else if (step === 'reg_wait') setStep('reg_preference');
              else setStep('reg_preference');
            }}
            className="text-xs font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        )}
      </div>

      {/* ================= STEP 1: REGISTRATION PREFERENCE ================= */}
      {step === 'reg_preference' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center sm:text-left space-y-1">
            <div
              className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                isPurple ? 'text-[#c084fc]' : 'text-[#38bdf8]'
              }`}
            >
              [ SLOT REQUEST SETUP · ₹1 TOKEN ]
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight uppercase">
              Choose How You Wish to Proceed
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Reserve your prioritized 1-on-1 slot for just ₹1 token fee.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Option A: Register before paying */}
            <button
              type="button"
              onClick={handleRegisterBeforePaying}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between hover:scale-[1.01] ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
                  : 'bg-slate-50 border-slate-300 hover:border-slate-400 hover:bg-white'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-zinc-800 text-zinc-300">
                  <UserCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-1.5">Register before paying</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Create your aspirant account profile first before securing your slot.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase mt-6 text-zinc-300">
                <span>Select option</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Option B: Register later, pay first */}
            <button
              type="button"
              onClick={handleRegisterLaterPayFirst}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between hover:scale-[1.01] ${
                isDark
                  ? 'bg-zinc-900 border-[#CCFF00]/40 hover:border-[#CCFF00] hover:shadow-[0_0_20px_rgba(204,255,0,0.1)]'
                  : 'bg-white border-[#0066FF]/40 hover:border-[#0066FF] hover:shadow-md'
              }`}
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
                    isDark ? 'bg-[#CCFF00]/15 text-[#CCFF00]' : 'bg-[#0066FF]/15 text-[#0066FF]'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-1.5">Register later, pay first</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Fast-track your slot request with a ₹1 token now and register later.
                </p>
              </div>

              <div
                className={`flex items-center gap-1.5 text-xs font-mono font-bold uppercase mt-6 ${
                  isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
                }`}
              >
                <span>Continue & pay ₹1 first</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 1B: REGISTER BEFORE PAYING PLACEHOLDER ================= */}
      {step === 'reg_wait' && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border text-center space-y-5 ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-md'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300">
            <UserCheck className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-bold uppercase">Register Before Paying</h3>
            <p className={`text-xs mt-1 max-w-sm mx-auto ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Account registration is queued. You can proceed with your payment directly:
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* The user requested: "If Registered is click ill tell later what to do with it just keep the button for pay now." */}
            <button
              type="button"
              onClick={() => setStep('advisory_decision')}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg active:scale-95 ${
                isDark
                  ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                  : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
              }`}
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2: ADVISORY NOTE & DECISION ================= */}
      {step === 'advisory_decision' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Small to the point note as specifically requested */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
              isDark
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                : 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
            }`}
          >
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs font-semibold leading-relaxed">
              <strong>Notice:</strong> We suggest take assessment first, do not blindly follow the rank.
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight uppercase">
              How Would You Like to Match with Your Mentor?
            </h2>
            <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Select your preferred approach below to proceed with your ₹1 slot request.
            </p>
          </div>

          {/* Two Buttons: Left: Let me select | Right: Let us select */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Left Button: Let me select */}
            <button
              type="button"
              onClick={handleLetMeSelect}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between hover:scale-[1.01] ${
                isDark
                  ? 'bg-zinc-900/60 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'
                  : 'bg-slate-50 border-slate-300 hover:border-slate-400 hover:bg-white'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-zinc-800 text-zinc-300">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-1.5">Let me select</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Browse the mentors wireframe catalog and choose the ranker you want.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase mt-6 text-zinc-300">
                <span>Open mentors wireframe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Right Button: Let us select (Redirects to take assessment) */}
            <button
              type="button"
              onClick={handleLetUsSelect}
              className={`p-6 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between hover:scale-[1.01] ${
                isDark
                  ? 'bg-zinc-900 border-[#CCFF00]/40 hover:border-[#CCFF00] hover:shadow-[0_0_20px_rgba(204,255,0,0.1)]'
                  : 'bg-white border-[#0066FF]/40 hover:border-[#0066FF] hover:shadow-md'
              }`}
            >
              <div>
                <div
                  className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
                    isDark ? 'bg-[#CCFF00]/15 text-[#CCFF00]' : 'bg-[#0066FF]/15 text-[#0066FF]'
                  }`}
                >
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold mb-1.5">Let us select</h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
                  Attempt our quick 5-question diagnostic test so we can algorithmically pair you with the best match.
                </p>
              </div>

              <div
                className={`flex items-center gap-1.5 text-xs font-mono font-bold uppercase mt-6 ${
                  isDark ? 'text-[#CCFF00]' : 'text-[#0066FF]'
                }`}
              >
                <span>Take assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2B: LOGIN REQUIRED BEFORE ASSESSMENT ================= */}
      {step === 'login_check' && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border text-center space-y-5 animate-fadeIn ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-md'
          }`}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <LogIn className="w-6 h-6" />
          </div>

          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 mb-1">
              [ ACCOUNT REQUIRED FOR ASSESSMENT ]
            </div>
            <h3 className="text-xl font-bold uppercase">Please Register / Log In</h3>
            <p className={`text-xs mt-1.5 max-w-sm mx-auto ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Before taking the diagnostic test, please log in or create an account so your assessment score and mentor report are saved.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                // Dispatch event to open existing LoginModal in signup mode
                window.dispatchEvent(
                  new CustomEvent('airneet_show_auth_error', {
                    detail: { message: 'Please sign up or log in to take the assessment.', mode: 'signup' },
                  })
                );
              }}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                isDark
                  ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                  : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
              }`}
            >
              Register / Sign In Now
            </button>

            <button
              type="button"
              onClick={() => {
                // Allow proceeding to assessment directly
                setQIndex(0);
                setUserAnswers({});
                setStep('assessment_test');
              }}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider border cursor-pointer ${
                isDark ? 'border-zinc-700 text-zinc-300 hover:text-white' : 'border-slate-300 text-slate-700'
              }`}
            >
              Continue Test as Guest Aspirant
            </button>
          </div>
        </div>
      )}

      {/* ================= STEP 2C: ASSESSMENT TEST (WHEN "LET US SELECT" IS CHOSEN) ================= */}
      {step === 'assessment_test' && (
        <div
          className={`p-6 sm:p-8 rounded-2xl border space-y-6 animate-fadeIn ${
            isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                  isDark ? 'bg-zinc-800 text-[#CCFF00]' : 'bg-slate-100 text-[#0066FF]'
                }`}
              >
                Question {qIndex + 1} of {DIAGNOSTIC_QUESTIONS.length}
              </span>
              <span className="text-xs font-mono text-zinc-400">
                · {DIAGNOSTIC_QUESTIONS[qIndex].subject}
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">Diagnostic Assessment</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isDark ? 'bg-[#CCFF00]' : 'bg-[#0066FF]'}`}
              style={{ width: `${((qIndex + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }}
            />
          </div>

          <h3 className="text-base sm:text-lg font-bold leading-snug">
            {DIAGNOSTIC_QUESTIONS[qIndex].question}
          </h3>

          <div className="space-y-2.5">
            {DIAGNOSTIC_QUESTIONS[qIndex].options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnswerQuestion(idx)}
                className={`w-full p-3.5 rounded-xl text-left text-xs sm:text-sm font-medium transition-all border flex items-center justify-between cursor-pointer ${
                  isDark
                    ? 'bg-zinc-950 border-zinc-800 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 border ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </div>
                <ArrowRight className="w-4 h-4 opacity-40 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================= STEP 3: MENTORS WIREFRAME PAGE (WHEN "LET ME SELECT" IS CHOSEN) ================= */}
      {step === 'mentors_wireframe' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400">
                [ MENTOR SELECTION · WIREFRAME PROTOTYPE ]
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase">
                Select Your Verified Ranker
              </h2>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Filtered: {isPurple ? 'AIR 1–100' : 'AIR 100–5000'}
            </div>
          </div>

          <p className="text-xs text-zinc-400 font-mono">
            * Wireframe layout. Select a mentor to open basic details and slot reservation.
          </p>

          {/* Wireframe Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WIREFRAME_MENTORS.filter((m) =>
              isPurple ? m.bracket === 'AIR 1–100' : m.bracket === 'AIR 100–5000'
            ).map((mentor) => (
              <div
                key={mentor.id}
                className={`p-5 rounded-2xl border border-dashed transition-all flex flex-col justify-between ${
                  isDark
                    ? 'bg-zinc-950/90 border-zinc-700 hover:border-[#CCFF00] hover:bg-zinc-900'
                    : 'bg-slate-50 border-slate-300 hover:border-[#0066FF] hover:bg-white'
                }`}
              >
                <div>
                  {/* Schematic Wireframe Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        mentor.tier === 'Purple'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/40'
                          : 'bg-sky-500/10 text-sky-300 border-sky-500/40'
                      }`}
                    >
                      {mentor.rank}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      NEET {mentor.score}
                    </span>
                  </div>

                  <h3 className="text-base font-bold mb-1">{mentor.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{mentor.college}</span>
                  </div>

                  <p className="text-[11px] font-mono text-zinc-300 mt-2 p-2 rounded bg-zinc-900/80 border border-zinc-800">
                    <span className="text-zinc-500">Focus:</span> {mentor.specialty}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => handleSelectWireframeMentor(mentor)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border ${
                      isDark
                        ? 'bg-zinc-800 text-white border-zinc-600 hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00]'
                        : 'bg-slate-800 text-white border-slate-700 hover:bg-[#0066FF] hover:border-[#0066FF]'
                    }`}
                  >
                    <span>Select This Mentor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= STEP 4: BASIC DETAILS MENU + PAY RUPEE ONE ================= */}
      {step === 'details_and_payment' && (
        <form onSubmit={handleConfirmPayRupeeOne} className="space-y-6 animate-fadeIn">
          {/* Chosen Mentor Summary Strip */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-zinc-400">Assigned / Selected Mentor:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-bold text-sm">{selectedMentor.name}</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-[#CCFF00]">
                  {selectedMentor.rank}
                </span>
                <span className="text-xs text-zinc-400">({selectedMentor.college})</span>
              </div>
              {diagnosedWeakness && (
                <span className="text-[11px] font-mono text-emerald-400 block mt-1">
                  Diagnostic Target: {diagnosedWeakness}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-400">Slot Token:</span>
              <span className="text-sm font-mono font-bold text-emerald-400">₹1 Only</span>
            </div>
          </div>

          {/* User Details: Only enough to locate payment */}
          <div
            className={`p-6 rounded-2xl border space-y-4 ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="border-b border-zinc-800/60 pb-2">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <User className="w-4 h-4 text-[#CCFF00]" />
                <span>Basic Details (To Locate Your Payment)</span>
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                We only need your name and WhatsApp number to trace your ₹1 payment on our merchant statement.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none transition-all ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600 focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none transition-all ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600 focus:border-[#CCFF00]'
                      : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Target NEET Session
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono focus:outline-none ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-700 text-white focus:border-[#CCFF00]'
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#0066FF]'
                }`}
              >
                <option value="NEET 2025 (Class 12 / Dropper)">NEET 2025 (Class 12 / Dropper)</option>
                <option value="NEET 2026 (Class 11)">NEET 2026 (Class 11)</option>
                <option value="NEET 2027 (Foundation)">NEET 2027 (Foundation)</option>
              </select>
            </div>
          </div>

          {/* Pay Rupee One to Request Slot Section */}
          <div
            className={`p-6 rounded-2xl border space-y-5 ${
              isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#CCFF00]" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  Pay Rupee One to Request Slot
                </h4>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                Amount: ₹1
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* QR Mockup for ₹1 */}
              <div
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${
                  isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="p-3 bg-white rounded-xl shadow mb-2">
                  <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="24" height="24" fill="black" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="18" y="18" width="8" height="8" fill="black" />
                    <rect x="66" y="10" width="24" height="24" fill="black" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="74" y="18" width="8" height="8" fill="black" />
                    <rect x="10" y="66" width="24" height="24" fill="black" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="18" y="74" width="8" height="8" fill="black" />
                    <rect x="42" y="14" width="6" height="6" fill="black" />
                    <rect x="52" y="14" width="6" height="6" fill="black" />
                    <rect x="42" y="24" width="16" height="6" fill="black" />
                    <rect x="14" y="42" width="10" height="6" fill="black" />
                    <rect x="30" y="42" width="6" height="16" fill="black" />
                    <rect x="42" y="42" width="16" height="16" fill="#7c3aed" />
                    <rect x="64" y="42" width="10" height="6" fill="black" />
                    <rect x="80" y="42" width="6" height="16" fill="black" />
                    <rect x="42" y="66" width="6" height="10" fill="black" />
                    <rect x="52" y="74" width="16" height="6" fill="black" />
                    <text x="50" y="53" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">₹1</text>
                  </svg>
                </div>
                <div className="text-[11px] font-mono text-zinc-400">Scan with GPay / PhonePe / Paytm</div>
                <div className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">Payable: ₹1.00</div>
              </div>

              {/* UPI ID + Intent */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                    Merchant UPI ID:
                  </label>
                  <div
                    className={`flex items-center justify-between p-2.5 rounded-xl border font-mono text-xs ${
                      isDark ? 'bg-zinc-900 border-zinc-700 text-zinc-200' : 'bg-slate-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    <span className="font-bold select-all">{upiId}</span>
                    <button
                      type="button"
                      onClick={copyUpiId}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 text-xs text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <a
                  href={upiPayUrl}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border transition-colors ${
                    isDark
                      ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:text-white hover:border-zinc-500'
                      : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  <span>Pay ₹1 via UPI App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                    UTR / UPI Ref ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="12-digit UTR from payment SMS"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono focus:outline-none ${
                      isDark
                        ? 'bg-zinc-900 border-zinc-700 text-white placeholder-zinc-600 focus:border-[#CCFF00]'
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#0066FF]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Final Pay Rupee 1 Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                isProcessing
                  ? 'opacity-70 cursor-wait'
                  : isDark
                  ? 'bg-[#CCFF00] text-black hover:bg-[#d8ff33]'
                  : 'bg-[#0066FF] text-white hover:bg-[#0052cc]'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isProcessing ? 'Verifying ₹1 Slot Reservation...' : 'Pay Rupee 1 to Request Slot'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ================= STEP 5: CONFIRMED ================= */}
      {step === 'confirmed' && (
        <div
          className={`p-6 sm:p-10 rounded-3xl border text-center font-mono space-y-6 ${
            isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-slate-200 shadow-xl'
          }`}
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest mb-1">
              [ ₹1 SLOT REQUEST LOGGED ]
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">
              Slot Reserved Successfully!
            </h3>
            <p className={`text-xs sm:text-sm mt-2 max-w-md mx-auto font-sans leading-relaxed ${isDark ? 'text-zinc-400' : 'text-slate-600'}`}>
              Thank you, <strong>{userName}</strong>. Your 1-on-1 strategy slot has been prioritized.
              Our academic coordination team will contact you on WhatsApp at <strong>{userPhone}</strong> within 4 hours.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl text-left border space-y-2.5 max-w-md mx-auto text-xs ${
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <span className="text-zinc-400">Booking Ref ID:</span>
              <span className="font-bold text-[#CCFF00] text-sm">{bookingRef}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Mentor:</span>
              <span className="font-bold">{selectedMentor.name} ({selectedMentor.rank})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Cohort:</span>
              <span>{targetYear}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Fee Paid:</span>
              <span className="text-emerald-400 font-bold">₹1.00 Token Verified</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              setStep('reg_preference');
            }}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Done & Return to AIR NEETwork
          </button>
        </div>
      )}
    </div>
  );
};

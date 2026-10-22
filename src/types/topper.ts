export type Gender = 'Male' | 'Female' | 'Other';
export type LanguageOption = 'H' | 'E' | 'Both';
export type CoachingMode = 'Self-Study' | 'Classroom / Offline' | 'Online' | 'Hybrid';

export interface SubjectWiseMarks {
  physics: number;
  chemistry: number;
  biology: number;
}

export interface TopperProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  gender: Gender;
  yearOfNeet: string;
  numberOfAttempts: string;
  language: LanguageOption;
  currentCollege: string;
  airRank: string;
  totalMarks: number;
  coachingMode: CoachingMode;
  coachingName: string;
  subjectWiseMarks: SubjectWiseMarks;
  sessionRate?: number;
  sessionRateDisplay?: string;
  phone?: string;
  email?: string;
  bio?: string;
  isProfileComplete: boolean;
  registeredAt: string;
}

export interface SlotTimeDefinition {
  id: string;
  label: string; // e.g. "06:00 PM – 07:00 PM"
  period: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface DaySlotAvailability {
  dateStr: string; // "YYYY-MM-DD"
  displayDate: string; // "24 Oct"
  dayOfWeek: string; // "Thu"
  isWeekend: boolean;
  enabledSlots: string[]; // list of Slot IDs
}

export interface MonthlyAvailability {
  topperId: string;
  monthName: string; // "October – November 2026"
  days: Record<string, DaySlotAvailability>; // keyed by dateStr
  updatedAt: string;
}

/**
 * Auto-calculates fixed per-session honorarium rate strictly based on AIR:
 * - AIR 1–10: ₹1,500 / ₹1,999 (rate = 1500)
 * - AIR 10–100: ₹1,299
 * - AIR 100–500: ₹1,199
 * - AIR 500–1000: ₹1,000
 * - Beyond AIR 1000: ₹900
 */
export function calculateSessionRateByAir(airRank: string | number): { rate: number; display: string } {
  const cleanStr = String(airRank || '').replace(/\D/g, '');
  const numericAir = parseInt(cleanStr, 10);

  if (isNaN(numericAir) || numericAir <= 0) {
    return { rate: 900, display: '₹900' };
  }
  if (numericAir <= 10) {
    return { rate: 1500, display: '₹1,500 / ₹1,999' };
  }
  if (numericAir <= 100) {
    return { rate: 1299, display: '₹1,299' };
  }
  if (numericAir <= 500) {
    return { rate: 1199, display: '₹1,199' };
  }
  if (numericAir <= 1000) {
    return { rate: 1000, display: '₹1,000' };
  }
  return { rate: 900, display: '₹900' };
}

export interface SessionRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  topperId: string;
  topperName: string;
  topperAir?: string;
  topperCollege?: string;
  requestedDate: string; // "YYYY-MM-DD"
  requestedSlotId: string;
  requestedSlotLabel: string; // "07:00 PM – 08:00 PM"
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  neetAspirantYear?: string;
  doubtTopic?: string;
  sessionFee?: number;
  meetingLink?: string;
  confirmedAt?: string;
  createdAt: string;
}

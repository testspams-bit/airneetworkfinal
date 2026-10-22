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
  phone?: string;
  email?: string;
  bio?: string;
  isProfileComplete: boolean;
  registeredAt: string;
}

export interface SlotTimeDefinition {
  id: string;
  label: string; // e.g. "06:00 PM - 07:00 PM"
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
  monthName: string; // "October - November 2026"
  days: Record<string, DaySlotAvailability>; // keyed by dateStr
  updatedAt: string;
}

import {
  type TopperProfile,
  type SlotTimeDefinition,
  type DaySlotAvailability,
  type MonthlyAvailability,
} from '../types/topper.ts';

export const STANDARD_SLOTS: SlotTimeDefinition[] = [
  { id: 'm1', label: '10:00 AM – 11:00 AM', period: 'morning' },
  { id: 'm2', label: '11:30 AM – 12:30 PM', period: 'morning' },
  { id: 'a1', label: '02:30 PM – 03:30 PM', period: 'afternoon' },
  { id: 'a2', label: '04:00 PM – 05:00 PM', period: 'afternoon' },
  { id: 'e1', label: '06:00 PM – 07:00 PM', period: 'evening' },
  { id: 'e2', label: '07:30 PM – 08:30 PM', period: 'evening' },
  { id: 'n1', label: '09:00 PM – 10:00 PM', period: 'night' },
  { id: 'n2', label: '10:15 PM – 11:15 PM', period: 'night' },
];

export function getNextMonthDays(): DaySlotAvailability[] {
  const days: DaySlotAvailability[] = [];
  const now = new Date();

  // Start from tomorrow, generate 30 days ahead
  for (let i = 1; i <= 30; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const dayOfWeek = dayNames[d.getDay()];
    const displayDate = `${d.getDate()} ${monthNames[d.getMonth()]}`;
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;

    // Default weekday evening slot preset
    const defaultSlots = isWeekend ? ['m1', 'e1', 'n1'] : ['e1', 'n1'];

    days.push({
      dateStr,
      displayDate,
      dayOfWeek,
      isWeekend,
      enabledSlots: defaultSlots,
    });
  }

  return days;
}

const TOPPER_PROFILE_KEY_PREFIX = 'airneet_topper_profile_';
const TOPPER_SLOTS_KEY_PREFIX = 'airneet_topper_slots_';

export function getInitialTopperProfile(userId: string, email?: string, name?: string): TopperProfile {
  return {
    id: userId,
    name: name || '',
    gender: 'Male',
    yearOfNeet: '2024',
    numberOfAttempts: '1st Attempt',
    language: 'Both',
    currentCollege: 'AIIMS New Delhi',
    airRank: '',
    totalMarks: 700,
    coachingMode: 'Classroom / Offline',
    coachingName: 'Allen Kota',
    subjectWiseMarks: {
      physics: 175,
      chemistry: 175,
      biology: 350,
    },
    email: email || '',
    isProfileComplete: false,
    registeredAt: new Date().toISOString(),
  };
}

export function loadTopperProfile(userId: string, fallbackEmail?: string, fallbackName?: string): TopperProfile {
  if (typeof window === 'undefined') {
    return getInitialTopperProfile(userId, fallbackEmail, fallbackName);
  }

  const saved = localStorage.getItem(TOPPER_PROFILE_KEY_PREFIX + userId);
  if (saved) {
    try {
      return JSON.parse(saved) as TopperProfile;
    } catch {
      // fallback
    }
  }

  // Check generic topper profile if specific ID not found
  const generic = localStorage.getItem('airneet_topper_profile_active');
  if (generic) {
    try {
      const parsed = JSON.parse(generic) as TopperProfile;
      return { ...parsed, id: userId, email: fallbackEmail || parsed.email };
    } catch {
      // fallback
    }
  }

  return getInitialTopperProfile(userId, fallbackEmail, fallbackName);
}

export function saveTopperProfile(profile: TopperProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOPPER_PROFILE_KEY_PREFIX + profile.id, JSON.stringify(profile));
  localStorage.setItem('airneet_topper_profile_active', JSON.stringify(profile));
}

export function loadMonthlyAvailability(topperId: string): MonthlyAvailability {
  if (typeof window === 'undefined') {
    return createDefaultMonthlyAvailability(topperId);
  }

  const saved = localStorage.getItem(TOPPER_SLOTS_KEY_PREFIX + topperId);
  if (saved) {
    try {
      return JSON.parse(saved) as MonthlyAvailability;
    } catch {
      // fallback
    }
  }

  const created = createDefaultMonthlyAvailability(topperId);
  saveMonthlyAvailability(created);
  return created;
}

export function createDefaultMonthlyAvailability(topperId: string): MonthlyAvailability {
  const daysList = getNextMonthDays();
  const daysRecord: Record<string, DaySlotAvailability> = {};
  daysList.forEach((d) => {
    daysRecord[d.dateStr] = d;
  });

  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setMonth(now.getMonth() + 1);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    topperId,
    monthName: `${monthNames[now.getMonth()]} – ${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`,
    days: daysRecord,
    updatedAt: new Date().toISOString(),
  };
}

export function saveMonthlyAvailability(availability: MonthlyAvailability): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOPPER_SLOTS_KEY_PREFIX + availability.topperId, JSON.stringify(availability));
  localStorage.setItem('airneet_topper_slots_active', JSON.stringify(availability));
}

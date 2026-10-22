import {
  type TopperProfile,
  type SlotTimeDefinition,
  type DaySlotAvailability,
  type MonthlyAvailability,
  calculateSessionRateByAir,
} from '../types/topper.ts';

export const TOP_COACHING_INSTITUTES = [
  'Allen Career Institute (Kota / Pan-India)',
  'Aakash Educational Services / BYJU’S',
  'Physics Wallah (PW Vidyapeeth / Pathshala)',
  'Sri Chaitanya Educational Institutions',
  'Narayana Medical Academy',
  'Resonance Eduventures',
  'Motion Education (Kota)',
  'Career Point',
  'Vibrant Academy',
  'Unacademy Centers / Online',
  'Other (Enter Custom Institute)',
];

export const AVATAR_PRESETS = [
  { id: 'av1', label: 'Doctor Coat Male', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80' },
  { id: 'av2', label: 'Doctor Coat Female', url: 'https://images.unsplash.com/photo-1594824813571-638f02614d3f?w=150&auto=format&fit=crop&q=80' },
  { id: 'av3', label: 'Medic Male Steth', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80' },
  { id: 'av4', label: 'Medic Female Scrubs', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80' },
  { id: 'av5', label: 'Student Resident Male', url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80' },
  { id: 'av6', label: 'Student Resident Female', url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80' },
];

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
const TOPPER_LIST_KEY = 'airneet_all_registered_toppers';

import ayushImg from '../assets/images/topper_ayush_bhalotia_1792645070973.jpg';
import vanishaImg from '../assets/images/topper_vanisha_satish_1792645084843.jpg';
import soumyaImg from '../assets/images/topper_soumya_bhadole_1792645099359.jpg';
import chaitraImg from '../assets/images/topper_chaitra_1792645113775.jpg';
import ayushPrasadImg from '../assets/images/topper_ayush_prasad_1792646191202.jpg';
import preeSharmaImg from '../assets/images/topper_pree_sharma_1792646189878.jpg';
import anushkaImg from '../assets/images/topper_anushka_1792646190737.jpg';

export const DEFAULT_INITIAL_TOPPERS: TopperProfile[] = [
  {
    id: 'topper_ayush',
    name: 'Ayush Bhalotia',
    avatarUrl: ayushImg,
    gender: 'Male',
    yearOfNeet: '2024',
    numberOfAttempts: '1st Attempt',
    language: 'Both',
    currentCollege: 'AIIMS New Delhi',
    airRank: '04',
    totalMarks: 710,
    coachingMode: 'Classroom / Offline',
    coachingName: 'Allen Career Institute (Kota / Pan-India)',
    subjectWiseMarks: { physics: 180, chemistry: 175, biology: 355 },
    sessionRate: 1500,
    sessionRateDisplay: '₹1,500 / ₹1,999',
    bio: 'AIR 4 at AIIMS New Delhi with 180/180 in Physics. Masters high-stakes PYQ pattern mapping, NCERT precision recall, and 45-day final test phase conditioning.',
    isProfileComplete: true,
    registeredAt: '2024-06-10T00:00:00.000Z',
  },
  {
    id: 'topper_vanisha',
    name: 'Vanisha Satish',
    avatarUrl: vanishaImg,
    gender: 'Female',
    yearOfNeet: '2024',
    numberOfAttempts: '1st Attempt',
    language: 'Both',
    currentCollege: 'AIIMS New Delhi',
    airRank: '51',
    totalMarks: 695,
    coachingMode: 'Classroom / Offline',
    coachingName: 'Aakash Educational Services / BYJU’S',
    subjectWiseMarks: { physics: 170, chemistry: 175, biology: 350 },
    sessionRate: 1299,
    sessionRateDisplay: '₹1,299',
    bio: 'AIR 51 at AIIMS New Delhi. Expert in organic reaction roadmaps, rapid option elimination, and converting score plateaus (600+) into top-tier medical ranks.',
    isProfileComplete: true,
    registeredAt: '2024-06-12T00:00:00.000Z',
  },
  {
    id: 'topper_soumya',
    name: 'Soumya Bhadole',
    avatarUrl: soumyaImg,
    gender: 'Female',
    yearOfNeet: '2024',
    numberOfAttempts: '1st Attempt',
    language: 'Both',
    currentCollege: 'AIIMS New Delhi',
    airRank: '77',
    totalMarks: 700,
    coachingMode: 'Classroom / Offline',
    coachingName: 'Allen Career Institute (Kota / Pan-India)',
    subjectWiseMarks: { physics: 175, chemistry: 170, biology: 355 },
    sessionRate: 1299,
    sessionRateDisplay: '₹1,299',
    bio: 'AIR 77 (Category Rank 4) at AIIMS New Delhi. Specializes in converting negative marks into guaranteed 355+ in Biology via active recall and line-by-line NCERT extraction.',
    isProfileComplete: true,
    registeredAt: '2024-06-14T00:00:00.000Z',
  },
  {
    id: 'topper_chaitra',
    name: 'Chaithra',
    avatarUrl: chaitraImg,
    gender: 'Female',
    yearOfNeet: '2024',
    numberOfAttempts: '1st Attempt',
    language: 'Both',
    currentCollege: 'Maulana Azad Medical College (MAMC), New Delhi',
    airRank: '142',
    totalMarks: 695,
    coachingMode: 'Classroom / Offline',
    coachingName: 'Narayana Medical Academy',
    subjectWiseMarks: { physics: 170, chemistry: 170, biology: 355 },
    sessionRate: 1199,
    sessionRateDisplay: '₹1,199',
    bio: 'AIR 142 at MAMC New Delhi. Guides aspirants on conquering mock exam panic, physical chemistry calculations, and maintaining peak focus during the final 3-hour marathon.',
    isProfileComplete: true,
    registeredAt: '2024-06-18T00:00:00.000Z',
  },
  {
    id: 'topper_ayush_prasad',
    name: 'Ayush Prasad',
    avatarUrl: ayushPrasadImg,
    gender: 'Male',
    yearOfNeet: '2024',
    numberOfAttempts: '1st Attempt',
    language: 'Both',
    currentCollege: 'University College of Medical Sciences (UCMS), Delhi',
    airRank: '200',
    totalMarks: 686,
    coachingMode: 'Classroom / Offline',
    coachingName: 'Allen Career Institute (Kota / Pan-India)',
    subjectWiseMarks: { physics: 170, chemistry: 166, biology: 350 },
    sessionRate: 1199,
    sessionRateDisplay: '₹1,199',
    bio: 'AIR 200 at UCMS Delhi. Highly systematic mentorship focused on mastering High-Yield Physics formulas, eliminating silly mistakes in organic chemistry, and time-saving paper-solving tactics.',
    isProfileComplete: true,
    registeredAt: '2024-06-20T00:00:00.000Z',
  },
  {
    id: 'topper_pree_sharma',
    name: 'Pree Sharma',
    avatarUrl: preeSharmaImg,
    gender: 'Female',
    yearOfNeet: '2024',
    numberOfAttempts: '1st Attempt',
    language: 'Both',
    currentCollege: "King George's Medical University (KGMU), Lucknow",
    airRank: '1500',
    totalMarks: 662,
    coachingMode: 'Hybrid',
    coachingName: 'Physics Wallah (PW Vidyapeeth / Pathshala)',
    subjectWiseMarks: { physics: 156, chemistry: 160, biology: 346 },
    sessionRate: 900,
    sessionRateDisplay: '₹900',
    bio: 'AIR 1500 at KGMU Lucknow. Expert in biology diagrammatic memorization, NCERT high-frequency keywords, and maintaining balanced mental stamina during the final 90 days.',
    isProfileComplete: true,
    registeredAt: '2024-06-22T00:00:00.000Z',
  },
  {
    id: 'topper_anushka',
    name: 'Anushka',
    avatarUrl: anushkaImg,
    gender: 'Female',
    yearOfNeet: '2024',
    numberOfAttempts: '1st Attempt',
    language: 'Both',
    currentCollege: 'Bangalore Medical College and Research Institute (BMCRI)',
    airRank: '3000',
    totalMarks: 648,
    coachingMode: 'Classroom / Offline',
    coachingName: 'Aakash Educational Services / BYJU’S',
    subjectWiseMarks: { physics: 152, chemistry: 156, biology: 340 },
    sessionRate: 900,
    sessionRateDisplay: '₹900',
    bio: 'AIR 3000 at BMCRI Bangalore. Proven strategy for mock test analysis, converting negative marks into strengths, and structured daily revision routines for first-attempt success.',
    isProfileComplete: true,
    registeredAt: '2024-06-25T00:00:00.000Z',
  },
];

export function getInitialTopperProfile(userId: string, email?: string, name?: string): TopperProfile {
  const rateInfo = calculateSessionRateByAir('48');
  return {
    id: userId,
    name: name || '',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    gender: 'Male',
    yearOfNeet: '2024',
    numberOfAttempts: '1st Attempt',
    language: 'Both',
    currentCollege: 'AIIMS New Delhi',
    airRank: '48',
    totalMarks: 710,
    coachingMode: 'Classroom / Offline',
    coachingName: 'Allen Career Institute (Kota / Pan-India)',
    subjectWiseMarks: {
      physics: 175,
      chemistry: 175,
      biology: 360,
    },
    sessionRate: rateInfo.rate,
    sessionRateDisplay: rateInfo.display,
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
      const parsed = JSON.parse(saved) as TopperProfile;
      const rateInfo = calculateSessionRateByAir(parsed.airRank);
      return {
        ...parsed,
        sessionRate: rateInfo.rate,
        sessionRateDisplay: rateInfo.display,
      };
    } catch {
      // fallback
    }
  }

  const generic = localStorage.getItem('airneet_topper_profile_active');
  if (generic) {
    try {
      const parsed = JSON.parse(generic) as TopperProfile;
      const rateInfo = calculateSessionRateByAir(parsed.airRank);
      return {
        ...parsed,
        id: userId,
        email: fallbackEmail || parsed.email,
        sessionRate: rateInfo.rate,
        sessionRateDisplay: rateInfo.display,
      };
    } catch {
      // fallback
    }
  }

  return getInitialTopperProfile(userId, fallbackEmail, fallbackName);
}

export function saveTopperProfile(profile: TopperProfile): void {
  if (typeof window === 'undefined') return;

  // Auto calculate session rate strictly based on AIR
  const rateInfo = calculateSessionRateByAir(profile.airRank);
  const updatedProfile: TopperProfile = {
    ...profile,
    sessionRate: rateInfo.rate,
    sessionRateDisplay: rateInfo.display,
  };

  localStorage.setItem(TOPPER_PROFILE_KEY_PREFIX + updatedProfile.id, JSON.stringify(updatedProfile));
  localStorage.setItem('airneet_topper_profile_active', JSON.stringify(updatedProfile));

  // Also sync into the global registered toppers list so it reflects in the "Toppers" navigation section
  const all = getAllRegisteredToppers();
  const existingIdx = all.findIndex((t) => t.id === updatedProfile.id || (t.email && t.email === updatedProfile.email));
  let updatedList: TopperProfile[];
  if (existingIdx >= 0) {
    updatedList = [...all];
    updatedList[existingIdx] = updatedProfile;
  } else {
    updatedList = [updatedProfile, ...all];
  }

  localStorage.setItem(TOPPER_LIST_KEY, JSON.stringify(updatedList));
  window.dispatchEvent(new CustomEvent('airneet_toppers_updated', { detail: updatedList }));
}

export function getAllRegisteredToppers(): TopperProfile[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_TOPPERS;
  const raw = localStorage.getItem(TOPPER_LIST_KEY);
  if (!raw) {
    localStorage.setItem(TOPPER_LIST_KEY, JSON.stringify(DEFAULT_INITIAL_TOPPERS));
    return DEFAULT_INITIAL_TOPPERS;
  }
  try {
    const parsed = JSON.parse(raw) as TopperProfile[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Verify whether all 7 seeded toppers are present
      const hasAyushPrasad = parsed.some((p) => p.id === 'topper_ayush_prasad');
      if (!hasAyushPrasad) {
        // Keep any custom user-registered topper profiles while refreshing default toppers
        const defaultIds = [
          'topper_aryan', 'topper_sneha', 'topper_rohan',
          'topper_ayush', 'topper_vanisha', 'topper_soumya', 'topper_chaitra',
          'topper_ayush_prasad', 'topper_pree_sharma', 'topper_anushka'
        ];
        const customProfiles = parsed.filter((p) => !defaultIds.includes(p.id));
        const refreshedList = [...DEFAULT_INITIAL_TOPPERS, ...customProfiles];
        localStorage.setItem(TOPPER_LIST_KEY, JSON.stringify(refreshedList));
        return refreshedList;
      }

      return parsed.map((p) => {
        const rateInfo = calculateSessionRateByAir(p.airRank);
        return {
          ...p,
          sessionRate: rateInfo.rate,
          sessionRateDisplay: rateInfo.display,
        };
      });
    }
    return DEFAULT_INITIAL_TOPPERS;
  } catch {
    return DEFAULT_INITIAL_TOPPERS;
  }
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

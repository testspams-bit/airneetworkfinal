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

/**
 * Helper to normalize names for resilient deduplication:
 * - Trims and lowercases
 * - Collapses whitespace
 * - Strips honorifics (Dr., Mr., etc.)
 * - Normalizes common phonetic transliteration variants (e.g., Chaithra/Chaitra, Soumya/Sumya)
 */
export function normalizeTopperName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(dr\.?|mr\.?|ms\.?|mrs\.?)\s+/i, '')
    .replace(/chaithra/g, 'chaitra')
    .replace(/sumya/g, 'soumya');
}

/**
 * Robustly checks if two topper profile records refer to the same human mentor:
 * 1. Matches direct ID or claimedByUserId
 * 2. Matches email address
 * 3. Matches normalized full name
 * 4. Matches AIR Rank with matching first name or overlapping name tokens
 */
export function isSameTopper(a: Partial<TopperProfile>, b: Partial<TopperProfile>): boolean {
  if (!a || !b) return false;

  // 1. Exact ID or claimed ID linkage
  if (a.id && b.id && a.id === b.id) return true;
  if (a.claimedByUserId && b.id && a.claimedByUserId === b.id) return true;
  if (b.claimedByUserId && a.id && b.claimedByUserId === a.id) return true;
  if (a.claimedByUserId && b.claimedByUserId && a.claimedByUserId === b.claimedByUserId) return true;

  // 2. Email match
  if (a.email && b.email && a.email.trim().toLowerCase() === b.email.trim().toLowerCase()) {
    return true;
  }

  const normA = normalizeTopperName(a.name || '');
  const normB = normalizeTopperName(b.name || '');

  // 3. Normalized full name exact match
  if (normA && normB && normA === normB) {
    return true;
  }

  // 4. AIR Rank match + First Name match (e.g. AIR 04 / 4 and "Ayush")
  const rankStrA = a.airRank ? String(a.airRank).replace(/\D/g, '') : '';
  const rankStrB = b.airRank ? String(b.airRank).replace(/\D/g, '') : '';
  const rankA = rankStrA ? parseInt(rankStrA, 10) : null;
  const rankB = rankStrB ? parseInt(rankStrB, 10) : null;

  if (rankA !== null && rankB !== null && rankA === rankB && rankA > 0) {
    if (normA && normB) {
      const firstA = normA.split(' ')[0];
      const firstB = normB.split(' ')[0];
      if (firstA && firstB && (firstA === firstB || normA.includes(firstB) || normB.includes(firstA))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Deduplicates a list of topper profiles, keeping the single most accurate,
 * complete, and photo-rich record per mentor.
 */
export function deduplicateTopperList(list: TopperProfile[]): TopperProfile[] {
  const result: TopperProfile[] = [];

  for (const item of list) {
    const existingIndex = result.findIndex((existing) => isSameTopper(existing, item));
    if (existingIndex === -1) {
      result.push(item);
    } else {
      // Merge into the existing item without creating a duplicate card
      const existing = result[existingIndex];
      const isItemGenericAvatar =
        !item.avatarUrl || AVATAR_PRESETS.some((preset) => preset.url === item.avatarUrl);
      const isExistingGenericAvatar =
        !existing.avatarUrl || AVATAR_PRESETS.some((preset) => preset.url === existing.avatarUrl);

      // Preserve verified real photograph
      const bestAvatar = !isExistingGenericAvatar
        ? existing.avatarUrl
        : !isItemGenericAvatar
        ? item.avatarUrl
        : existing.avatarUrl || item.avatarUrl;

      result[existingIndex] = {
        ...existing,
        ...item,
        // Keep verified seed id or user id cleanly
        id: item.claimedByUserId || item.id || existing.id,
        claimedByUserId: item.claimedByUserId || item.id || existing.claimedByUserId,
        isClaimed: true,
        avatarUrl: bestAvatar,
        // Preserve phone/email if present
        phone: item.phone || existing.phone,
        email: item.email || existing.email,
        bio: item.bio || existing.bio,
      };
    }
  }

  return result;
}

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

  // 1. Check if user already has an explicit saved profile
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

  // 2. Intelligent Auto-Match: Check if this registering user matches ANY pre-created card
  // (e.g. Ayush Bhalotia, Vanisha Satish, Soumya Bhadole, Chaithra, Ayush Prasad, Pree Sharma, Anushka)
  const allToppers = getAllRegisteredToppers();
  const matchedSeed = allToppers.find((t) =>
    isSameTopper(t, { id: userId, email: fallbackEmail, name: fallbackName })
  );

  if (matchedSeed) {
    const rateInfo = calculateSessionRateByAir(matchedSeed.airRank);
    return {
      ...matchedSeed,
      id: userId,
      claimedByUserId: userId,
      isClaimed: true,
      email: fallbackEmail || matchedSeed.email || '',
      sessionRate: rateInfo.rate,
      sessionRateDisplay: rateInfo.display,
    };
  }

  // 3. Fallback to active session profile if available
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
    claimedByUserId: profile.claimedByUserId || profile.id,
    isClaimed: true,
    sessionRate: rateInfo.rate,
    sessionRateDisplay: rateInfo.display,
  };

  localStorage.setItem(TOPPER_PROFILE_KEY_PREFIX + updatedProfile.id, JSON.stringify(updatedProfile));
  localStorage.setItem('airneet_topper_profile_active', JSON.stringify(updatedProfile));

  // Sync into the global registered toppers list with strict zero-duplicacy guarantee
  const all = getAllRegisteredToppers();
  const existingIdx = all.findIndex((t) => isSameTopper(t, updatedProfile));

  let updatedList: TopperProfile[];
  if (existingIdx >= 0) {
    // Preserve verified high-res photo if newly registered mentor hasn't explicitly uploaded a new avatar
    const existingCard = all[existingIdx];
    const isExistingPhotoVerified =
      existingCard.avatarUrl &&
      !AVATAR_PRESETS.some((preset) => preset.url === existingCard.avatarUrl);
    const isNewAvatarGenericPreset =
      !updatedProfile.avatarUrl ||
      AVATAR_PRESETS.some((preset) => preset.url === updatedProfile.avatarUrl);

    const mergedProfile: TopperProfile = {
      ...existingCard,
      ...updatedProfile,
      id: updatedProfile.id || existingCard.id,
      claimedByUserId: updatedProfile.id || existingCard.id,
      isClaimed: true,
      avatarUrl:
        isExistingPhotoVerified && isNewAvatarGenericPreset
          ? existingCard.avatarUrl
          : updatedProfile.avatarUrl || existingCard.avatarUrl,
      isProfileComplete: true,
    };

    updatedList = [...all];
    updatedList[existingIdx] = mergedProfile;
    // Filter out any other remnants matching this topper
    updatedList = updatedList.filter(
      (card, idx) => idx === existingIdx || !isSameTopper(card, mergedProfile)
    );
  } else {
    // Brand new mentor registering for the first time
    updatedList = [updatedProfile, ...all];
  }

  // Ensure whole list is strictly deduplicated
  const finalizedList = deduplicateTopperList(updatedList);
  localStorage.setItem(TOPPER_LIST_KEY, JSON.stringify(finalizedList));
  window.dispatchEvent(new CustomEvent('airneet_toppers_updated', { detail: finalizedList }));
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
      // Clean up and ensure no duplicate cards exist
      const deduplicated = deduplicateTopperList(parsed);

      // Verify whether all 7 seeded toppers are present (if missing, safely backfill)
      const hasAyushPrasad = deduplicated.some((p) => isSameTopper(p, { name: 'Ayush Prasad', airRank: '200' }));
      if (!hasAyushPrasad) {
        const mergedWithDefaults = deduplicateTopperList([...deduplicated, ...DEFAULT_INITIAL_TOPPERS]);
        localStorage.setItem(TOPPER_LIST_KEY, JSON.stringify(mergedWithDefaults));
        return mergedWithDefaults;
      }

      // If deduplication removed any duplicate records, persist the clean state
      if (deduplicated.length !== parsed.length) {
        localStorage.setItem(TOPPER_LIST_KEY, JSON.stringify(deduplicated));
      }

      return deduplicated.map((p) => {
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

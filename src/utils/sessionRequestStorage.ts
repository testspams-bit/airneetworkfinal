import { type SessionRequest } from '../types/topper.ts';

const SESSION_REQUESTS_KEY = 'airneet_student_session_requests';
const SESSION_CHANGE_EVENT = 'airneet_session_change';

const INITIAL_DEMO_REQUESTS: SessionRequest[] = [
  {
    id: 'REQ-2026-9041',
    studentId: 'student_101',
    studentName: 'Priya Sundaram',
    studentEmail: 'priya.neet26@gmail.com',
    studentPhone: '+91 98450 12389',
    topperId: 'topper_active',
    topperName: 'Aryan Sharma',
    topperAir: 'AIR 48',
    topperCollege: 'AIIMS New Delhi',
    requestedDate: '2026-10-25',
    requestedSlotId: 'e1',
    requestedSlotLabel: '06:00 PM – 07:00 PM',
    status: 'pending',
    neetAspirantYear: 'NEET 2026',
    doubtTopic: 'Rotational motion & Physics formula application speed',
    sessionFee: 1299,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'REQ-2026-8874',
    studentId: 'student_102',
    studentName: 'Kabir Mehra',
    studentEmail: 'kabir.m@gmail.com',
    studentPhone: '+91 97112 54890',
    topperId: 'topper_active',
    topperName: 'Aryan Sharma',
    topperAir: 'AIR 48',
    topperCollege: 'AIIMS New Delhi',
    requestedDate: '2026-10-27',
    requestedSlotId: 'n1',
    requestedSlotLabel: '09:00 PM – 10:00 PM',
    status: 'pending',
    neetAspirantYear: 'NEET 2025 (Repeater)',
    doubtTopic: 'Negative marking elimination in Inorganic Chemistry & Full Mock audit',
    sessionFee: 1299,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'REQ-2026-7612',
    studentId: 'student_103',
    studentName: 'Ananya Deshmukh',
    studentEmail: 'ananya.d@gmail.com',
    studentPhone: '+91 94220 88712',
    topperId: 'topper_active',
    topperName: 'Aryan Sharma',
    topperAir: 'AIR 48',
    topperCollege: 'AIIMS New Delhi',
    requestedDate: '2026-10-23',
    requestedSlotId: 'e2',
    requestedSlotLabel: '07:30 PM – 08:30 PM',
    status: 'confirmed',
    neetAspirantYear: 'NEET 2026',
    doubtTopic: 'Biomolecules assertion-reason revision matrix',
    sessionFee: 1299,
    meetingLink: 'https://meet.google.com/air-neet-9041',
    confirmedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export function loadAllSessionRequests(): SessionRequest[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_REQUESTS;
  const raw = localStorage.getItem(SESSION_REQUESTS_KEY);
  if (!raw) {
    localStorage.setItem(SESSION_REQUESTS_KEY, JSON.stringify(INITIAL_DEMO_REQUESTS));
    return INITIAL_DEMO_REQUESTS;
  }
  try {
    const parsed = JSON.parse(raw) as SessionRequest[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_REQUESTS;
  } catch {
    return INITIAL_DEMO_REQUESTS;
  }
}

export function saveSessionRequests(requests: SessionRequest[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_REQUESTS_KEY, JSON.stringify(requests));
  window.dispatchEvent(new CustomEvent(SESSION_CHANGE_EVENT, { detail: requests }));
}

export function createSessionRequest(requestData: Omit<SessionRequest, 'id' | 'status' | 'createdAt'>): SessionRequest {
  const newReq: SessionRequest = {
    ...requestData,
    id: 'REQ-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const existing = loadAllSessionRequests();
  const updated = [newReq, ...existing];
  saveSessionRequests(updated);
  return newReq;
}

/**
 * Confirm a student's session request. Only confirm action is permitted as per user request.
 * Sets status to 'confirmed', generates a Google Meet coordination link and timestamp.
 * This confirmation reflects immediately in the registered aspirant's account.
 */
export function confirmSessionRequest(requestId: string, customMeetLink?: string): SessionRequest | null {
  const existing = loadAllSessionRequests();
  let confirmedItem: SessionRequest | null = null;

  const updated = existing.map((req) => {
    if (req.id === requestId) {
      const meet = customMeetLink || `https://meet.google.com/air-neet-${req.id.toLowerCase()}`;
      confirmedItem = {
        ...req,
        status: 'confirmed',
        meetingLink: meet,
        confirmedAt: new Date().toISOString(),
      };
      return confirmedItem;
    }
    return req;
  });

  if (confirmedItem) {
    saveSessionRequests(updated);
  }
  return confirmedItem;
}

export function getRequestsForTopper(topperId?: string): SessionRequest[] {
  const all = loadAllSessionRequests();
  if (!topperId || topperId === 'topper_active') return all;
  return all.filter((r) => r.topperId === topperId || r.topperId === 'topper_active');
}

export function getRequestsForStudent(studentEmailOrId?: string): SessionRequest[] {
  const all = loadAllSessionRequests();
  if (!studentEmailOrId) return all;
  const query = studentEmailOrId.toLowerCase().trim();
  return all.filter(
    (r) => r.studentEmail.toLowerCase() === query || r.studentId === studentEmailOrId
  );
}

export function subscribeToSessionChanges(callback: (requests: SessionRequest[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const custom = e as CustomEvent<SessionRequest[]>;
    callback(custom.detail || loadAllSessionRequests());
  };
  window.addEventListener(SESSION_CHANGE_EVENT, handler);
  return () => window.removeEventListener(SESSION_CHANGE_EVENT, handler);
}

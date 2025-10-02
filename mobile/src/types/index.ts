export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'STUDENT' | 'PARENT' | 'MENTOR';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AttendanceSession {
  id: string;
  startAt: string;
  endAt?: string;
  durationMinutes?: number;
  source: 'MOBILE' | 'KIOSK' | 'ADMIN';
}

export interface CalendarDay {
  date: string;
  sessions: AttendanceSession[];
  totalMinutes: number;
}

export interface AbsenceRequest {
  id: string;
  date: string;
  type: 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'OFFSITE';
  startAt?: string;
  endAt?: string;
  reasonText: string;
  evidenceUrl?: string;
  status: 'PENDING' | 'PARTIAL' | 'APPROVED' | 'REJECTED';
  mentorDecision: 'PENDING' | 'APPROVED' | 'REJECTED';
  parentDecision: 'PENDING' | 'APPROVED' | 'REJECTED';
  mentorComment?: string;
  parentComment?: string;
}

export interface Mentor {
  id: string;
  name: string;
  email: string;
  university?: string;
  major?: string;
  bio?: string;
  subjects: string[];
  rating: number;
}

export interface QABooking {
  id: string;
  mentor: {
    id: string;
    name: string;
  };
  student?: {
    id: string;
    name: string;
  };
  subject: string;
  chapter?: string;
  summary: string;
  images: string[];
  slotStart: string;
  slotEnd: string;
  status: 'REQUESTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  rating?: number;
  answerText?: string;
  answerFiles: string[];
}

export interface StudyRanking {
  studentId: string;
  name: string;
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
}

export interface StudentStats {
  studentId: string;
  attendance: {
    totalMinutes: number;
    totalHours: number;
    sessionCount: number;
  };
  pomodoro: {
    totalMinutes: number;
    totalHours: number;
    sessionCount: number;
  };
  subjectBreakdown: Record<string, number>;
}

export interface Message {
  id: string;
  threadId: string;
  senderId: string;
  text: string;
  attachments: string[];
  category?: 'FACILITY' | 'POLICY' | 'PAYMENT' | 'OTHER';
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
}

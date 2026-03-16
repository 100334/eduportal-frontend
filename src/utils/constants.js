export const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12'
];

export const SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'Social Studies',
  'Chichewa',
  'Creative Arts',
  'Physical Education',
  'Computer Studies',
  'Biology',
  'Physics',
  'Chemistry',
  'History',
  'Geography'
];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late'
};

export const ATTENDANCE_STATUS_LABELS = {
  [ATTENDANCE_STATUS.PRESENT]: 'Present',
  [ATTENDANCE_STATUS.ABSENT]: 'Absent',
  [ATTENDANCE_STATUS.LATE]: 'Late'
};

export const ATTENDANCE_STATUS_COLORS = {
  [ATTENDANCE_STATUS.PRESENT]: 'green',
  [ATTENDANCE_STATUS.ABSENT]: 'red',
  [ATTENDANCE_STATUS.LATE]: 'gold'
};

export const TERMS = [
  'Term 1 – 2024',
  'Term 2 – 2024',
  'Term 3 – 2024',
  'Term 1 – 2025',
  'Term 2 – 2025',
  'Term 3 – 2025'
];

export const LEARNER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  GRADUATED: 'Graduated',
  TRANSFERRED: 'Transferred'
};

export const ROLES = {
  TEACHER: 'teacher',
  LEARNER: 'learner'
};

export const API_ENDPOINTS = {
  TEACHER_LOGIN: '/auth/teacher/login',
  LEARNER_LOGIN: '/auth/learner/login',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
  LEARNERS: '/learners',
  REPORTS: '/reports',
  ATTENDANCE: '/attendance',
  DASHBOARD: '/dashboard'
};

export const GRADE_COLORS = {
  'A+': { min: 90, color: '#1e7e4a' },
  'A': { min: 80, color: '#2a9090' },
  'B': { min: 70, color: '#c9933a' },
  'C': { min: 60, color: '#e8b96a' },
  'D': { min: 50, color: '#d97706' },
  'F': { min: 0, color: '#c0392b' }
};

export const getGradeFromScore = (score) => {
  if (score >= 90) return { letter: 'A+', color: GRADE_COLORS['A+'].color };
  if (score >= 80) return { letter: 'A', color: GRADE_COLORS['A'].color };
  if (score >= 70) return { letter: 'B', color: GRADE_COLORS['B'].color };
  if (score >= 60) return { letter: 'C', color: GRADE_COLORS['C'].color };
  if (score >= 50) return { letter: 'D', color: GRADE_COLORS['D'].color };
  return { letter: 'F', color: GRADE_COLORS['F'].color };
};
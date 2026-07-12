// export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
export const API_BASE_URL = 'http://localhost:8080'

export const ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
}

export const DOCUMENT_CATEGORIES = [
  { value: 'resume', label: 'Resume' },
  { value: 'marksheet', label: 'Marksheet' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'identity', label: 'Identity Proof' },
  { value: 'other', label: 'Other' },
]

export const STORAGE_KEYS = {
  TOKEN: 'us_token',
  USER: 'us_user',
}

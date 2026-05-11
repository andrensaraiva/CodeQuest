import type {
  AuthResponse,
  Badge,
  ClassReport,
  Classroom,
  CodeRunResponse,
  Exercise,
  Lesson,
  Module,
  RankingEntry,
  StudentProgress,
  Submission,
  Track,
  UserRole,
  XpSummary,
} from '../types'
import { useAuthStore } from '../stores/authStore'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = `Request failed with ${response.status}`
    try {
      const body = await response.json()
      message = body.message ?? message
    } catch {
      // Keep the HTTP fallback message.
    }
    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (name: string, email: string, password: string, role: UserRole) =>
    request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, role }) }),
  me: () => request<AuthResponse['user']>('/auth/me'),
  classes: () => request<Classroom[]>('/classes'),
  createClass: (name: string, description: string) =>
    request<Classroom>('/classes', { method: 'POST', body: JSON.stringify({ name, description }) }),
  joinClass: (inviteCode: string) =>
    request<void>('/classes/join', { method: 'POST', body: JSON.stringify({ inviteCode }) }),
  classStudents: (classroomId: string) => request<StudentProgress[]>(`/classes/${classroomId}/students`),
  classRanking: (classroomId: string) => request<RankingEntry[]>(`/classes/${classroomId}/ranking`),
  classReport: (classroomId: string) => request<ClassReport>(`/classes/${classroomId}/report`),
  tracks: () => request<Track[]>('/tracks'),
  createTrack: (payload: unknown) => request<Track>('/tracks', { method: 'POST', body: JSON.stringify(payload) }),
  modules: (trackId: string) => request<Module[]>(`/tracks/${trackId}/modules`),
  lessons: (moduleId: string) => request<Lesson[]>(`/modules/${moduleId}/lessons`),
  lesson: (lessonId: string) => request<Lesson>(`/lessons/${lessonId}`),
  exercises: (moduleId: string) => request<Exercise[]>(`/modules/${moduleId}/exercises`),
  exercise: (exerciseId: string) => request<Exercise>(`/exercises/${exerciseId}`),
  createExercise: (payload: unknown) => request<Exercise>('/exercises', { method: 'POST', body: JSON.stringify(payload) }),
  runCode: (exerciseId: string, language: string, code: string) =>
    request<CodeRunResponse>('/code/run', { method: 'POST', body: JSON.stringify({ exerciseId, language, code }) }),
  submitCode: (exerciseId: string, language: string, code: string) =>
    request<Submission>('/code/submit', { method: 'POST', body: JSON.stringify({ exerciseId, language, code }) }),
  mySubmissions: () => request<Submission[]>('/submissions/me'),
  classSubmissions: (classroomId: string) => request<Submission[]>(`/submissions/classes/${classroomId}`),
  xp: () => request<XpSummary>('/me/xp'),
  badges: () => request<Badge[]>('/me/badges'),
  hint: (exerciseId: string, studentCode: string) =>
    request<{ response: string; isMocked: boolean }>('/ai/hint', { method: 'POST', body: JSON.stringify({ exerciseId, studentCode }) }),
}

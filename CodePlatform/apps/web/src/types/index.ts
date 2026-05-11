export type UserRole = 'Admin' | 'Teacher' | 'Student'
export type ProgrammingLanguage = 'CSharp' | 'Java' | 'JavaScript' | 'Python'
export type ExerciseDifficulty = 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Boss'
export type SubmissionStatus = 'Running' | 'Passed' | 'Failed' | 'Error'
export type CodeRunStatus = 'Completed' | 'Failed' | 'CompilationError' | 'Timeout'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export interface Classroom {
  id: string
  name: string
  description: string
  inviteCode: string
  teacherId: string
  studentCount: number
}

export interface Track {
  id: string
  title: string
  description: string
  language: ProgrammingLanguage
  theme: string
  moduleCount: number
}

export interface Module {
  id: string
  trackId: string
  title: string
  description: string
  orderIndex: number
  requiredXp: number
  lessonCount: number
  exerciseCount: number
  progress: number
}

export interface Lesson {
  id: string
  moduleId: string
  title: string
  objective: string
  contentJson: string
  orderIndex: number
}

export interface ExerciseTest {
  id: string
  name: string
  type: string
  input?: string
  expectedOutput?: string
  testCode?: string
  isHidden: boolean
  points: number
  orderIndex: number
}

export interface Exercise {
  id: string
  moduleId: string
  lessonId?: string
  title: string
  description: string
  language: ProgrammingLanguage
  difficulty: ExerciseDifficulty
  starterCode: string
  xpReward: number
  skillsJson: string
  hintsJson: string
  isPublished: boolean
  orderIndex: number
  tests: ExerciseTest[]
}

export interface RunnerTestResult {
  testId?: string
  name: string
  passed: boolean
  expected?: string
  actual?: string
  error?: string
  isHidden: boolean
  executionTimeMs: number
}

export interface CodeRunResponse {
  status: CodeRunStatus
  output: string
  error?: string
  compilationError?: string
  tests: RunnerTestResult[]
  executionTimeMs: number
  passedCount: number
  failedCount: number
  score: number
  feedback: string
}

export interface Submission {
  id: string
  exerciseId: string
  studentId: string
  status: SubmissionStatus
  score: number
  feedback: string
  passedTests: number
  totalTests: number
  attemptNumber: number
  createdAt: string
  testResults: RunnerTestResult[]
}

export interface XpSummary {
  totalXp: number
  level: number
  currentLevelXp: number
  nextLevelXp: number
}

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  isUnlocked: boolean
  earnedAt?: string
}

export interface RankingEntry {
  studentId: string
  name: string
  xp: number
  level: number
  rank: number
}

export interface StudentProgress {
  studentId: string
  name: string
  email: string
  xp: number
  level: number
  completedExercises: number
  failedAttempts: number
  lastActivity?: string
}

export interface ClassReport {
  classroomId: string
  className: string
  studentCount: number
  submissionCount: number
  completionCount: number
  difficultExercises: string[]
  difficultStudents: StudentProgress[]
}

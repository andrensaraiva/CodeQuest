import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LandingPage } from './features/auth/LandingPage'
import { AuthPage } from './features/auth/AuthPage'
import { BadgesPage, ExercisePage, LearningMapPage, LessonPage, ModulePage, RankingPage, StudentDashboard } from './features/student/StudentPages'
import { ClassDetailPage, ClassesPage, ContentBuilderPage, ReportsPage, TeacherDashboard } from './features/teacher/TeacherPages'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { Card } from './components/ui/primitives'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />

      <Route element={<ProtectedRoute roles={['Student']} />}>
        <Route element={<AppShell />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/map" element={<LearningMapPage />} />
          <Route path="/student/modules/:moduleId" element={<ModulePage />} />
          <Route path="/student/lessons/:lessonId" element={<LessonPage />} />
          <Route path="/student/exercises/:exerciseId" element={<ExercisePage />} />
          <Route path="/student/badges" element={<BadgesPage />} />
          <Route path="/student/ranking" element={<RankingPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['Teacher']} />}>
        <Route element={<AppShell />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/classes" element={<ClassesPage />} />
          <Route path="/teacher/classes/:classId" element={<ClassDetailPage />} />
          <Route path="/teacher/builder" element={<ContentBuilderPage />} />
          <Route path="/teacher/reports" element={<ReportsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/unity" element={<UnityPlaceholder />} />
          <Route path="/admin" element={<AdminPlaceholder />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function UnityPlaceholder() {
  return (
    <Card>
      <h1 className="text-3xl font-black text-white">Unity Portal</h1>
      <p className="mt-3 text-[#9fb2a8]">MVP placeholder for future Unity script analysis and project submissions. The platform starts with pure C# game logic exercises, then expands into MonoBehaviour script checks, rubric-based project submissions, screenshots, video links, and GitHub URLs.</p>
    </Card>
  )
}

function AdminPlaceholder() {
  return (
    <Card>
      <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
      <p className="mt-3 text-[#9fb2a8]">Scaffolded for future organization, teacher, platform content, runner, moderation, and usage-limit controls.</p>
    </Card>
  )
}

import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { LandingPage } from './features/auth/LandingPage'
import { AuthPage } from './features/auth/AuthPage'
import { BadgesPage, ExercisePage, LearningMapPage, LessonPage, ModulePage, RankingPage, StudentDashboard } from './features/student/StudentPages'
import { ClassDetailPage, ClassesPage, ContentBuilderPage, ReportsPage, TeacherDashboard } from './features/teacher/TeacherPages'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { Card } from './components/ui/primitives'
import { usePreferences } from './i18n/preferences'

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
  const { t } = usePreferences()
  return (
    <Card>
      <h1 className="cq-heading text-3xl font-black">{t('placeholder.unityTitle')}</h1>
      <p className="cq-muted mt-3">{t('placeholder.unityText')}</p>
    </Card>
  )
}

function AdminPlaceholder() {
  const { t } = usePreferences()
  return (
    <Card>
      <h1 className="cq-heading text-3xl font-black">{t('placeholder.adminTitle')}</h1>
      <p className="cq-muted mt-3">{t('placeholder.adminText')}</p>
    </Card>
  )
}

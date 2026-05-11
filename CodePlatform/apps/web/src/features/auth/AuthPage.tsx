import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../api/client'
import { PreferenceControls } from '../../components/preferences/PreferenceControls'
import { Button, Card, Input, Select } from '../../components/ui/primitives'
import { roleLabel, usePreferences } from '../../i18n/preferences'
import { useAuthStore } from '../../stores/authStore'
import type { UserRole } from '../../types'

export function AuthPage() {
  const { t } = usePreferences()
  const [params] = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [role, setRole] = useState<UserRole>((params.get('role') as UserRole) ?? 'Student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState(role === 'Teacher' ? 'teacher@codequest.dev' : 'student1@codequest.dev')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()

  const title = useMemo(() => (mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')), [mode, t])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const session = mode === 'login' ? await api.login(email, password) : await api.register(name, email, password, role)
      setSession(session.token, session.refreshToken, session.user)
      navigate(session.user.role === 'Teacher' ? '/teacher' : '/student')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="cq-app grid min-h-screen place-items-center px-4 py-10">
      <div className="absolute right-6 top-6">
        <PreferenceControls />
      </div>
      <Card className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-[#83ffa8]">CodeQuest Academy</p>
          <h1 className="cq-heading mt-2 text-3xl font-black">{title}</h1>
          <p className="cq-muted mt-2 text-sm">{t('auth.helper')}</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Select value={role} onChange={(event) => {
            const nextRole = event.target.value as UserRole
            setRole(nextRole)
            setEmail(nextRole === 'Teacher' ? 'teacher@codequest.dev' : 'student1@codequest.dev')
          }}>
            <option value="Student">{roleLabel('Student', t)}</option>
            <option value="Teacher">{roleLabel('Teacher', t)}</option>
          </Select>
          {mode === 'register' && <Input placeholder={t('auth.name')} value={name} onChange={(event) => setName(event.target.value)} required />}
          <Input placeholder={t('auth.email')} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input placeholder={t('auth.password')} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="rounded-lg border border-pink-400/30 bg-pink-950/20 px-3 py-2 text-sm text-pink-100">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? t('auth.entering') : mode === 'login' ? t('auth.login') : t('auth.register')}</Button>
        </form>
        <button className="mt-4 text-sm font-bold text-[#83ffa8]" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? t('auth.needAccount') : t('auth.hasAccount')}
        </button>
      </Card>
    </main>
  )
}

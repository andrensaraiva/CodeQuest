import { BookOpen, Braces, LayoutDashboard, LogOut, Medal, Search, Shield, Trophy, Users, Wand2 } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/primitives'
import { cn } from '../../utils/cn'
import { PreferenceControls } from '../preferences/PreferenceControls'
import { roleLabel, usePreferences } from '../../i18n/preferences'

const studentLinks = [
  { to: '/student', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/student/map', labelKey: 'nav.learningMap', icon: BookOpen },
  { to: '/student/badges', labelKey: 'nav.badges', icon: Medal },
  { to: '/student/ranking', labelKey: 'nav.ranking', icon: Trophy },
  { to: '/unity', labelKey: 'nav.unityLab', icon: Wand2 },
]   

const teacherLinks = [
  { to: '/teacher', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/teacher/classes', labelKey: 'nav.classes', icon: Users },
  { to: '/teacher/builder', labelKey: 'nav.builder', icon: Braces },
  { to: '/teacher/reports', labelKey: 'nav.reports', icon: Shield },
  { to: '/unity', labelKey: 'nav.unityLab', icon: Wand2 },
]

export function AppShell() {
  const { user, clearSession } = useAuthStore()
  const { t } = usePreferences()
  const navigate = useNavigate()
  const links = user?.role === 'Teacher' ? teacherLinks : studentLinks

  return (
    <div className="cq-app min-h-screen">
      <aside className="cq-header fixed left-0 top-0 z-20 hidden h-screen w-72 border-r p-4 lg:block">
        <NavLink to="/" className="flex items-center gap-3 rounded-xl bg-[#35ff7a]/10 p-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#35ff7a] font-black text-[#07110b]">CQ</div>
          <div>
            <p className="cq-heading font-black">CodeQuest</p>
            <p className="cq-muted text-xs">Academy MVP</p>
          </div>
        </NavLink>
        <nav className="mt-6 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn('cq-muted flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition hover:bg-[color-mix(in_srgb,var(--cq-heading)_7%,transparent)] hover:text-[var(--cq-heading)]', isActive && 'bg-[#35ff7a]/10 text-[#168044]')
                }
              >
                <Icon size={18} />
                {t(link.labelKey as Parameters<typeof t>[0])}
              </NavLink>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <PreferenceControls />
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="cq-header sticky top-0 z-10 border-b px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="cq-field hidden min-h-10 flex-1 items-center gap-2 rounded-lg border px-3 md:flex">
              <Search size={18} />
              <span className="text-sm">{t('shell.search')}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block lg:hidden">
                <PreferenceControls compact />
              </div>
              <div className="text-right">
                <p className="cq-heading text-sm font-black">{user?.name}</p>
                <p className="cq-muted-2 text-xs">{roleLabel(user?.role, t)}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  clearSession()
                  navigate('/login')
                }}
                title={t('common.logout')}
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

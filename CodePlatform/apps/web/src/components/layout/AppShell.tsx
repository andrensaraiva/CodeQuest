import { BookOpen, Braces, LayoutDashboard, LogOut, Medal, Search, Shield, Trophy, Users, Wand2 } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../ui/primitives'
import { cn } from '../../utils/cn'

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/map', label: 'Learning Map', icon: BookOpen },
  { to: '/student/badges', label: 'Badges', icon: Medal },
  { to: '/student/ranking', label: 'Ranking', icon: Trophy },
  { to: '/unity', label: 'Unity Lab', icon: Wand2 },
]

const teacherLinks = [
  { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/teacher/classes', label: 'Classes', icon: Users },
  { to: '/teacher/builder', label: 'Builder', icon: Braces },
  { to: '/teacher/reports', label: 'Reports', icon: Shield },
  { to: '/unity', label: 'Unity Lab', icon: Wand2 },
]

export function AppShell() {
  const { user, clearSession } = useAuthStore()
  const navigate = useNavigate()
  const links = user?.role === 'Teacher' ? teacherLinks : studentLinks

  return (
    <div className="min-h-screen bg-[#080b0f] text-[#effff4]">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-72 border-r border-white/10 bg-[#0b1118]/95 p-4 lg:block">
        <NavLink to="/" className="flex items-center gap-3 rounded-xl bg-[#35ff7a]/10 p-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#35ff7a] font-black text-[#07110b]">CQ</div>
          <div>
            <p className="font-black text-white">CodeQuest</p>
            <p className="text-xs text-[#9fb2a8]">Academy MVP</p>
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
                  cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-[#9fb2a8] transition hover:bg-white/5 hover:text-white', isActive && 'bg-[#35ff7a]/10 text-[#83ffa8]')
                }
              >
                <Icon size={18} />
                {link.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-[#0b1118]/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden min-h-10 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-[#080d13] px-3 text-[#8aa09a] md:flex">
              <Search size={18} />
              <span className="text-sm">Search quests, modules, students...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-black text-white">{user?.name}</p>
                <p className="text-xs text-[#8aa09a]">{user?.role}</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  clearSession()
                  navigate('/login')
                }}
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

import { Award, Flame, ShieldCheck, Trophy } from 'lucide-react'
import type { Badge as BadgeType, Module, RankingEntry } from '../../types'
import { Badge, Card, ProgressBar } from '../ui/primitives'

export function XPBar({ totalXp, level, currentLevelXp, nextLevelXp }: { totalXp: number; level: number; currentLevelXp: number; nextLevelXp: number }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-4 top-4 rounded-full border border-[#35ff7a]/30 bg-[#35ff7a]/10 px-3 py-1 text-sm font-black text-[#83ffa8]">LVL {level}</div>
      <p className="text-sm font-bold uppercase tracking-wider text-[#8aa09a]">Academy XP</p>
      <div className="mt-2 text-4xl font-black text-white">{totalXp} XP</div>
      <ProgressBar value={(currentLevelXp / nextLevelXp) * 100} className="mt-4" />
      <p className="mt-2 text-sm text-[#9fb2a8]">{nextLevelXp - currentLevelXp} XP until next level</p>
    </Card>
  )
}

export function BadgeCard({ badge }: { badge: BadgeType }) {
  return (
    <Card className={badge.isUnlocked ? 'border-[#35ff7a]/30' : 'opacity-55'}>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#35ff7a]/10 text-[#83ffa8]">
          <Award size={22} />
        </div>
        <div>
          <h3 className="font-black text-white">{badge.title}</h3>
          <p className="text-sm text-[#9fb2a8]">{badge.description}</p>
        </div>
      </div>
    </Card>
  )
}

export function ModuleNode({ module }: { module: Module }) {
  const locked = module.requiredXp > 0 && module.progress === 0
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone={locked ? 'gray' : module.progress === 100 ? 'green' : 'cyan'}>{locked ? 'Locked path' : module.progress === 100 ? 'Cleared' : 'Unlocked'}</Badge>
          <h3 className="mt-3 text-xl font-black text-white">{module.title}</h3>
          <p className="mt-2 text-sm text-[#9fb2a8]">{module.description}</p>
        </div>
        {module.progress === 100 ? <ShieldCheck className="text-[#35ff7a]" /> : <Flame className="text-yellow-300" />}
      </div>
      <ProgressBar value={module.progress} className="mt-5" />
      <div className="mt-3 flex gap-2 text-xs text-[#9fb2a8]">
        <span>{module.lessonCount} lessons</span>
        <span>{module.exerciseCount} quests</span>
        <span>Boss challenge</span>
      </div>
    </Card>
  )
}

export function RankingList({ entries }: { entries: RankingEntry[] }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="text-yellow-300" size={20} />
        <h2 className="text-lg font-black text-white">Class Ranking</h2>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.studentId} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
            <div>
              <p className="font-bold text-white">#{entry.rank} {entry.name}</p>
              <p className="text-xs text-[#9fb2a8]">Level {entry.level}</p>
            </div>
            <Badge tone="green">{entry.xp} XP</Badge>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[#8aa09a]">Ranking is a progress signal, not a shame board. Persistence rankings are planned.</p>
    </Card>
  )
}

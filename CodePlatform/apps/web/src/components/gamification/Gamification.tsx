import { Award, Flame, ShieldCheck, Trophy } from 'lucide-react'
import type { Badge as BadgeType, Module, RankingEntry } from '../../types'
import { usePreferences } from '../../i18n/preferences'
import { Badge, Card, ProgressBar } from '../ui/primitives'

export function XPBar({ totalXp, level, currentLevelXp, nextLevelXp }: { totalXp: number; level: number; currentLevelXp: number; nextLevelXp: number }) {
  const { t } = usePreferences()
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-4 top-4 rounded-full border border-[#35ff7a]/30 bg-[#35ff7a]/10 px-3 py-1 text-sm font-black text-[#168044]">LVL {level}</div>
      <p className="cq-muted-2 text-sm font-bold uppercase tracking-wider">{t('gamification.academyXp')}</p>
      <div className="cq-heading mt-2 text-4xl font-black">{totalXp} XP</div>
      <ProgressBar value={(currentLevelXp / nextLevelXp) * 100} className="mt-4" />
      <p className="cq-muted mt-2 text-sm">{nextLevelXp - currentLevelXp} {t('gamification.untilNextLevel')}</p>
    </Card>
  )
}

export function BadgeCard({ badge }: { badge: BadgeType }) {
  const { content } = usePreferences()
  return (
    <Card className={badge.isUnlocked ? 'border-[#35ff7a]/30' : 'opacity-55'}>
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-[#35ff7a]/10 text-[#83ffa8]">
          <Award size={22} />
        </div>
        <div>
          <h3 className="cq-heading font-black">{content(badge.title)}</h3>
          <p className="cq-muted text-sm">{content(badge.description)}</p>
        </div>
      </div>
    </Card>
  )
}

export function ModuleNode({ module }: { module: Module }) {
  const { t, content } = usePreferences()
  const locked = module.requiredXp > 0 && module.progress === 0
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone={locked ? 'gray' : module.progress === 100 ? 'green' : 'cyan'}>{locked ? t('gamification.locked') : module.progress === 100 ? t('gamification.cleared') : t('gamification.unlocked')}</Badge>
          <h3 className="cq-heading mt-3 text-xl font-black">{content(module.title)}</h3>
          <p className="cq-muted mt-2 text-sm">{content(module.description)}</p>
        </div>
        {module.progress === 100 ? <ShieldCheck className="text-[#35ff7a]" /> : <Flame className="text-yellow-300" />}
      </div>
      <ProgressBar value={module.progress} className="mt-5" />
      <div className="cq-muted mt-3 flex gap-2 text-xs">
        <span>{module.lessonCount} {t('common.lessons')}</span>
        <span>{module.exerciseCount} {t('common.quests')}</span>
        <span>{t('common.bossChallenge')}</span>
      </div>
    </Card>
  )
}

export function RankingList({ entries }: { entries: RankingEntry[] }) {
  const { t, content } = usePreferences()
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="text-yellow-300" size={20} />
        <h2 className="cq-heading text-lg font-black">{t('gamification.classRanking')}</h2>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.studentId} className="cq-soft flex items-center justify-between rounded-lg px-3 py-2">
            <div>
              <p className="cq-heading font-bold">#{entry.rank} {content(entry.name)}</p>
              <p className="cq-muted text-xs">{t('common.level')} {entry.level}</p>
            </div>
            <Badge tone="green">{entry.xp} XP</Badge>
          </div>
        ))}
      </div>
      <p className="cq-muted-2 mt-4 text-xs">{t('gamification.rankingNote')}</p>
    </Card>
  )
}

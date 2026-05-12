import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Lightbulb, Lock, Unlock } from 'lucide-react'
import { api } from '../../../api/client'
import { Badge, Button, Card } from '../../../components/ui/primitives'
import { usePreferences } from '../../../i18n/preferences'
import type { Exercise, ExerciseHintSummary } from '../../../types'

interface Props {
  exercise: Exercise
}

export function HintPanel({ exercise }: Props) {
  const { t } = usePreferences()
  const queryClient = useQueryClient()
  const [confirmHint, setConfirmHint] = useState<ExerciseHintSummary | null>(null)

  const hints = useQuery({
    queryKey: ['hints', exercise.id],
    queryFn: () => api.exerciseHints(exercise.id),
    enabled: exercise.allowHints,
  })

  const unlock = useMutation({
    mutationFn: (hintId: string) => api.unlockHint(exercise.id, hintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hints', exercise.id] })
    },
  })

  const list = useMemo(() => hints.data ?? exercise.hints ?? [], [hints.data, exercise.hints])

  const { highestPenalty, possibleXp } = useMemo(() => {
    const unlocked = list.filter((h) => h.isUnlocked)
    if (unlocked.length === 0) return { highestPenalty: 0, possibleXp: exercise.xpReward }
    const reveal = unlocked.find((h) => h.isSolutionReveal)
    if (reveal) {
      const keep = Math.max(0, Math.min(100, exercise.solutionRevealXpPercent))
      return { highestPenalty: 100 - keep, possibleXp: Math.round((exercise.xpReward * keep) / 100) }
    }
    const max = Math.max(...unlocked.map((h) => h.penaltyPercent))
    return { highestPenalty: max, possibleXp: Math.round((exercise.xpReward * (100 - max)) / 100) }
  }, [list, exercise.xpReward, exercise.solutionRevealXpPercent])

  if (!exercise.allowHints) {
    return (
      <Card>
        <h2 className="cq-heading font-black"><Lightbulb size={16} className="mr-1 inline" />{t('hints.title')}</h2>
        <p className="cq-muted mt-2 text-sm">{t('hints.disabled')}</p>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="cq-heading flex items-center gap-2 font-black"><Lightbulb size={16} />{t('hints.title')}</h2>
        <Badge tone={possibleXp === exercise.xpReward ? 'green' : 'yellow'}>
          {t('hints.possibleXp')}: {possibleXp} / {exercise.xpReward} XP
        </Badge>
      </div>

      <div className="mt-3 space-y-2">
        {list.length === 0 && <p className="cq-muted text-sm">{t('hints.empty')}</p>}
        {list.map((hint, index) => {
          const locked = !hint.isUnlocked
          const projectedKeep = hint.isSolutionReveal
            ? Math.max(0, Math.min(100, exercise.solutionRevealXpPercent))
            : 100 - Math.max(highestPenalty, hint.penaltyPercent)
          const projectedXp = Math.round((exercise.xpReward * projectedKeep) / 100)
          return (
            <div key={hint.id} className="cq-soft rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="cq-heading flex items-center gap-2 font-bold">
                  <span className="cq-muted-2 text-xs">{t('hints.level')} {index + 1}</span>
                  {locked ? <Lock size={14} /> : <Unlock size={14} className="text-[#35ff7a]" />}
                  {hint.title}
                </div>
                <Badge tone={hint.isSolutionReveal ? 'red' : 'purple'}>-{hint.penaltyPercent}%</Badge>
              </div>
              {hint.isUnlocked && hint.content && (
                <pre className="cq-text mt-2 whitespace-pre-wrap text-sm leading-snug">{hint.content}</pre>
              )}
              {locked && (
                <Button className="mt-3" variant="secondary" onClick={() => setConfirmHint(hint)}>
                  {hint.isSolutionReveal ? t('hints.revealSolution') : t('hints.unlock')} ({projectedXp} XP)
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {confirmHint && (
        <div className="mt-4 rounded-xl border border-yellow-300/40 bg-yellow-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-yellow-700 dark:text-yellow-100">
            <AlertTriangle size={16} /> {t('hints.confirmTitle')}
          </p>
          <p className="cq-muted mt-2 text-sm">
            {t('hints.confirmText')
              .replace('{xpFrom}', String(exercise.xpReward))
              .replace(
                '{xpTo}',
                String(
                  confirmHint.isSolutionReveal
                    ? Math.round((exercise.xpReward * Math.max(0, exercise.solutionRevealXpPercent)) / 100)
                    : Math.round((exercise.xpReward * (100 - Math.max(highestPenalty, confirmHint.penaltyPercent))) / 100),
                ),
              )}
          </p>
          <div className="mt-3 flex gap-2">
            <Button onClick={() => {
              unlock.mutate(confirmHint.id)
              setConfirmHint(null)
            }} disabled={unlock.isPending}>{t('hints.confirmYes')}</Button>
            <Button variant="ghost" onClick={() => setConfirmHint(null)}>{t('hints.confirmNo')}</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

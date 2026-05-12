import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Play, RotateCcw, Send, Settings2, Sparkles, Swords, Wand2 } from 'lucide-react'
import { api } from '../../api/client'
import { BadgeCard, ModuleNode, RankingList, XPBar } from '../../components/gamification/Gamification'
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui/primitives'
import { statusLabel, usePreferences } from '../../i18n/preferences'
import type { Exercise, Lesson } from '../../types'
import { EditorSettingsPanel } from './editor/EditorSettingsPanel'
import { HintPanel } from './editor/HintPanel'
import { QuestEditor } from './editor/QuestEditor'
import { useEditorSettings } from './editor/useEditorSettings'
import { IntegrityTracker } from './editor/integrityTracker'
import { formatCSharpBasic } from './editor/csharpSnippets'

export function StudentDashboard() {
  const { t, content } = usePreferences()
  const classes = useQuery({ queryKey: ['classes'], queryFn: api.classes })
  const tracks = useQuery({ queryKey: ['tracks'], queryFn: api.tracks })
  const xp = useQuery({ queryKey: ['xp'], queryFn: api.xp })
  const badges = useQuery({ queryKey: ['badges'], queryFn: api.badges })
  const activeClass = classes.data?.[0]
  const ranking = useQuery({ queryKey: ['ranking', activeClass?.id], queryFn: () => api.classRanking(activeClass!.id), enabled: !!activeClass })

  if (classes.isLoading || tracks.isLoading || xp.isLoading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <Badge tone="green">{t('student.currentMission')}</Badge>
          <h1 className="cq-heading mt-4 text-4xl font-black">{t('student.continueTitle')}</h1>
          <p className="cq-muted mt-3 max-w-2xl">{t('student.continueText')}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/student/map"><Button>{t('student.openMap')}</Button></Link>
            <Link to="/student/ranking"><Button variant="secondary">{t('student.viewRanking')}</Button></Link>
          </div>
        </Card>
        {xp.data && <XPBar {...xp.data} />}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="cq-muted-2 text-sm">{t('student.activeClass')}</p><h3 className="cq-heading mt-2 text-xl font-black">{activeClass?.name ?? t('student.joinClass')}</h3><p className="cq-muted mt-1 text-sm">{t('student.inviteCode')}: {activeClass?.inviteCode ?? 'JOGOS2026'}</p></Card>
        <Card><p className="cq-muted-2 text-sm">{t('student.nextQuest')}</p><h3 className="cq-heading mt-2 text-xl font-black">{content('Calculate Damage')}</h3><p className="cq-muted mt-1 text-sm">{content('conditionals')}, {content('math')}, {content('methods')}</p></Card>
        <Card><p className="cq-muted-2 text-sm">{t('student.bossLocked')}</p><h3 className="cq-heading mt-2 text-xl font-black">{content('Boss - Simple Turn Result')}</h3><p className="cq-muted mt-1 text-sm">{t('student.fundamentalsFirst')}</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="cq-heading text-xl font-black">{t('student.availableTracks')}</h2>
          <div className="mt-4 grid gap-3">
            {tracks.data?.map((track) => <Link key={track.id} to="/student/map" className="cq-soft cq-border rounded-lg border p-4 hover:border-[#35ff7a]/50"><p className="cq-heading font-black">{content(track.title)}</p><p className="cq-muted text-sm">{content(track.description)}</p></Link>)}
          </div>
        </Card>
        {ranking.data && <RankingList entries={ranking.data.slice(0, 5)} />}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {badges.data?.slice(0, 3).map((badge) => <BadgeCard key={badge.id} badge={badge} />)}
      </div>
    </div>
  )
}

export function LearningMapPage() {
  const { t, content } = usePreferences()
  const tracks = useQuery({ queryKey: ['tracks'], queryFn: api.tracks })
  const track = tracks.data?.[0]
  const modules = useQuery({ queryKey: ['modules', track?.id], queryFn: () => api.modules(track!.id), enabled: !!track })

  if (tracks.isLoading || modules.isLoading) return <LoadingState />
  if (!track) return <EmptyState title={t('student.noTracks')} description={t('student.noTracksText')} />

  return (
    <div className="space-y-6">
      <Card>
        <Badge tone="cyan">{t('student.learningMap')}</Badge>
        <h1 className="cq-heading mt-3 text-4xl font-black">{content(track.title)}</h1>
        <p className="cq-muted mt-2">{content(track.description)}</p>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.data?.map((module) => (
          <Link key={module.id} to={`/student/modules/${module.id}`}>
            <ModuleNode module={module} />
          </Link>
        ))}
      </div>
    </div>
  )
}

export function ModulePage() {
  const { t, content } = usePreferences()
  const { moduleId = '' } = useParams()
  const lessons = useQuery({ queryKey: ['lessons', moduleId], queryFn: () => api.lessons(moduleId), enabled: !!moduleId })
  const exercises = useQuery({ queryKey: ['exercises', moduleId], queryFn: () => api.exercises(moduleId), enabled: !!moduleId })
  if (lessons.isLoading || exercises.isLoading) return <LoadingState />
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <h1 className="cq-heading text-3xl font-black">{t('student.lessons')}</h1>
        <div className="mt-4 space-y-3">{lessons.data?.map((lesson) => <Link className="cq-soft block rounded-lg p-4" key={lesson.id} to={`/student/lessons/${lesson.id}`}><h3 className="cq-heading font-black">{content(lesson.title)}</h3><p className="cq-muted text-sm">{content(lesson.objective)}</p></Link>)}</div>
      </Card>
      <Card>
        <h1 className="cq-heading text-3xl font-black">{t('student.quests')}</h1>
        <div className="mt-4 space-y-3">{exercises.data?.map((exercise) => <Link className="cq-soft cq-border block rounded-lg border p-4 hover:border-[#35ff7a]/50" key={exercise.id} to={`/student/exercises/${exercise.id}`}><div className="flex items-center justify-between"><h3 className="cq-heading font-black">{content(exercise.title)}</h3><Badge tone={exercise.difficulty === 'Boss' ? 'yellow' : 'green'}>{exercise.xpReward} XP</Badge></div><p className="cq-muted mt-2 text-sm">{content(exercise.description)}</p></Link>)}</div>
      </Card>
    </div>
  )
}

export function LessonPage() {
  const { t, content } = usePreferences()
  const { lessonId = '' } = useParams()
  const lesson = useQuery({ queryKey: ['lesson', lessonId], queryFn: () => api.lesson(lessonId), enabled: !!lessonId })
  const exercises = useQuery({ queryKey: ['lesson-exercises', lesson.data?.moduleId], queryFn: () => api.exercises(lesson.data!.moduleId), enabled: !!lesson.data })
  if (lesson.isLoading) return <LoadingState />
  if (!lesson.data) return <ErrorState message={t('student.lessonNotFound')} />
  const blocks = parseBlocks(lesson.data)
  const linkedExercise = exercises.data?.find((x) => x.lessonId === lesson.data.id)
  return (
    <Card className="mx-auto max-w-4xl">
      <Badge tone="cyan">{t('student.lesson')}</Badge>
      <h1 className="cq-heading mt-3 text-4xl font-black">{content(lesson.data.title)}</h1>
      <p className="cq-muted mt-2 text-lg">{content(lesson.data.objective)}</p>
      <div className="mt-6 space-y-4">{blocks.map((block, index) => <LessonBlock key={index} block={block} />)}</div>
      {linkedExercise && <Link className="mt-6 inline-flex" to={`/student/exercises/${linkedExercise.id}`}><Button>{t('student.startLinkedQuest')}</Button></Link>}
    </Card>
  )
}

export function ExercisePage() {
  const { t, content } = usePreferences()
  const { exerciseId = '' } = useParams()
  const queryClient = useQueryClient()
  const exercise = useQuery({ queryKey: ['exercise', exerciseId], queryFn: () => api.exercise(exerciseId), enabled: !!exerciseId })
  const submissions = useQuery({ queryKey: ['submissions'], queryFn: () => api.mySubmissions() })
  const hints = useQuery({ queryKey: ['hints', exerciseId], queryFn: () => api.exerciseHints(exerciseId), enabled: !!exerciseId && !!exercise.data?.allowHints })

  const currentExercise = exercise.data
  const [codeDraft, setCodeDraft] = useState<{ exerciseId: string; value: string } | null>(null)
  const code = codeDraft && currentExercise && codeDraft.exerciseId === currentExercise.id
    ? codeDraft.value
    : currentExercise?.starterCode ?? ''
  const [lastAction, setLastAction] = useState<'run' | 'submit' | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const { settings, update, reset } = useEditorSettings()

  // One IntegrityTracker per exercise so paste/keystroke counts reset between quests. useMemo here is
  // intentional: the tracker itself owns mutable counters, but we only want a *new* tracker when the
  // exercise changes, which is exactly what useMemo's identity guarantee gives us.
  const exerciseIdForTracker = currentExercise?.id
  const starterCodeForTracker = currentExercise?.starterCode
  const tracker = useMemo(
    () => (exerciseIdForTracker ? new IntegrityTracker(starterCodeForTracker ?? '') : null),
    [exerciseIdForTracker, starterCodeForTracker],
  )

  const run = useMutation({
    mutationFn: () => api.runCode(exerciseId, exercise.data!.language, code),
    onMutate: () => tracker?.recordRun(),
  })
  const submit = useMutation({
    mutationFn: () => api.submitCode(exerciseId, exercise.data!.language, code),
    onMutate: () => tracker?.recordSubmit(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      queryClient.invalidateQueries({ queryKey: ['xp'] })
      queryClient.invalidateQueries({ queryKey: ['badges'] })
    },
  })

  const possibleXp = useMemo(() => {
    if (!currentExercise) return 0
    const hintList = hints.data ?? currentExercise.hints ?? []
    const unlocked = hintList.filter((h) => h.isUnlocked)
    if (unlocked.length === 0) return currentExercise.xpReward
    const reveal = unlocked.find((h) => h.isSolutionReveal)
    if (reveal) {
      return Math.round((currentExercise.xpReward * Math.max(0, currentExercise.solutionRevealXpPercent)) / 100)
    }
    const maxPenalty = Math.max(...unlocked.map((h) => h.penaltyPercent))
    return Math.round((currentExercise.xpReward * (100 - maxPenalty)) / 100)
  }, [currentExercise, hints.data])

  if (exercise.isLoading) return <LoadingState />
  if (!currentExercise) return <ErrorState message={t('student.exerciseNotFound')} />

  const skills = safeArray(currentExercise.skillsJson)
  const attempts = submissions.data?.items.filter((item) => item.exerciseId === currentExercise.id) ?? []
  const latestResult = submit.data
  const runResult = run.data
  const submitStatus = computeSubmitStatus(submit, run, t)

  return (
    <div className="space-y-4">
      <ArenaTopBar
        exercise={currentExercise}
        possibleXp={possibleXp}
        status={submitStatus}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <Card>
            <h2 className="cq-heading flex items-center gap-2 text-xl font-black"><Sparkles size={16} /> {t('exercise.briefing')}</h2>
            <p className="cq-muted mt-3">{content(currentExercise.description)}</p>
            <div className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <Badge key={skill} tone="gray">{content(skill)}</Badge>)}</div>
            <h3 className="cq-heading mt-5 font-black">{t('student.visibleTests')}</h3>
            <div className="mt-2 space-y-2">
              {currentExercise.tests.map((test) => (
                <div key={test.id} className="cq-soft rounded-lg p-3 text-sm">
                  <code className="font-mono text-[var(--cq-heading)]">{test.name}</code> {t('student.shouldReturn')} <strong>{test.expectedOutput}</strong>
                </div>
              ))}
            </div>
          </Card>
          <HintPanel exercise={currentExercise} />
        </div>

        <Card className="p-0">
          <div className="cq-border flex flex-wrap items-center justify-between gap-3 border-b p-3">
            <div className="cq-muted flex items-center gap-2 text-sm font-bold"><Swords size={18} /> {t('student.questEditor')}</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setSettingsOpen(true)} title={t('editor.settingsTitle')}><Settings2 size={16} /></Button>
              <Button variant="ghost" onClick={() => setCodeDraft({ exerciseId: currentExercise.id, value: formatCSharpBasic(code, settings.tabSize) })} title={t('editor.format')}><Wand2 size={16} /></Button>
              <Button variant="ghost" onClick={() => setCodeDraft({ exerciseId: currentExercise.id, value: currentExercise.starterCode })} title={t('editor.reset')}><RotateCcw size={16} /></Button>
              <Button variant="secondary" onClick={() => {
                setLastAction('run')
                run.mutate()
              }} disabled={run.isPending || submit.isPending}><Play size={16} /> {run.isPending ? t('student.running') : t('student.run')}</Button>
              <Button onClick={() => {
                setLastAction('submit')
                submit.mutate()
              }} disabled={run.isPending || submit.isPending}><Send size={16} /> {submit.isPending ? t('student.submitting') : t('student.submit')}</Button>
            </div>
          </div>
          {tracker && (
            <QuestEditor
              exercise={currentExercise}
              value={code}
              onChange={(value) => setCodeDraft({ exerciseId: currentExercise.id, value })}
              settings={settings}
              integrity={tracker}
            />
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <ResultPanel
          title={t('student.console')}
          action={lastAction === 'submit' ? t('student.submitAction') : lastAction === 'run' ? t('student.runAction') : undefined}
          loading={run.isPending || submit.isPending}
          error={run.error ?? submit.error}
          result={latestResult ? { feedback: latestResult.feedback, tests: latestResult.testResults, score: latestResult.score, xpAwarded: latestResult.xpAwarded, xpBeforePenalty: latestResult.xpBeforePenalty, hintPenaltyPercent: latestResult.hintPenaltyPercent } : runResult}
        />
        <Card>
          <h2 className="cq-heading font-black">{t('student.attemptHistory')}</h2>
          <div className="mt-3 space-y-2">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="cq-soft flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                <span>{t('student.attempt')} #{attempt.attemptNumber}</span>
                <div className="flex items-center gap-2">
                  {attempt.hintsUsedCount > 0 && (
                    <Badge tone="yellow">-{attempt.hintPenaltyPercent}%</Badge>
                  )}
                  <Badge tone={attempt.status === 'Passed' ? 'green' : 'red'}>{statusLabel(attempt.status, t)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <EditorSettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={update}
        onReset={reset}
      />
    </div>
  )
}

function ArenaTopBar({ exercise, possibleXp, status, onOpenSettings }: { exercise: Exercise; possibleXp: number; status: string | null; onOpenSettings: () => void }) {
  const { t, content } = usePreferences()
  const penaltyActive = possibleXp < exercise.xpReward
  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={exercise.difficulty === 'Boss' ? 'yellow' : 'green'}>{content(exercise.difficulty)}</Badge>
        <Badge tone="cyan">{exercise.language}</Badge>
        <Badge tone={penaltyActive ? 'yellow' : 'purple'}>{possibleXp} / {exercise.xpReward} XP</Badge>
        {status && <Badge tone="gray">{status}</Badge>}
        <h1 className="cq-heading ml-2 grow text-2xl font-black md:text-3xl">{content(exercise.title)}</h1>
        <Button variant="ghost" onClick={onOpenSettings}><Settings2 size={16} /> {t('editor.settingsTitle')}</Button>
      </div>
      {penaltyActive && (
        <p className="cq-muted mt-2 text-xs">{t('exercise.penaltyNote')}</p>
      )}
    </Card>
  )
}

function computeSubmitStatus(
  submit: { isPending: boolean; isError: boolean; data?: { status: string; xpAwarded: number; hintPenaltyPercent: number } | undefined },
  run: { isPending: boolean; isError: boolean; data?: { status: string } | undefined },
  t: ReturnType<typeof usePreferences>['t'],
): string | null {
  if (submit.isPending || run.isPending) return t('exercise.running')
  if (submit.isError) return t('exercise.errored')
  if (submit.data) {
    if (submit.data.status === 'Passed' && submit.data.hintPenaltyPercent > 0) return t('exercise.xpReducedHints')
    if (submit.data.status === 'Passed') return t('exercise.xpAwarded')
    return t('exercise.testsFailed')
  }
  if (run.data) return run.data.status === 'Completed' ? t('exercise.testsPassed') : t('exercise.testsFailed')
  return null
}

export function BadgesPage() {
  const badges = useQuery({ queryKey: ['badges'], queryFn: api.badges })
  if (badges.isLoading) return <LoadingState />
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{badges.data?.map((badge) => <BadgeCard key={badge.id} badge={badge} />)}</div>
}

export function RankingPage() {
  const { t } = usePreferences()
  const classes = useQuery({ queryKey: ['classes'], queryFn: api.classes })
  const activeClass = classes.data?.[0]
  const ranking = useQuery({ queryKey: ['ranking', activeClass?.id], queryFn: () => api.classRanking(activeClass!.id), enabled: !!activeClass })
  if (ranking.isLoading) return <LoadingState />
  return ranking.data ? <RankingList entries={ranking.data} /> : <EmptyState title={t('student.noRanking')} description={t('student.noRankingText')} />
}

function LessonBlock({ block }: { block: Record<string, string> }) {
  const { t, content } = usePreferences()
  if (block.type === 'code') return <pre className="cq-code overflow-auto rounded-xl p-4 text-sm">{block.code}</pre>
  if (block.type === 'mistake') return <div className="rounded-xl border border-yellow-300/30 bg-yellow-500/10 p-4 text-yellow-700 dark:text-yellow-100"><strong>{t('lesson.commonMistake')}</strong> {content(block.text)}</div>
  if (block.type === 'summary') return <div className="rounded-xl border border-[#35ff7a]/30 bg-[#35ff7a]/10 p-4 text-[#168044]"><strong>{t('lesson.summary')}</strong> {content(block.text)}</div>
  return <p className="cq-text">{content(block.text)}</p>
}

function ResultPanel({
  title,
  action,
  loading,
  error,
  result,
}: {
  title: string
  action?: string
  loading?: boolean
  error?: Error | null
  result?: {
    feedback: string
    output?: string
    tests: { name: string; passed: boolean; expected?: string; actual?: string; error?: string; isHidden: boolean }[]
    score: number
    xpAwarded?: number
    xpBeforePenalty?: number
    hintPenaltyPercent?: number
  }
}) {
  const { t, content } = usePreferences()
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="cq-heading font-black">{title}</h2>
        {action && <Badge tone="cyan">{t('student.lastAction')}: {action}</Badge>}
      </div>
      {loading && <p className="cq-muted mt-3 text-sm">{t('student.running')}</p>}
      {error && <p className="mt-3 rounded-lg border border-pink-300/30 bg-pink-500/10 p-3 text-sm text-pink-700 dark:text-pink-100">{error.message || t('student.requestFailed')}</p>}
      {!loading && !error && !result ? <p className="cq-muted mt-3 text-sm">{t('student.resultEmpty')}</p> : null}
      {!loading && !error && result ? (
        <div className="mt-3 space-y-3">
          <div className="cq-soft rounded-lg p-3 text-sm">{content(result.feedback)}</div>
          {result.xpAwarded !== undefined && result.xpBeforePenalty !== undefined && (
            <div className="rounded-lg border border-[#35ff7a]/30 bg-[#35ff7a]/10 p-3 text-sm">
              <strong className="text-[#168044] dark:text-[#83ffa8]">
                {result.xpAwarded} XP {t('exercise.awarded')}
              </strong>
              {result.hintPenaltyPercent && result.hintPenaltyPercent > 0 ? (
                <span className="cq-muted ml-2">
                  ({t('exercise.basePotential')}: {result.xpBeforePenalty} XP, -{result.hintPenaltyPercent}% {t('exercise.dueToHints')})
                </span>
              ) : null}
            </div>
          )}
          <ProgressBar value={result.score} />
          {result.tests.map((test) => <div key={test.name} className="cq-soft rounded-lg p-3 text-sm"><div className="flex items-center justify-between"><span className="cq-heading font-bold">{test.name}{test.isHidden ? ` (${t('common.hidden')})` : ''}</span><Badge tone={test.passed ? 'green' : 'red'}>{test.passed ? t('common.passed') : t('common.failed')}</Badge></div>{test.error && <p className="mt-2 text-pink-100">{test.error}</p>}</div>)}
        </div>
      ) : null}
    </Card>
  )
}

function parseBlocks(lesson: Lesson): Record<string, string>[] {
  try {
    return JSON.parse(lesson.contentJson)
  } catch {
    return [{ type: 'paragraph', text: lesson.objective }]
  }
}

function safeArray(value: string): string[] {
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

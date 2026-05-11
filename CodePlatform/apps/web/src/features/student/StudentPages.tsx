import { lazy, Suspense, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Lightbulb, Play, RotateCcw, Send, Swords } from 'lucide-react'
import { api } from '../../api/client'
import { BadgeCard, ModuleNode, RankingList, XPBar } from '../../components/gamification/Gamification'
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui/primitives'
import { statusLabel, usePreferences } from '../../i18n/preferences'
import type { Lesson } from '../../types'

const Editor = lazy(() => import('@monaco-editor/react'))

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
  const { t, content, theme } = usePreferences()
  const { exerciseId = '' } = useParams()
  const queryClient = useQueryClient()
  const exercise = useQuery({ queryKey: ['exercise', exerciseId], queryFn: () => api.exercise(exerciseId), enabled: !!exerciseId })
  const submissions = useQuery({ queryKey: ['submissions'], queryFn: () => api.mySubmissions() })
  const currentExercise = exercise.data
  const [codeDraft, setCodeDraft] = useState<{ exerciseId: string; value: string } | null>(null)
  const code = codeDraft && currentExercise && codeDraft.exerciseId === currentExercise.id
    ? codeDraft.value
    : currentExercise?.starterCode ?? ''
  const [hint, setHint] = useState('')
  const [lastAction, setLastAction] = useState<'run' | 'submit' | null>(null)
  const run = useMutation({ mutationFn: () => api.runCode(exerciseId, exercise.data!.language, code) })
  const submit = useMutation({
    mutationFn: () => api.submitCode(exerciseId, exercise.data!.language, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] })
      queryClient.invalidateQueries({ queryKey: ['xp'] })
      queryClient.invalidateQueries({ queryKey: ['badges'] })
    },
  })
  const hintMutation = useMutation({ mutationFn: () => api.hint(exerciseId, code), onSuccess: (data) => setHint(data.response) })

  if (exercise.isLoading) return <LoadingState />
  if (!currentExercise) return <ErrorState message={t('student.exerciseNotFound')} />

  const latestResult = submit.data
  const runResult = run.data
  const skills = safeArray(currentExercise.skillsJson)
  const attempts = submissions.data?.items.filter((item) => item.exerciseId === currentExercise.id) ?? []

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={currentExercise.difficulty === 'Boss' ? 'yellow' : 'green'}>{content(currentExercise.difficulty)}</Badge>
            <Badge tone="cyan">{currentExercise.language}</Badge>
            <Badge tone="purple">{currentExercise.xpReward} XP</Badge>
          </div>
          <h1 className="cq-heading mt-4 text-3xl font-black">{content(currentExercise.title)}</h1>
          <p className="cq-muted mt-3">{content(currentExercise.description)}</p>
          <div className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <Badge key={skill} tone="gray">{content(skill)}</Badge>)}</div>
          <h2 className="cq-heading mt-6 font-black">{t('student.visibleTests')}</h2>
          <div className="mt-3 space-y-2">{currentExercise.tests.map((test) => <div key={test.id} className="cq-soft rounded-lg p-3 text-sm">{test.name} {t('student.shouldReturn')} {test.expectedOutput}</div>)}</div>
          <div className="mt-4 rounded-lg border border-cyan-300/30 bg-cyan-400/10 p-3 text-sm">
            <p className="font-black text-cyan-700 dark:text-cyan-100">{t('student.mockNoticeTitle')}</p>
            <p className="cq-muted mt-1">{t('student.mockNoticeText')}</p>
          </div>
          <Button className="mt-5" variant="secondary" onClick={() => hintMutation.mutate()}><Lightbulb size={18} /> {t('student.askHint')}</Button>
          {hintMutation.isError && <p className="mt-3 rounded-lg border border-pink-300/30 bg-pink-500/10 p-3 text-sm text-pink-700 dark:text-pink-100">{hintMutation.error instanceof Error ? hintMutation.error.message : t('student.requestFailed')}</p>}
          {hint && <p className="mt-3 rounded-lg border border-cyan-300/30 bg-cyan-400/10 p-3 text-sm text-cyan-700 dark:text-cyan-100">{content(hint)}</p>}
        </Card>

        <Card className="p-0">
          <div className="cq-border flex flex-wrap items-center justify-between gap-3 border-b p-3">
            <div className="cq-muted flex items-center gap-2 text-sm font-bold"><Swords size={18} /> {t('student.questEditor')}</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => {
                setLastAction('run')
                run.mutate()
              }} disabled={run.isPending || submit.isPending}><Play size={16} /> {run.isPending ? t('student.running') : t('student.run')}</Button>
              <Button onClick={() => {
                setLastAction('submit')
                submit.mutate()
              }} disabled={run.isPending || submit.isPending}><Send size={16} /> {submit.isPending ? t('student.submitting') : t('student.submit')}</Button>
              <Button variant="ghost" onClick={() => setCodeDraft({ exerciseId: currentExercise.id, value: currentExercise.starterCode })}><RotateCcw size={16} /></Button>
            </div>
          </div>
          <Suspense fallback={<div className="cq-muted flex h-[520px] items-center justify-center text-sm">{t('student.questEditor')}…</div>}>
            <Editor height="520px" defaultLanguage="csharp" theme={theme === 'dark' ? 'vs-dark' : 'light'} value={code} onChange={(value) => setCodeDraft({ exerciseId: currentExercise.id, value: value ?? '' })} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} />
          </Suspense>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <ResultPanel
          title={t('student.console')}
          action={lastAction === 'submit' ? t('student.submitAction') : lastAction === 'run' ? t('student.runAction') : undefined}
          loading={run.isPending || submit.isPending}
          error={run.error ?? submit.error}
          result={latestResult ? { feedback: latestResult.feedback, tests: latestResult.testResults, score: latestResult.score } : runResult}
        />
        <Card>
          <h2 className="cq-heading font-black">{t('student.attemptHistory')}</h2>
          <div className="mt-3 space-y-2">{attempts.map((attempt) => <div key={attempt.id} className="cq-soft flex items-center justify-between rounded-lg px-3 py-2 text-sm"><span>{t('student.attempt')} #{attempt.attemptNumber}</span><Badge tone={attempt.status === 'Passed' ? 'green' : 'red'}>{statusLabel(attempt.status, t)}</Badge></div>)}</div>
        </Card>
      </div>
    </div>
  )
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
  result?: { feedback: string; output?: string; tests: { name: string; passed: boolean; expected?: string; actual?: string; error?: string; isHidden: boolean }[]; score: number }
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

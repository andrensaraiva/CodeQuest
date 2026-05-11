import { useMemo, useState } from 'react'
import Editor from '@monaco-editor/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Lightbulb, Play, RotateCcw, Send, Swords } from 'lucide-react'
import { api } from '../../api/client'
import { BadgeCard, ModuleNode, RankingList, XPBar } from '../../components/gamification/Gamification'
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, ProgressBar } from '../../components/ui/primitives'
import type { Lesson } from '../../types'

export function StudentDashboard() {
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
        <Card className="bg-gradient-to-br from-[#101720] to-[#0c141c]">
          <Badge tone="green">Current mission</Badge>
          <h1 className="mt-4 text-4xl font-black text-white">Continue: C# for Game Logic</h1>
          <p className="mt-3 max-w-2xl text-[#9fb2a8]">Clear short C# quests, build game-system logic, and prepare for Unity scripting without forcing Unity into the browser.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/student/map"><Button>Open Learning Map</Button></Link>
            <Link to="/student/ranking"><Button variant="secondary">View Ranking</Button></Link>
          </div>
        </Card>
        {xp.data && <XPBar {...xp.data} />}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-[#8aa09a]">Active class</p><h3 className="mt-2 text-xl font-black text-white">{activeClass?.name ?? 'Join a class'}</h3><p className="mt-1 text-sm text-[#9fb2a8]">Invite code: {activeClass?.inviteCode ?? 'JOGOS2026'}</p></Card>
        <Card><p className="text-sm text-[#8aa09a]">Next quest</p><h3 className="mt-2 text-xl font-black text-white">Calculate Damage</h3><p className="mt-1 text-sm text-[#9fb2a8]">Conditionals, math, methods</p></Card>
        <Card><p className="text-sm text-[#8aa09a]">Boss locked</p><h3 className="mt-2 text-xl font-black text-white">Simple Turn Result</h3><p className="mt-1 text-sm text-[#9fb2a8]">Clear fundamentals first.</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <h2 className="text-xl font-black text-white">Available tracks</h2>
          <div className="mt-4 grid gap-3">
            {tracks.data?.map((track) => <Link key={track.id} to="/student/map" className="rounded-lg border border-white/10 bg-white/[0.04] p-4 hover:border-[#35ff7a]/50"><p className="font-black text-white">{track.title}</p><p className="text-sm text-[#9fb2a8]">{track.description}</p></Link>)}
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
  const tracks = useQuery({ queryKey: ['tracks'], queryFn: api.tracks })
  const track = tracks.data?.[0]
  const modules = useQuery({ queryKey: ['modules', track?.id], queryFn: () => api.modules(track!.id), enabled: !!track })

  if (tracks.isLoading || modules.isLoading) return <LoadingState />
  if (!track) return <EmptyState title="No tracks yet" description="Ask your teacher to publish a C# learning track." />

  return (
    <div className="space-y-6">
      <Card>
        <Badge tone="cyan">Learning map</Badge>
        <h1 className="mt-3 text-4xl font-black text-white">{track.title}</h1>
        <p className="mt-2 text-[#9fb2a8]">{track.description}</p>
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
  const { moduleId = '' } = useParams()
  const lessons = useQuery({ queryKey: ['lessons', moduleId], queryFn: () => api.lessons(moduleId), enabled: !!moduleId })
  const exercises = useQuery({ queryKey: ['exercises', moduleId], queryFn: () => api.exercises(moduleId), enabled: !!moduleId })
  if (lessons.isLoading || exercises.isLoading) return <LoadingState />
  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <h1 className="text-3xl font-black text-white">Lessons</h1>
        <div className="mt-4 space-y-3">{lessons.data?.map((lesson) => <Link className="block rounded-lg bg-white/[0.04] p-4 hover:bg-white/[0.07]" key={lesson.id} to={`/student/lessons/${lesson.id}`}><h3 className="font-black text-white">{lesson.title}</h3><p className="text-sm text-[#9fb2a8]">{lesson.objective}</p></Link>)}</div>
      </Card>
      <Card>
        <h1 className="text-3xl font-black text-white">Quests</h1>
        <div className="mt-4 space-y-3">{exercises.data?.map((exercise) => <Link className="block rounded-lg border border-white/10 bg-white/[0.04] p-4 hover:border-[#35ff7a]/50" key={exercise.id} to={`/student/exercises/${exercise.id}`}><div className="flex items-center justify-between"><h3 className="font-black text-white">{exercise.title}</h3><Badge tone={exercise.difficulty === 'Boss' ? 'yellow' : 'green'}>{exercise.xpReward} XP</Badge></div><p className="mt-2 text-sm text-[#9fb2a8]">{exercise.description}</p></Link>)}</div>
      </Card>
    </div>
  )
}

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const lesson = useQuery({ queryKey: ['lesson', lessonId], queryFn: () => api.lesson(lessonId), enabled: !!lessonId })
  const exercises = useQuery({ queryKey: ['lesson-exercises', lesson.data?.moduleId], queryFn: () => api.exercises(lesson.data!.moduleId), enabled: !!lesson.data })
  if (lesson.isLoading) return <LoadingState />
  if (!lesson.data) return <ErrorState message="Lesson not found." />
  const blocks = parseBlocks(lesson.data)
  const linkedExercise = exercises.data?.find((x) => x.lessonId === lesson.data.id)
  return (
    <Card className="mx-auto max-w-4xl">
      <Badge tone="cyan">Lesson</Badge>
      <h1 className="mt-3 text-4xl font-black text-white">{lesson.data.title}</h1>
      <p className="mt-2 text-lg text-[#b7c8c0]">{lesson.data.objective}</p>
      <div className="mt-6 space-y-4">{blocks.map((block, index) => <LessonBlock key={index} block={block} />)}</div>
      {linkedExercise && <Link className="mt-6 inline-flex" to={`/student/exercises/${linkedExercise.id}`}><Button>Start linked quest</Button></Link>}
    </Card>
  )
}

export function ExercisePage() {
  const { exerciseId = '' } = useParams()
  const queryClient = useQueryClient()
  const exercise = useQuery({ queryKey: ['exercise', exerciseId], queryFn: () => api.exercise(exerciseId), enabled: !!exerciseId })
  const submissions = useQuery({ queryKey: ['submissions'], queryFn: api.mySubmissions })
  const [code, setCode] = useState('')
  const [hint, setHint] = useState('')
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

  const currentExercise = exercise.data
  useMemo(() => {
    if (currentExercise && !code) setCode(currentExercise.starterCode)
  }, [currentExercise, code])

  if (exercise.isLoading) return <LoadingState />
  if (!currentExercise) return <ErrorState message="Exercise not found." />

  const latestResult = submit.data
  const runResult = run.data
  const skills = safeArray(currentExercise.skillsJson)
  const attempts = submissions.data?.filter((item) => item.exerciseId === currentExercise.id) ?? []

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={currentExercise.difficulty === 'Boss' ? 'yellow' : 'green'}>{currentExercise.difficulty}</Badge>
            <Badge tone="cyan">{currentExercise.language}</Badge>
            <Badge tone="purple">{currentExercise.xpReward} XP</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-black text-white">{currentExercise.title}</h1>
          <p className="mt-3 text-[#b7c8c0]">{currentExercise.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">{skills.map((skill) => <Badge key={skill} tone="gray">{skill}</Badge>)}</div>
          <h2 className="mt-6 font-black text-white">Visible tests</h2>
          <div className="mt-3 space-y-2">{currentExercise.tests.map((test) => <div key={test.id} className="rounded-lg bg-white/[0.04] p-3 text-sm text-[#d7ffe1]">{test.name} should return {test.expectedOutput}</div>)}</div>
          <Button className="mt-5" variant="secondary" onClick={() => hintMutation.mutate()}><Lightbulb size={18} /> Ask for hint</Button>
          {hint && <p className="mt-3 rounded-lg border border-cyan-300/30 bg-cyan-950/20 p-3 text-sm text-cyan-100">{hint}</p>}
        </Card>

        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#9fb2a8]"><Swords size={18} /> Quest editor</div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => run.mutate()} disabled={run.isPending}><Play size={16} /> Run</Button>
              <Button onClick={() => submit.mutate()} disabled={submit.isPending}><Send size={16} /> Submit</Button>
              <Button variant="ghost" onClick={() => setCode(currentExercise.starterCode)}><RotateCcw size={16} /></Button>
            </div>
          </div>
          <Editor height="520px" defaultLanguage="csharp" theme="vs-dark" value={code} onChange={(value) => setCode(value ?? '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.7fr]">
        <ResultPanel title="Console and tests" result={latestResult ? { feedback: latestResult.feedback, tests: latestResult.testResults, score: latestResult.score } : runResult} />
        <Card>
          <h2 className="font-black text-white">Attempt history</h2>
          <div className="mt-3 space-y-2">{attempts.map((attempt) => <div key={attempt.id} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-sm"><span>Attempt #{attempt.attemptNumber}</span><Badge tone={attempt.status === 'Passed' ? 'green' : 'red'}>{attempt.status}</Badge></div>)}</div>
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
  const classes = useQuery({ queryKey: ['classes'], queryFn: api.classes })
  const activeClass = classes.data?.[0]
  const ranking = useQuery({ queryKey: ['ranking', activeClass?.id], queryFn: () => api.classRanking(activeClass!.id), enabled: !!activeClass })
  if (ranking.isLoading) return <LoadingState />
  return ranking.data ? <RankingList entries={ranking.data} /> : <EmptyState title="No ranking yet" description="Join a class and clear quests to appear here." />
}

function LessonBlock({ block }: { block: Record<string, string> }) {
  if (block.type === 'code') return <pre className="overflow-auto rounded-xl bg-[#05080c] p-4 text-sm text-[#d7ffe1]">{block.code}</pre>
  if (block.type === 'mistake') return <div className="rounded-xl border border-yellow-300/30 bg-yellow-950/20 p-4 text-yellow-100"><strong>Common mistake:</strong> {block.text}</div>
  if (block.type === 'summary') return <div className="rounded-xl border border-[#35ff7a]/30 bg-[#35ff7a]/10 p-4 text-[#d7ffe1]"><strong>Summary:</strong> {block.text}</div>
  return <p className="text-[#d1ded8]">{block.text}</p>
}

function ResultPanel({ title, result }: { title: string; result?: { feedback: string; output?: string; tests: { name: string; passed: boolean; expected?: string; actual?: string; error?: string; isHidden: boolean }[]; score: number } }) {
  return (
    <Card>
      <h2 className="font-black text-white">{title}</h2>
      {!result ? <p className="mt-3 text-sm text-[#9fb2a8]">Run or submit code to see feedback.</p> : (
        <div className="mt-3 space-y-3">
          <div className="rounded-lg bg-white/[0.04] p-3 text-sm text-[#d7ffe1]">{result.feedback}</div>
          <ProgressBar value={result.score} />
          {result.tests.map((test) => <div key={test.name} className="rounded-lg bg-white/[0.04] p-3 text-sm"><div className="flex items-center justify-between"><span className="font-bold text-white">{test.name}{test.isHidden ? ' (hidden)' : ''}</span><Badge tone={test.passed ? 'green' : 'red'}>{test.passed ? 'Passed' : 'Failed'}</Badge></div>{test.error && <p className="mt-2 text-pink-100">{test.error}</p>}</div>)}
        </div>
      )}
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

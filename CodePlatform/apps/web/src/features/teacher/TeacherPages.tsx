import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { BarChart3, ClipboardList, Plus, Users } from 'lucide-react'
import { api } from '../../api/client'
import { Badge, Button, Card, EmptyState, Input, Select, StatCard, Textarea } from '../../components/ui/primitives'

export function TeacherDashboard() {
  const classes = useQuery({ queryKey: ['classes'], queryFn: api.classes })
  const tracks = useQuery({ queryKey: ['tracks'], queryFn: api.tracks })
  const activeClass = classes.data?.[0]
  const students = useQuery({ queryKey: ['students', activeClass?.id], queryFn: () => api.classStudents(activeClass!.id), enabled: !!activeClass })
  const report = useQuery({ queryKey: ['report', activeClass?.id], queryFn: () => api.classReport(activeClass!.id), enabled: !!activeClass })

  return (
    <div className="space-y-6">
      <Card>
        <Badge tone="green">Teacher command center</Badge>
        <h1 className="mt-3 text-4xl font-black text-white">Welcome, Professor Demo</h1>
        <p className="mt-2 text-[#9fb2a8]">Create C# quests, monitor attempts, and spot concepts that need recovery practice.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/teacher/classes"><Button><Users size={18} /> Manage classes</Button></Link>
          <Link to="/teacher/builder"><Button variant="secondary"><Plus size={18} /> Create exercise</Button></Link>
          <Link to="/teacher/reports"><Button variant="secondary"><BarChart3 size={18} /> View reports</Button></Link>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Classes" value={classes.data?.length ?? 0} />
        <StatCard label="Students" value={students.data?.length ?? 0} />
        <StatCard label="Tracks" value={tracks.data?.length ?? 0} />
        <StatCard label="Submissions" value={report.data?.submissionCount ?? 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black text-white">Active classes</h2>
          <div className="mt-4 space-y-3">{classes.data?.map((item) => <Link key={item.id} className="block rounded-lg bg-white/[0.04] p-4 hover:bg-white/[0.07]" to={`/teacher/classes/${item.id}`}><div className="flex items-center justify-between"><h3 className="font-black text-white">{item.name}</h3><Badge tone="green">{item.inviteCode}</Badge></div><p className="mt-1 text-sm text-[#9fb2a8]">{item.studentCount} students</p></Link>)}</div>
        </Card>
        <Card>
          <h2 className="text-xl font-black text-white">Most difficult exercises</h2>
          <div className="mt-4 space-y-2">{report.data?.difficultExercises.length ? report.data.difficultExercises.map((item) => <div key={item} className="rounded-lg bg-white/[0.04] p-3 text-sm text-[#d7ffe1]">{item}</div>) : <p className="text-sm text-[#9fb2a8]">No repeated failures yet.</p>}</div>
        </Card>
      </div>
    </div>
  )
}

export function ClassesPage() {
  const queryClient = useQueryClient()
  const classes = useQuery({ queryKey: ['classes'], queryFn: api.classes })
  const [name, setName] = useState('New Game Logic Class')
  const [description, setDescription] = useState('C# quests for game programming fundamentals.')
  const create = useMutation({ mutationFn: () => api.createClass(name, description), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] }) })
  return (
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <h1 className="text-2xl font-black text-white">Create class</h1>
        <div className="mt-4 space-y-3">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          <Button onClick={() => create.mutate()} disabled={create.isPending}>Create class</Button>
        </div>
      </Card>
      <Card>
        <h1 className="text-2xl font-black text-white">Classrooms</h1>
        <div className="mt-4 space-y-3">{classes.data?.map((item) => <Link to={`/teacher/classes/${item.id}`} key={item.id} className="block rounded-lg border border-white/10 bg-white/[0.04] p-4 hover:border-[#35ff7a]/50"><div className="flex items-center justify-between"><h3 className="font-black text-white">{item.name}</h3><Badge tone="green">{item.inviteCode}</Badge></div><p className="text-sm text-[#9fb2a8]">{item.description}</p></Link>)}</div>
      </Card>
    </div>
  )
}

export function ClassDetailPage() {
  const { classId = '' } = useParams()
  const students = useQuery({ queryKey: ['students', classId], queryFn: () => api.classStudents(classId), enabled: !!classId })
  const ranking = useQuery({ queryKey: ['ranking', classId], queryFn: () => api.classRanking(classId), enabled: !!classId })
  if (!students.data?.length) return <EmptyState title="No students yet" description="Share the invite code JOGOS2026 with students." />
  return (
    <div className="space-y-5">
      <Card>
        <Badge tone="cyan">Class detail</Badge>
        <h1 className="mt-3 text-3xl font-black text-white">Student progress</h1>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[#8aa09a]"><tr><th className="p-3">Student</th><th>XP</th><th>Level</th><th>Completed</th><th>Failed attempts</th><th>Last activity</th></tr></thead>
            <tbody>{students.data.map((student) => <tr key={student.studentId} className="border-t border-white/10"><td className="p-3 font-bold text-white">{student.name}<p className="text-xs font-normal text-[#8aa09a]">{student.email}</p></td><td>{student.xp}</td><td>{student.level}</td><td>{student.completedExercises}</td><td>{student.failedAttempts}</td><td>{student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : 'No activity'}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h2 className="text-xl font-black text-white">Ranking preview</h2>
        <div className="mt-3 grid gap-2">{ranking.data?.map((entry) => <div key={entry.studentId} className="flex justify-between rounded-lg bg-white/[0.04] p-3"><span>#{entry.rank} {entry.name}</span><Badge tone="green">{entry.xp} XP</Badge></div>)}</div>
      </Card>
    </div>
  )
}

export function ContentBuilderPage() {
  const queryClient = useQueryClient()
  const tracks = useQuery({ queryKey: ['tracks'], queryFn: api.tracks })
  const firstTrack = tracks.data?.[0]
  const modules = useQuery({ queryKey: ['modules', firstTrack?.id], queryFn: () => api.modules(firstTrack!.id), enabled: !!firstTrack })
  const firstModule = modules.data?.[0]
  const [title, setTitle] = useState('New C# Quest')
  const [description, setDescription] = useState('Describe the game logic problem students must solve.')
  const [starterCode, setStarterCode] = useState('public class Program\n{\n    public static int Solve(int value)\n    {\n        return 0;\n    }\n}')
  const [xpReward, setXpReward] = useState(30)
  const preview = useMemo(() => ({ title, description, starterCode, xpReward }), [title, description, starterCode, xpReward])
  const create = useMutation({
    mutationFn: () => api.createExercise({
      moduleId: firstModule?.id,
      lessonId: undefined,
      title,
      description,
      language: 'CSharp',
      difficulty: 'Easy',
      starterCode,
      referenceSolution: starterCode,
      xpReward,
      skillsJson: JSON.stringify(['teacher-created', 'csharp']),
      hintsJson: JSON.stringify(['Break the method into one small rule.', 'Compare against the visible tests first.']),
      isPublished: true,
      orderIndex: 50,
      tests: [
        { name: 'Visible sample', type: 'UnitTest', input: '', expectedOutput: '1', testCode: 'Solve(1)', isHidden: false, points: 1, orderIndex: 1 },
        { name: 'Hidden boundary', type: 'UnitTest', input: '', expectedOutput: '2', testCode: 'Solve(2)', isHidden: true, points: 1, orderIndex: 2 },
      ],
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercises'] }),
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    create.mutate()
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <h1 className="text-2xl font-black text-white">Exercise creator</h1>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          <Select value="CSharp" disabled><option>CSharp</option><option disabled>Java (future)</option><option disabled>JavaScript (future)</option><option disabled>Python (future)</option></Select>
          <Input type="number" value={xpReward} onChange={(event) => setXpReward(Number(event.target.value))} />
          <Textarea className="font-mono" value={starterCode} onChange={(event) => setStarterCode(event.target.value)} />
          <Button disabled={!firstModule || create.isPending}><ClipboardList size={18} /> Save and publish</Button>
        </form>
      </Card>
      <Card>
        <Badge tone="purple">Student preview</Badge>
        <h2 className="mt-3 text-3xl font-black text-white">{preview.title}</h2>
        <p className="mt-2 text-[#9fb2a8]">{preview.description}</p>
        <Badge className="mt-4" tone="green">{preview.xpReward} XP</Badge>
        <pre className="mt-4 overflow-auto rounded-xl bg-[#05080c] p-4 text-sm text-[#d7ffe1]">{preview.starterCode}</pre>
        {create.isSuccess && <p className="mt-3 rounded-lg bg-[#35ff7a]/10 p-3 text-sm text-[#83ffa8]">Exercise created. It is now available in the module.</p>}
      </Card>
    </div>
  )
}

export function ReportsPage() {
  const classes = useQuery({ queryKey: ['classes'], queryFn: api.classes })
  const activeClass = classes.data?.[0]
  const report = useQuery({ queryKey: ['report', activeClass?.id], queryFn: () => api.classReport(activeClass!.id), enabled: !!activeClass })
  if (!activeClass) return <EmptyState title="No class selected" description="Create a class to see reports." />
  return (
    <div className="space-y-5">
      <Card>
        <Badge tone="cyan">Reports</Badge>
        <h1 className="mt-3 text-3xl font-black text-white">{report.data?.className ?? activeClass.name}</h1>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Students" value={report.data?.studentCount ?? 0} />
        <StatCard label="Submissions" value={report.data?.submissionCount ?? 0} />
        <StatCard label="Completions" value={report.data?.completionCount ?? 0} />
        <StatCard label="At risk" value={report.data?.difficultStudents.length ?? 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="text-xl font-black text-white">Difficult exercises</h2><div className="mt-3 space-y-2">{report.data?.difficultExercises.map((item) => <div key={item} className="rounded-lg bg-white/[0.04] p-3 text-sm">{item}</div>)}</div></Card>
        <Card><h2 className="text-xl font-black text-white">Students needing support</h2><div className="mt-3 space-y-2">{report.data?.difficultStudents.map((student) => <div key={student.studentId} className="flex justify-between rounded-lg bg-white/[0.04] p-3 text-sm"><span>{student.name}</span><Badge tone="yellow">{student.failedAttempts} failed attempts</Badge></div>)}</div></Card>
      </div>
    </div>
  )
}

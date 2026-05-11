import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { BarChart3, ClipboardList, Plus, Users } from 'lucide-react'
import { api } from '../../api/client'
import { Badge, Button, Card, EmptyState, Input, Select, StatCard, Textarea } from '../../components/ui/primitives'
import { usePreferences } from '../../i18n/preferences'

export function TeacherDashboard() {
  const { t, content } = usePreferences()
  const classes = useQuery({ queryKey: ['classes'], queryFn: api.classes })
  const tracks = useQuery({ queryKey: ['tracks'], queryFn: api.tracks })
  const activeClass = classes.data?.[0]
  const students = useQuery({ queryKey: ['students', activeClass?.id], queryFn: () => api.classStudents(activeClass!.id), enabled: !!activeClass })
  const report = useQuery({ queryKey: ['report', activeClass?.id], queryFn: () => api.classReport(activeClass!.id), enabled: !!activeClass })

  return (
    <div className="space-y-6">
      <Card>
        <Badge tone="green">{t('teacher.commandCenter')}</Badge>
        <h1 className="cq-heading mt-3 text-4xl font-black">{t('teacher.welcome')}</h1>
        <p className="cq-muted mt-2">{t('teacher.intro')}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/teacher/classes"><Button><Users size={18} /> {t('teacher.manageClasses')}</Button></Link>
          <Link to="/teacher/builder"><Button variant="secondary"><Plus size={18} /> {t('teacher.createExercise')}</Button></Link>
          <Link to="/teacher/reports"><Button variant="secondary"><BarChart3 size={18} /> {t('teacher.viewReports')}</Button></Link>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label={t('teacher.classes')} value={classes.data?.length ?? 0} />
        <StatCard label={t('teacher.students')} value={students.data?.length ?? 0} />
        <StatCard label={t('teacher.tracks')} value={tracks.data?.length ?? 0} />
        <StatCard label={t('teacher.submissions')} value={report.data?.submissionCount ?? 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="cq-heading text-xl font-black">{t('teacher.activeClasses')}</h2>
          <div className="mt-4 space-y-3">{classes.data?.map((item) => <Link key={item.id} className="cq-soft block rounded-lg p-4" to={`/teacher/classes/${item.id}`}><div className="flex items-center justify-between"><h3 className="cq-heading font-black">{item.name}</h3><Badge tone="green">{item.inviteCode}</Badge></div><p className="cq-muted mt-1 text-sm">{item.studentCount} {t('teacher.studentCount')}</p></Link>)}</div>
        </Card>
        <Card>
          <h2 className="cq-heading text-xl font-black">{t('teacher.difficultExercises')}</h2>
          <div className="mt-4 space-y-2">{report.data?.difficultExercises.length ? report.data.difficultExercises.map((item) => <div key={item} className="cq-soft rounded-lg p-3 text-sm">{content(item)}</div>) : <p className="cq-muted text-sm">{t('teacher.noFailures')}</p>}</div>
        </Card>
      </div>
    </div>
  )
}

export function ClassesPage() {
  const { t, content } = usePreferences()
  const queryClient = useQueryClient()
  const classes = useQuery({ queryKey: ['classes'], queryFn: api.classes })
  const [name, setName] = useState(t('teacher.defaultClassName'))
  const [description, setDescription] = useState(t('teacher.defaultClassDescription'))
  const create = useMutation({ mutationFn: () => api.createClass(name, description), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] }) })
  return (
    <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <Card>
        <h1 className="cq-heading text-2xl font-black">{t('teacher.createClass')}</h1>
        <div className="mt-4 space-y-3">
          <Input value={name} onChange={(event) => setName(event.target.value)} />
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          <Button onClick={() => create.mutate()} disabled={create.isPending}>{t('teacher.createClass')}</Button>
        </div>
      </Card>
      <Card>
        <h1 className="cq-heading text-2xl font-black">{t('teacher.classrooms')}</h1>
        <div className="mt-4 space-y-3">{classes.data?.map((item) => <Link to={`/teacher/classes/${item.id}`} key={item.id} className="cq-soft cq-border block rounded-lg border p-4 hover:border-[#35ff7a]/50"><div className="flex items-center justify-between"><h3 className="cq-heading font-black">{item.name}</h3><Badge tone="green">{item.inviteCode}</Badge></div><p className="cq-muted text-sm">{content(item.description)}</p></Link>)}</div>
      </Card>
    </div>
  )
}

export function ClassDetailPage() {
  const { t, content } = usePreferences()
  const { classId = '' } = useParams()
  const students = useQuery({ queryKey: ['students', classId], queryFn: () => api.classStudents(classId), enabled: !!classId })
  const ranking = useQuery({ queryKey: ['ranking', classId], queryFn: () => api.classRanking(classId), enabled: !!classId })
  if (!students.data?.length) return <EmptyState title={t('teacher.noStudents')} description={t('teacher.noStudentsText')} />
  return (
    <div className="space-y-5">
      <Card>
        <Badge tone="cyan">{t('teacher.classDetail')}</Badge>
        <h1 className="cq-heading mt-3 text-3xl font-black">{t('teacher.studentProgress')}</h1>
      </Card>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="cq-muted-2"><tr><th className="p-3">{t('common.student')}</th><th>{t('teacher.xp')}</th><th>{t('teacher.level')}</th><th>{t('teacher.completed')}</th><th>{t('teacher.failedAttempts')}</th><th>{t('teacher.lastActivity')}</th></tr></thead>
            <tbody>{students.data.map((student) => <tr key={student.studentId} className="cq-border border-t"><td className="cq-heading p-3 font-bold">{content(student.name)}<p className="cq-muted-2 text-xs font-normal">{student.email}</p></td><td>{student.xp}</td><td>{student.level}</td><td>{student.completedExercises}</td><td>{student.failedAttempts}</td><td>{student.lastActivity ? new Date(student.lastActivity).toLocaleDateString() : t('common.noActivity')}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
      <Card>
        <h2 className="cq-heading text-xl font-black">{t('teacher.rankingPreview')}</h2>
        <div className="mt-3 grid gap-2">{ranking.data?.map((entry) => <div key={entry.studentId} className="cq-soft flex justify-between rounded-lg p-3"><span>#{entry.rank} {content(entry.name)}</span><Badge tone="green">{entry.xp} XP</Badge></div>)}</div>
      </Card>
    </div>
  )
}

export function ContentBuilderPage() {
  const { t } = usePreferences()
  const queryClient = useQueryClient()
  const tracks = useQuery({ queryKey: ['tracks'], queryFn: api.tracks })
  const firstTrack = tracks.data?.[0]
  const modules = useQuery({ queryKey: ['modules', firstTrack?.id], queryFn: () => api.modules(firstTrack!.id), enabled: !!firstTrack })
  const firstModule = modules.data?.[0]
  const [title, setTitle] = useState(t('teacher.defaultQuestTitle'))
  const [description, setDescription] = useState(t('teacher.defaultQuestDescription'))
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
        <h1 className="cq-heading text-2xl font-black">{t('teacher.exerciseCreator')}</h1>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          <Select value="CSharp" disabled><option>CSharp</option><option disabled>Java (future)</option><option disabled>JavaScript (future)</option><option disabled>Python (future)</option></Select>
          <Input type="number" value={xpReward} onChange={(event) => setXpReward(Number(event.target.value))} />
          <Textarea className="font-mono" value={starterCode} onChange={(event) => setStarterCode(event.target.value)} />
          <Button disabled={!firstModule || create.isPending}><ClipboardList size={18} /> {t('teacher.savePublish')}</Button>
        </form>
      </Card>
      <Card>
        <Badge tone="purple">{t('teacher.studentPreview')}</Badge>
        <h2 className="cq-heading mt-3 text-3xl font-black">{preview.title}</h2>
        <p className="cq-muted mt-2">{preview.description}</p>
        <Badge className="mt-4" tone="green">{preview.xpReward} XP</Badge>
        <pre className="cq-code mt-4 overflow-auto rounded-xl p-4 text-sm">{preview.starterCode}</pre>
        {create.isSuccess && <p className="mt-3 rounded-lg bg-[#35ff7a]/10 p-3 text-sm text-[#168044]">{t('teacher.createdSuccess')}</p>}
      </Card>
    </div>
  )
}

export function ReportsPage() {
  const { t, content } = usePreferences()
  const classes = useQuery({ queryKey: ['classes'], queryFn: api.classes })
  const activeClass = classes.data?.[0]
  const report = useQuery({ queryKey: ['report', activeClass?.id], queryFn: () => api.classReport(activeClass!.id), enabled: !!activeClass })
  if (!activeClass) return <EmptyState title={t('teacher.noClassSelected')} description={t('teacher.noClassText')} />
  return (
    <div className="space-y-5">
      <Card>
        <Badge tone="cyan">{t('teacher.reports')}</Badge>
        <h1 className="cq-heading mt-3 text-3xl font-black">{report.data?.className ?? activeClass.name}</h1>
      </Card>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label={t('teacher.students')} value={report.data?.studentCount ?? 0} />
        <StatCard label={t('teacher.submissions')} value={report.data?.submissionCount ?? 0} />
        <StatCard label={t('teacher.completions')} value={report.data?.completionCount ?? 0} />
        <StatCard label={t('teacher.atRisk')} value={report.data?.difficultStudents.length ?? 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="cq-heading text-xl font-black">{t('teacher.difficultExercises')}</h2><div className="mt-3 space-y-2">{report.data?.difficultExercises.map((item) => <div key={item} className="cq-soft rounded-lg p-3 text-sm">{content(item)}</div>)}</div></Card>
        <Card><h2 className="cq-heading text-xl font-black">{t('teacher.supportStudents')}</h2><div className="mt-3 space-y-2">{report.data?.difficultStudents.map((student) => <div key={student.studentId} className="cq-soft flex justify-between rounded-lg p-3 text-sm"><span>{content(student.name)}</span><Badge tone="yellow">{student.failedAttempts} {t('teacher.failedAttemptsBadge')}</Badge></div>)}</div></Card>
      </div>
    </div>
  )
}

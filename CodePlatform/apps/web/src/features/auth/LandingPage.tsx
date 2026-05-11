import { ArrowRight, BadgeCheck, BookOpen, Gamepad2, GraduationCap, TerminalSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Button, Card } from '../../components/ui/primitives'

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden text-white">
      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge tone="green">C# first • Unity-ready • teacher-centered</Badge>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-tight md:text-7xl">CodeQuest Academy</h1>
          <p className="mt-5 max-w-2xl text-xl text-[#b7c8c0]">Learn code by clearing quests. Teachers build missions, students solve C# challenges, and progress becomes visible through XP, badges, attempts, and reports.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login?role=Student"><Button>Enter as Student <ArrowRight size={18} /></Button></Link>
            <Link to="/login?role=Teacher"><Button variant="secondary">Enter as Teacher</Button></Link>
          </div>
        </div>

        <div className="relative">
          <Card className="border-[#35ff7a]/30 bg-[#101720]/95 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-[#83ffa8]">Current Quest</p>
                <h2 className="mt-2 text-2xl font-black">Calculate Damage</h2>
              </div>
              <Gamepad2 className="text-[#35ff7a]" size={34} />
            </div>
            <pre className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#05080c] p-4 text-sm text-[#d7ffe1]">{`public static int CalculateDamage(int attack, int defense)
{
    var damage = attack - defense;
    return damage < 0 ? 0 : damage;
}`}</pre>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <BadgeCheckCard label="4/4 Tests" />
              <BadgeCheckCard label="+30 XP" />
              <BadgeCheckCard label="First Code" />
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-12 md:grid-cols-4">
        {[
          ['Automatic correction', TerminalSquare, 'Visible and hidden tests prepare the judge flow.'],
          ['XP and badges', BadgeCheck, 'Levels, badges, and ranking support progression.'],
          ['Teacher dashboard', GraduationCap, 'Track attempts, stuck students, and difficult quests.'],
          ['C# and Unity path', BookOpen, 'Pure C# game logic now, Unity analysis later.'],
        ].map(([title, Icon, body]) => (
          <Card key={title as string}>
            <Icon className="text-[#35ff7a]" />
            <h3 className="mt-4 font-black">{title as string}</h3>
            <p className="mt-2 text-sm text-[#9fb2a8]">{body as string}</p>
          </Card>
        ))}
      </section>
    </main>
  )
}

function BadgeCheckCard({ label }: { label: string }) {
  return <div className="rounded-lg border border-[#35ff7a]/20 bg-[#35ff7a]/10 px-3 py-2 text-center text-sm font-black text-[#83ffa8]">{label}</div>
}

import { ArrowRight, BadgeCheck, BookOpen, Gamepad2, GraduationCap, TerminalSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PreferenceControls } from '../../components/preferences/PreferenceControls'
import { Badge, Button, Card } from '../../components/ui/primitives'
import { usePreferences } from '../../i18n/preferences'

export function LandingPage() {
  const { t } = usePreferences()
  const features = [
    ['landing.featureCorrection', TerminalSquare, 'landing.featureCorrectionText'],
    ['landing.featureXp', BadgeCheck, 'landing.featureXpText'],
    ['landing.featureTeacher', GraduationCap, 'landing.featureTeacherText'],
    ['landing.featureUnity', BookOpen, 'landing.featureUnityText'],
  ] as const

  return (
    <main className="cq-app min-h-screen overflow-hidden">
      <div className="absolute right-6 top-6 z-10">
        <PreferenceControls />
      </div>

      <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Badge tone="green">{t('landing.badge')}</Badge>
          <h1 className="cq-heading mt-6 max-w-4xl text-5xl font-black leading-tight md:text-7xl">CodeQuest Academy</h1>
          <p className="cq-muted mt-5 max-w-2xl text-xl">{t('landing.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/login?role=Student"><Button>{t('landing.studentCta')} <ArrowRight size={18} /></Button></Link>
            <Link to="/login?role=Teacher"><Button variant="secondary">{t('landing.teacherCta')}</Button></Link>
          </div>
        </div>

        <div className="relative">
          <Card className="border-[#35ff7a]/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-[#168044]">{t('landing.currentQuest')}</p>
                <h2 className="cq-heading mt-2 text-2xl font-black">{t('landing.calculateDamage')}</h2>
              </div>
              <Gamepad2 className="text-[#35ff7a]" size={34} />
            </div>
            <pre className="cq-code cq-border mt-6 overflow-hidden rounded-xl border p-4 text-sm">{`public static int CalculateDamage(int attack, int defense)
{
    var damage = attack - defense;
    return damage < 0 ? 0 : damage;
}`}</pre>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <BadgeCheckCard label={t('landing.tests')} />
              <BadgeCheckCard label="+30 XP" />
              <BadgeCheckCard label={t('landing.firstCode')} />
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-12 md:grid-cols-4">
        {features.map(([title, Icon, body]) => (
          <Card key={title}>
            <Icon className="text-[#35ff7a]" />
            <h3 className="cq-heading mt-4 font-black">{t(title)}</h3>
            <p className="cq-muted mt-2 text-sm">{t(body)}</p>
          </Card>
        ))}
      </section>
    </main>
  )
}

function BadgeCheckCard({ label }: { label: string }) {
  return <div className="rounded-lg border border-[#35ff7a]/20 bg-[#35ff7a]/10 px-3 py-2 text-center text-sm font-black text-[#168044]">{label}</div>
}

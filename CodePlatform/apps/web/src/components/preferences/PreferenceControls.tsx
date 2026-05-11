import { Languages, Moon, Sun } from 'lucide-react'
import { Button } from '../ui/primitives'
import { cn } from '../../utils/cn'
import { usePreferences, type ColorTheme, type Language } from '../../i18n/preferences'

const languages: { value: Language; label: string }[] = [
  { value: 'pt-BR', label: 'PT' },
  { value: 'en-US', label: 'EN' },
]

const themes: { value: ColorTheme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Dia', icon: Sun },
  { value: 'dark', label: 'Noite', icon: Moon },
]

export function PreferenceControls({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, theme, setTheme, t } = usePreferences()

  return (
    <div className={cn('flex flex-wrap items-center gap-2', compact && 'justify-end')}>
      <div className="cq-field inline-flex min-h-10 items-center gap-1 rounded-lg border px-1" aria-label={t('common.language')}>
        <Languages size={16} className="cq-muted ml-2" />
        {languages.map((item) => (
          <button
            key={item.value}
            type="button"
            className={cn(
              'min-h-8 rounded-md px-2 text-xs font-black transition',
              language === item.value ? 'bg-[#35ff7a] text-[#07110b]' : 'cq-muted hover:text-[var(--cq-heading)]',
            )}
            onClick={() => setLanguage(item.value)}
            aria-pressed={language === item.value}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="cq-field inline-flex min-h-10 items-center gap-1 rounded-lg border px-1" aria-label={t('common.theme')}>
        {themes.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.value}
              type="button"
              variant={theme === item.value ? 'primary' : 'ghost'}
              className="min-h-8 px-2"
              onClick={() => setTheme(item.value)}
              aria-pressed={theme === item.value}
              title={item.value === 'light' ? t('common.light') : t('common.dark')}
            >
              <Icon size={16} />
              {!compact && <span>{item.value === 'light' ? t('common.light') : t('common.dark')}</span>}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

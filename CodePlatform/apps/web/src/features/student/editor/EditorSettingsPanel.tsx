import { X } from 'lucide-react'
import { Button } from '../../../components/ui/primitives'
import { usePreferences } from '../../../i18n/preferences'
import type { EditorSettings } from '../../../types'
import { EDITOR_BACKGROUNDS, EDITOR_FONTS, EDITOR_THEMES } from './editorThemes'

interface Props {
  open: boolean
  onClose: () => void
  settings: EditorSettings
  onChange: (patch: Partial<EditorSettings>) => void
  onReset: () => void
}

export function EditorSettingsPanel({ open, onClose, settings, onChange, onReset }: Props) {
  const { t } = usePreferences()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex" role="dialog" aria-modal="true">
      <button aria-label="close" className="flex-1 bg-black/50" onClick={onClose} />
      <aside className="cq-card cq-border flex w-[360px] flex-col gap-4 overflow-y-auto border-l p-5">
        <header className="flex items-center justify-between">
          <h2 className="cq-heading text-lg font-black">{t('editor.settingsTitle')}</h2>
          <Button variant="ghost" onClick={onClose} aria-label={t('editor.close')}>
            <X size={16} />
          </Button>
        </header>

        <Section label={t('editor.font')}>
          <select
            className="cq-field min-h-10 w-full rounded-lg border px-3 text-sm"
            value={settings.fontFamily}
            onChange={(event) => onChange({ fontFamily: event.target.value as EditorSettings['fontFamily'] })}
          >
            {EDITOR_FONTS.map((font) => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </Section>

        <Section label={`${t('editor.fontSize')}: ${settings.fontSize}px`}>
          <input
            type="range"
            min={10}
            max={28}
            value={settings.fontSize}
            onChange={(event) => onChange({ fontSize: Number(event.target.value) })}
            className="w-full"
          />
        </Section>

        <Section label={t('editor.theme')}>
          <div className="grid grid-cols-2 gap-2">
            {EDITOR_THEMES.map((theme) => (
              <button
                key={theme.key}
                onClick={() => onChange({ theme: theme.key })}
                className={`cq-soft cq-border rounded-lg border px-3 py-2 text-left text-xs font-bold transition hover:border-[#35ff7a]/60 ${settings.theme === theme.key ? 'border-[#35ff7a] text-[#35ff7a]' : ''}`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label={t('editor.background')}>
          <div className="grid grid-cols-2 gap-2">
            {EDITOR_BACKGROUNDS.map((bg) => (
              <button
                key={bg.key}
                onClick={() => onChange({ backgroundStyle: bg.key })}
                className={`cq-soft cq-border rounded-lg border px-3 py-2 text-left text-xs font-bold transition hover:border-[#35ff7a]/60 ${settings.backgroundStyle === bg.key ? 'border-[#35ff7a] text-[#35ff7a]' : ''}`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </Section>

        <Section label={`${t('editor.tabSize')}: ${settings.tabSize}`}>
          <input
            type="range"
            min={2}
            max={8}
            step={2}
            value={settings.tabSize}
            onChange={(event) => onChange({ tabSize: Number(event.target.value) })}
            className="w-full"
          />
        </Section>

        <Toggle label={t('editor.minimap')} checked={settings.minimapEnabled} onChange={(value) => onChange({ minimapEnabled: value })} />
        <Toggle label={t('editor.wordWrap')} checked={settings.wordWrapEnabled} onChange={(value) => onChange({ wordWrapEnabled: value })} />
        <Toggle label={t('editor.lineNumbers')} checked={settings.lineNumbersEnabled} onChange={(value) => onChange({ lineNumbersEnabled: value })} />
        <Toggle label={t('editor.autoSuggestions')} checked={settings.autoSuggestionsEnabled} onChange={(value) => onChange({ autoSuggestionsEnabled: value })} />
        <Toggle label={t('editor.reduceAnimations')} checked={settings.reduceAnimations} onChange={(value) => onChange({ reduceAnimations: value })} />

        <Button variant="secondary" onClick={onReset}>{t('editor.reset')}</Button>
      </aside>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="cq-muted-2 text-xs font-bold uppercase tracking-wider">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-sm">
      <span className="cq-text">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full border transition ${checked ? 'border-[#35ff7a] bg-[#35ff7a]/40' : 'cq-border bg-[color-mix(in_srgb,var(--cq-muted)_15%,transparent)]'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${checked ? 'left-5' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

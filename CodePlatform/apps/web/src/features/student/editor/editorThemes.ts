import type { Monaco } from '@monaco-editor/react'
import type { EditorBackgroundKey, EditorThemeKey } from '../../../types'

export const EDITOR_THEMES: { key: EditorThemeKey; label: string }[] = [
  { key: 'codequest-dark', label: 'CodeQuest Dark' },
  { key: 'neon-dungeon', label: 'Neon Dungeon' },
  { key: 'cyber-academy', label: 'Cyber Academy' },
  { key: 'forest-terminal', label: 'Forest Terminal' },
  { key: 'classic-dark', label: 'Classic Dark' },
  { key: 'light-mode', label: 'Light Mode' },
]

export const EDITOR_BACKGROUNDS: { key: EditorBackgroundKey; label: string }[] = [
  { key: 'solid-dark', label: 'Solid Dark' },
  { key: 'subtle-grid', label: 'Subtle Grid' },
  { key: 'neon-gradient', label: 'Neon Gradient' },
  { key: 'pixel-stars', label: 'Pixel Stars' },
  { key: 'terminal-glow', label: 'Terminal Glow' },
  { key: 'low-contrast-focus', label: 'Low Contrast Focus' },
]

export const EDITOR_FONTS = [
  'JetBrains Mono',
  'Fira Code',
  'Cascadia Code',
  'Source Code Pro',
  'Consolas',
  'Default Mono',
] as const

// Each theme exposes a string ID that maps to a built-in or registered Monaco theme.
// Built-ins (vs/vs-dark/hc-black) require no defineTheme call.
const THEMES = {
  'codequest-dark': {
    base: 'vs-dark',
    inherit: true,
    background: '0E1320',
    foreground: 'D7F5E2',
    accent: '35FF7A',
    string: 'C5F45A',
    comment: '5C7A6A',
    number: 'B968FF',
    keyword: '35FF7A',
  },
  'neon-dungeon': {
    base: 'vs-dark',
    inherit: true,
    background: '120724',
    foreground: 'E9D8FF',
    accent: 'B968FF',
    string: '22D3EE',
    comment: '6B47A5',
    number: 'FF477E',
    keyword: 'B968FF',
  },
  'cyber-academy': {
    base: 'vs-dark',
    inherit: true,
    background: '07101B',
    foreground: 'E0F2FE',
    accent: '22D3EE',
    string: '34D399',
    comment: '4B6480',
    number: 'F472B6',
    keyword: '22D3EE',
  },
  'forest-terminal': {
    base: 'vs-dark',
    inherit: true,
    background: '0B1A12',
    foreground: 'D9F5C9',
    accent: '7BD389',
    string: 'F6CF80',
    comment: '4F705A',
    number: 'EF9A3E',
    keyword: '7BD389',
  },
  'classic-dark': {
    base: 'vs-dark',
    inherit: true,
    background: '1E1E1E',
    foreground: 'D4D4D4',
    accent: '569CD6',
    string: 'CE9178',
    comment: '6A9955',
    number: 'B5CEA8',
    keyword: '569CD6',
  },
  'light-mode': {
    base: 'vs',
    inherit: true,
    background: 'FFFFFF',
    foreground: '1B1F26',
    accent: '168044',
    string: 'A31515',
    comment: '6A737D',
    number: '0451A5',
    keyword: '0000FF',
  },
} as const

let registered = false

export function registerEditorThemes(monaco: Monaco) {
  if (registered) return
  for (const [name, palette] of Object.entries(THEMES)) {
    monaco.editor.defineTheme(name, {
      base: palette.base as 'vs' | 'vs-dark' | 'hc-black',
      inherit: palette.inherit,
      rules: [
        { token: '', foreground: palette.foreground, background: palette.background },
        { token: 'keyword', foreground: palette.keyword, fontStyle: 'bold' },
        { token: 'string', foreground: palette.string },
        { token: 'number', foreground: palette.number },
        { token: 'comment', foreground: palette.comment, fontStyle: 'italic' },
        { token: 'type.identifier', foreground: palette.accent },
        { token: 'identifier', foreground: palette.foreground },
      ],
      colors: {
        'editor.background': '#' + palette.background,
        'editor.foreground': '#' + palette.foreground,
        'editorLineNumber.foreground': '#' + palette.comment,
        'editorCursor.foreground': '#' + palette.accent,
        'editor.lineHighlightBackground': '#' + palette.background + 'D0',
        'editor.selectionBackground': '#' + palette.accent + '40',
        'editorIndentGuide.background1': '#' + palette.comment + '40',
      },
    })
  }
  registered = true
}

// Maps a background key to a CSS background applied to the editor wrapper element.
export function backgroundCss(key: EditorBackgroundKey, themeKey: EditorThemeKey): string {
  const dark = themeKey !== 'light-mode'
  switch (key) {
    case 'subtle-grid':
      return dark
        ? 'background-color:#0e1320; background-image: linear-gradient(rgba(53,255,122,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(53,255,122,0.06) 1px, transparent 1px); background-size: 24px 24px;'
        : 'background-color:#ffffff; background-image: linear-gradient(rgba(53,170,90,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(53,170,90,0.08) 1px, transparent 1px); background-size: 24px 24px;'
    case 'neon-gradient':
      return 'background: radial-gradient(circle at top left, rgba(53,255,122,0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(185,104,255,0.18), transparent 55%), #0a0f1a;'
    case 'pixel-stars':
      return 'background-color:#06070d; background-image: radial-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), radial-gradient(rgba(53,255,122,0.45) 1px, transparent 1px); background-size: 64px 64px, 96px 96px; background-position: 0 0, 32px 32px;'
    case 'terminal-glow':
      return 'background: linear-gradient(180deg, rgba(53,255,122,0.06), transparent 30%), #051a0e; box-shadow: inset 0 0 80px rgba(53,255,122,0.15);'
    case 'low-contrast-focus':
      return dark ? 'background-color:#0c0e12;' : 'background-color:#f5f5f4;'
    case 'solid-dark':
    default:
      return dark ? 'background-color:#080b0f;' : 'background-color:#ffffff;'
  }
}

export const DEFAULT_EDITOR_SETTINGS = {
  fontFamily: 'JetBrains Mono' as const,
  fontSize: 14,
  theme: 'codequest-dark' as const,
  backgroundStyle: 'solid-dark' as const,
  minimapEnabled: false,
  wordWrapEnabled: false,
  lineNumbersEnabled: true,
  autoSuggestionsEnabled: true,
  tabSize: 4,
  reduceAnimations: false,
}

export function fontStack(family: string): string {
  // Falls back to system mono so missing custom fonts still render. To bundle the real fonts later,
  // import the .woff2 files via @font-face in index.css — names already match common packages.
  const lookup: Record<string, string> = {
    'JetBrains Mono': '"JetBrains Mono", "JetBrainsMono Nerd Font", ui-monospace, Menlo, Consolas, monospace',
    'Fira Code': '"Fira Code", "FiraCode Nerd Font", ui-monospace, Menlo, Consolas, monospace',
    'Cascadia Code': '"Cascadia Code", "CascadiaCode Nerd Font", "Cascadia Mono", ui-monospace, Consolas, monospace',
    'Source Code Pro': '"Source Code Pro", ui-monospace, Menlo, Consolas, monospace',
    'Consolas': 'Consolas, "Courier New", ui-monospace, monospace',
    'Default Mono': 'ui-monospace, Menlo, Consolas, "Courier New", monospace',
  }
  return lookup[family] ?? lookup['Default Mono']
}

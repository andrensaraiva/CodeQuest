import { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { usePreferences } from '../../../i18n/preferences'
import type { EditorSettings, Exercise } from '../../../types'
import { backgroundCss, fontStack, registerEditorThemes } from './editorThemes'
import { parseExerciseSymbols, registerCSharpSnippets, type ExerciseAwareSymbols } from './csharpSnippets'
import type { IntegrityTracker } from './integrityTracker'

const MonacoEditor = lazy(() => import('@monaco-editor/react'))

interface Props {
  exercise: Exercise
  value: string
  onChange: (next: string) => void
  settings: EditorSettings
  integrity: IntegrityTracker
  height?: number
}

export function QuestEditor({ exercise, value, onChange, settings, integrity, height = 520 }: Props) {
  const { t } = usePreferences()
  const symbolsRef = useRef<ExerciseAwareSymbols>(parseExerciseSymbols(exercise.starterCode))

  // Re-parse when the student edits — picks up renamed locals etc.
  useEffect(() => {
    symbolsRef.current = parseExerciseSymbols(value || exercise.starterCode)
  }, [value, exercise.starterCode])

  const backgroundStyle = useMemo(() => backgroundCss(settings.backgroundStyle, settings.theme), [settings.backgroundStyle, settings.theme])
  const fontFamily = useMemo(() => fontStack(settings.fontFamily), [settings.fontFamily])

  return (
    <div
      className="cq-border overflow-hidden rounded-xl border"
      style={{ height }}
      data-reduce-animations={settings.reduceAnimations ? 'true' : 'false'}
    >
      <div
        ref={(node) => {
          // backgroundCss returns a multi-declaration CSS string (gradients, sizes, positions). Setting it
          // via setAttribute lets the browser parse it as raw CSS instead of forcing it through React's
          // object-style API one rule at a time.
          if (node) node.setAttribute('style', `height:100%; width:100%; ${backgroundStyle}`)
        }}
      >
        <Suspense fallback={<div className="cq-muted flex h-full items-center justify-center text-sm">{t('student.questEditor')}…</div>}>
          <MonacoEditor
              defaultLanguage="csharp"
              language="csharp"
              value={value}
              theme={settings.theme}
              beforeMount={(monaco) => {
                registerEditorThemes(monaco)
              }}
              onMount={(_editor, monaco) => {
                const dispose = registerCSharpSnippets(monaco, () => symbolsRef.current)
                _editor.onKeyDown(() => integrity.recordKeystroke())
                _editor.onDidPaste((event) => {
                  // Monaco's paste event gives a range — read the model text within it to size the paste.
                  const text = _editor.getModel()?.getValueInRange(event.range) ?? ''
                  integrity.recordPaste(text)
                })
                _editor.onDidChangeModelContent(() => integrity.recordEdit())
                return dispose
              }}
              onChange={(next) => onChange(next ?? '')}
              options={{
                minimap: { enabled: settings.minimapEnabled },
                fontSize: settings.fontSize,
                fontFamily,
                lineNumbers: settings.lineNumbersEnabled ? 'on' : 'off',
                wordWrap: settings.wordWrapEnabled ? 'on' : 'off',
                tabSize: settings.tabSize,
                insertSpaces: true,
                detectIndentation: false,
                quickSuggestions: settings.autoSuggestionsEnabled
                  ? { other: true, comments: false, strings: false }
                  : false,
                suggestOnTriggerCharacters: settings.autoSuggestionsEnabled,
                cursorBlinking: settings.reduceAnimations ? 'solid' : 'smooth',
                cursorSmoothCaretAnimation: settings.reduceAnimations ? 'off' : 'on',
                smoothScrolling: !settings.reduceAnimations,
                padding: { top: 16 },
                automaticLayout: true,
            }}
          />
        </Suspense>
      </div>
    </div>
  )
}

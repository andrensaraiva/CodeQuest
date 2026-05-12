# Editor Experience

CodeQuest Academy uses Monaco Editor for all student coding. This page documents the customization layer added in Phase 1 of the May 2026 update.

## Settings Panel

Open the panel from the gear icon in the exercise top bar or in the editor toolbar. Settings persist per user.

| Setting | Allowed values | Default |
| --- | --- | --- |
| `fontFamily` | JetBrains Mono, Fira Code, Cascadia Code, Source Code Pro, Consolas, Default Mono | JetBrains Mono |
| `fontSize` | 10–28 px | 14 |
| `theme` | codequest-dark, neon-dungeon, cyber-academy, forest-terminal, classic-dark, light-mode | codequest-dark |
| `backgroundStyle` | solid-dark, subtle-grid, neon-gradient, pixel-stars, terminal-glow, low-contrast-focus | solid-dark |
| `minimapEnabled` | bool | false |
| `wordWrapEnabled` | bool | false |
| `lineNumbersEnabled` | bool | true |
| `autoSuggestionsEnabled` | bool | true |
| `tabSize` | 2–8 | 4 |
| `reduceAnimations` | bool | false |

## Backend

- Entity: `StudentEditorSettings` (one row per user, unique `UserId` index).
- Service: `IEditorSettingsService` returns defaults when no row exists yet, so first-time visitors never see an error.
- Endpoints:
  - `GET /me/editor-settings` — current user settings (falls back to defaults).
  - `PUT /me/editor-settings` — upsert, validated by `EditorSettingsValidator`.

## Frontend

The student exercise page uses `useEditorSettings()`. The hook:

- Reads `localStorage` as the initial value so the first paint shows the student's choices without flicker.
- Hydrates from `GET /me/editor-settings` once authenticated.
- Optimistically updates on every change and writes back to the server; on failure it rolls back.

Monaco wiring lives in `features/student/editor/`:

- `QuestEditor.tsx` — lazy-loaded Monaco with `beforeMount` registering custom themes and `onMount` wiring the C# completion provider and integrity tracker.
- `editorThemes.ts` — `registerEditorThemes` and palette definitions for the six themes; backgrounds are applied as raw CSS on the wrapper so multi-rule values (gradients, sizes, positions) parse correctly.
- `csharpSnippets.ts` — completion provider with the Level 1 language snippets (`if`, `for`, `Console.WriteLine`, etc.) and Level 2 exercise-aware completions (method names, parameters, return types parsed from the starter code).

## Autocomplete

Three levels per the product brief:

1. **Language snippets** — fixed list in `LANGUAGE_SNIPPETS`. Each item has placeholder fields (`${1:condition}`) so beginners can fill values without breaking syntax.
2. **Exercise-aware** — `parseExerciseSymbols(starterCode)` extracts method names, parameter names, and return types via a regex. The provider re-parses on each keystroke so renamed locals show up. Symbols are surfaced as `Function`, `Variable`, and `TypeParameter` completion kinds.
3. **Safe educational** — by design, no AI autocomplete and no full-solution snippets. Snippets only help with syntax.

## Format Code

`formatCSharpBasic(code, tabSize)` re-indents on braces using the configured tab size. It does not parse the AST, so unusual layouts (one-line statements with mixed braces, etc.) may not be reformatted. A future iteration can call a server-side `dotnet-format` or `csharpier` worker.

## Adding Custom Fonts

No font files are bundled. The font dropdown picks system fonts plus common developer fonts. To actually serve JetBrains Mono / Fira Code / Cascadia Code:

1. Drop the `.woff2` files into `apps/web/public/fonts/`.
2. Add `@font-face` rules in `apps/web/src/index.css` matching the names in `fontStack()` (e.g. `"JetBrains Mono"`).
3. No code change required — `QuestEditor` already passes `fontFamily` to Monaco.

Keep the system fallbacks in the stack so installs without the file still render.

## Integrity Tracker (forward reference)

`integrityTracker.ts` collects paste/keystroke/timing metadata locally during an attempt. Phase 4 will send the snapshot on `/code/run` and `/code/submit`. In Phase 1 the data stays in memory and is never persisted.

## Limitations

- The "Format Code" pass is a brace re-indent, not a real formatter.
- Themes are tuned for contrast on dark backgrounds; `light-mode` plus `pixel-stars` is intentionally not great — the panel allows it but `low-contrast-focus` is the recommended pairing for accessibility.
- Settings sync is per user, not per device. A student who changes themes on one device will see the new theme on another after the next login (since `localStorage` is overwritten by the server response).

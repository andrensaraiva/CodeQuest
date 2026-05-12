import type { Monaco } from '@monaco-editor/react'

// Level 1: language snippets that help a beginner with syntax — never the full solution.
const LANGUAGE_SNIPPETS: { label: string; insertText: string; detail: string }[] = [
  { label: 'if', insertText: 'if (${1:condition})\n{\n\t$0\n}', detail: 'if statement' },
  { label: 'ifelse', insertText: 'if (${1:condition})\n{\n\t$2\n}\nelse\n{\n\t$0\n}', detail: 'if / else block' },
  { label: 'for', insertText: 'for (int ${1:i} = 0; $1 < ${2:length}; $1++)\n{\n\t$0\n}', detail: 'counted for loop' },
  { label: 'foreach', insertText: 'foreach (var ${1:item} in ${2:collection})\n{\n\t$0\n}', detail: 'foreach loop' },
  { label: 'while', insertText: 'while (${1:condition})\n{\n\t$0\n}', detail: 'while loop' },
  { label: 'method', insertText: 'public static ${1:int} ${2:Method}(${3:int value})\n{\n\t$0\n\treturn ${4:0};\n}', detail: 'static method' },
  { label: 'boolmethod', insertText: 'public static bool ${1:IsValid}(${2:int value})\n{\n\t$0\n\treturn ${3:true};\n}', detail: 'bool returning method' },
  { label: 'intmethod', insertText: 'public static int ${1:Calculate}(${2:int value})\n{\n\t$0\n\treturn ${3:0};\n}', detail: 'int returning method' },
  { label: 'voidmethod', insertText: 'public static void ${1:Run}(${2:int value})\n{\n\t$0\n}', detail: 'void method' },
  { label: 'class', insertText: 'public class ${1:Program}\n{\n\t$0\n}', detail: 'class skeleton' },
  { label: 'return', insertText: 'return ${1:value};', detail: 'return statement' },
  { label: 'cw', insertText: 'Console.WriteLine(${1:value});', detail: 'Console.WriteLine' },
  { label: 'list', insertText: 'var ${1:items} = new List<${2:int}>();', detail: 'List<T>' },
  { label: 'array', insertText: 'var ${1:items} = new ${2:int}[${3:length}];', detail: 'fixed-size array' },
  { label: 'mathmax', insertText: 'Math.Max(${1:a}, ${2:b})', detail: 'Math.Max(a, b)' },
  { label: 'mathmin', insertText: 'Math.Min(${1:a}, ${2:b})', detail: 'Math.Min(a, b)' },
]

// Level 2: parse the starter code to surface method names, parameters, and return types so the student
// gets exercise-aware completions without seeing a generated solution.
export interface ExerciseAwareSymbols {
  methodNames: string[]
  parameterNames: string[]
  returnTypes: string[]
}

const SIGNATURE_REGEX = /\b(?:public|private|protected|internal)?\s*(?:static\s+)?([A-Za-z_][\w<>,?\s]*?)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/g

export function parseExerciseSymbols(starterCode: string): ExerciseAwareSymbols {
  const methodNames = new Set<string>()
  const parameterNames = new Set<string>()
  const returnTypes = new Set<string>()
  for (const match of starterCode.matchAll(SIGNATURE_REGEX)) {
    const returnType = match[1]?.trim()
    const name = match[2]?.trim()
    const params = match[3]?.trim() ?? ''
    if (!name || name === 'class') continue
    methodNames.add(name)
    if (returnType) returnTypes.add(returnType)
    for (const param of params.split(',')) {
      const cleaned = param.trim().split(/\s+/).pop()
      if (cleaned) parameterNames.add(cleaned)
    }
  }
  return {
    methodNames: [...methodNames],
    parameterNames: [...parameterNames],
    returnTypes: [...returnTypes],
  }
}

export function registerCSharpSnippets(monaco: Monaco, getSymbols: () => ExerciseAwareSymbols): () => void {
  const provider = monaco.languages.registerCompletionItemProvider('csharp', {
    triggerCharacters: ['.', ' ', '(', '\n'],
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      const suggestions = [
        ...LANGUAGE_SNIPPETS.map((snippet) => ({
          label: snippet.label,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet.insertText,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: `CodeQuest • ${snippet.detail}`,
          range,
        })),
      ]

      const symbols = getSymbols()
      for (const name of symbols.methodNames) {
        suggestions.push({
          label: name,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: name,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.None,
          detail: 'Method declared in this exercise',
          range,
        })
      }
      for (const name of symbols.parameterNames) {
        suggestions.push({
          label: name,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: name,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.None,
          detail: 'Parameter from this exercise',
          range,
        })
      }
      for (const t of symbols.returnTypes) {
        suggestions.push({
          label: t,
          kind: monaco.languages.CompletionItemKind.TypeParameter,
          insertText: t,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.None,
          detail: 'Return type from this exercise',
          range,
        })
      }

      return { suggestions }
    },
  })

  return () => provider.dispose()
}

// Tiny "format" pass: re-indent braces with the configured tab size. Not a full formatter — documented
// in EDITOR_EXPERIENCE.md as MVP. Does not parse the code, so unusual brace layouts may be left alone.
export function formatCSharpBasic(code: string, tabSize: number): string {
  const indent = ' '.repeat(tabSize)
  const lines = code.replace(/\r\n/g, '\n').split('\n')
  let depth = 0
  const out: string[] = []
  for (const raw of lines) {
    const trimmed = raw.trim()
    if (trimmed.startsWith('}')) depth = Math.max(0, depth - 1)
    out.push(trimmed.length === 0 ? '' : indent.repeat(depth) + trimmed)
    const opens = (trimmed.match(/{/g) ?? []).length
    const closes = (trimmed.match(/}/g) ?? []).length
    depth = Math.max(0, depth + opens - closes)
  }
  return out.join('\n')
}

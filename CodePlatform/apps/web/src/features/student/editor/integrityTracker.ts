// Collects keystroke/paste metadata for an exercise attempt. Data stays client-side in Phase 1; Phase 4
// will transmit it on /code/run and /code/submit. Keep this module side-effect free: it never blocks the
// student, never touches localStorage, and never sends data on its own.

export interface IntegrityMetadata {
  pasteEventsCount: number
  totalPastedCharacters: number
  largestPasteLength: number
  keystrokeCount: number
  editEventsCount: number
  timeOnExerciseSeconds: number
  timeToFirstRunSeconds: number | null
  timeToFirstSubmitSeconds: number | null
  finalCodeLength: number
  starterCodeLength: number
  percentCodePastedEstimate: number
}

export class IntegrityTracker {
  private readonly startedAt = performance.now()
  private firstRunAt: number | null = null
  private firstSubmitAt: number | null = null
  private pasteEventsCount = 0
  private totalPastedCharacters = 0
  private largestPasteLength = 0
  private keystrokeCount = 0
  private editEventsCount = 0
  private starterCodeLength = 0

  constructor(starterCode: string) {
    this.starterCodeLength = starterCode.length
  }

  recordKeystroke() {
    this.keystrokeCount += 1
  }

  recordEdit() {
    this.editEventsCount += 1
  }

  recordPaste(text: string) {
    this.pasteEventsCount += 1
    this.totalPastedCharacters += text.length
    if (text.length > this.largestPasteLength) {
      this.largestPasteLength = text.length
    }
  }

  recordRun() {
    this.firstRunAt ??= performance.now()
  }

  recordSubmit() {
    this.firstSubmitAt ??= performance.now()
  }

  snapshot(currentCode: string): IntegrityMetadata {
    const now = performance.now()
    const timeOnExerciseSeconds = Math.round((now - this.startedAt) / 1000)
    const codeLength = Math.max(1, currentCode.length)
    const percentCodePastedEstimate = Math.min(100, Math.round((this.totalPastedCharacters / codeLength) * 100))

    return {
      pasteEventsCount: this.pasteEventsCount,
      totalPastedCharacters: this.totalPastedCharacters,
      largestPasteLength: this.largestPasteLength,
      keystrokeCount: this.keystrokeCount,
      editEventsCount: this.editEventsCount,
      timeOnExerciseSeconds,
      timeToFirstRunSeconds: this.firstRunAt === null ? null : Math.round((this.firstRunAt - this.startedAt) / 1000),
      timeToFirstSubmitSeconds: this.firstSubmitAt === null ? null : Math.round((this.firstSubmitAt - this.startedAt) / 1000),
      finalCodeLength: currentCode.length,
      starterCodeLength: this.starterCodeLength,
      percentCodePastedEstimate,
    }
  }
}

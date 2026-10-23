// Tipp-Engine: reine Funktionen, unabhängig von React.

export type ErrorCorrection =
  /** Falsche Taste: Cursor bleibt stehen, bis das richtige Zeichen kommt (Training). */
  | 'forced'
  /** Falsche Taste: Cursor läuft weiter, Korrektur per Backspace möglich (Tipp-Test). */
  | 'free'

/** Tastenprotokoll: [Zeichen, KeyboardEvent.code, ms seit letzter Taste] */
export type KeyEvent = [key: string, code: string, ms: number]

export interface TypingState {
  text: string
  mode: ErrorCorrection
  /** Index des nächsten zu tippenden Zeichens */
  pos: number
  /** Getipptes Zeichen je Position */
  input: string[]
  /** Positionen, an denen mindestens ein Fehler passiert ist */
  errors: Set<number>
  keystrokes: number
  correctKeystrokes: number
  events: KeyEvent[]
  startedAt: number | null
  lastAt: number | null
  finished: boolean
}

export function createTypingState(text: string, mode: ErrorCorrection): TypingState {
  return {
    text,
    mode,
    pos: 0,
    input: [],
    errors: new Set(),
    keystrokes: 0,
    correctKeystrokes: 0,
    events: [],
    startedAt: null,
    lastAt: null,
    finished: text.length === 0,
  }
}

export function pressKey(s: TypingState, key: string, code: string, now: number): TypingState {
  if (s.finished) return s
  const ms = s.lastAt === null ? 0 : Math.round(now - s.lastAt)
  const base = {
    ...s,
    events: [...s.events, [key, code, ms] as KeyEvent],
    startedAt: s.startedAt ?? now,
    lastAt: now,
  }

  if (key === 'Backspace') {
    if (s.mode === 'forced' || s.pos === 0) return base
    return { ...base, pos: s.pos - 1, input: s.input.slice(0, s.pos - 1) }
  }

  const expected = s.text[s.pos]
  const correct = key === expected
  const next: TypingState = {
    ...base,
    keystrokes: s.keystrokes + 1,
    correctKeystrokes: s.correctKeystrokes + (correct ? 1 : 0),
  }

  if (!correct) {
    next.errors = new Set(s.errors).add(s.pos)
    if (s.mode === 'forced') return next
  }

  const input = [...s.input]
  input[s.pos] = key
  next.input = input
  next.pos = s.pos + 1
  next.finished = next.pos >= s.text.length
  return next
}

export interface TypingStats {
  elapsedMs: number
  correctChars: number
  /** Zeichen pro Minute (richtig getippt) */
  cpm: number
  /** Wörter pro Minute (1 Wort = 5 Zeichen) */
  wpm: number
  /** Anteil richtiger Anschläge, 0–1 */
  accuracy: number
  /** Punkte: WPM × 100 */
  score: number
}

export function computeStats(s: TypingState, now: number = s.lastAt ?? 0): TypingStats {
  const elapsedMs = s.startedAt === null ? 0 : Math.max(0, now - s.startedAt)
  let correctChars = 0
  for (let i = 0; i < s.pos; i++) if (s.input[i] === s.text[i]) correctChars++
  const minutes = elapsedMs / 60000
  const cpm = minutes > 0 ? correctChars / minutes : 0
  const wpm = cpm / 5
  const accuracy = s.keystrokes > 0 ? s.correctKeystrokes / s.keystrokes : 1
  return { elapsedMs, correctChars, cpm, wpm, accuracy, score: Math.round(wpm * 100) }
}

/** Spielt ein Tastenprotokoll erneut ab – so rechnet der Server Ergebnisse selbst nach. */
export function replay(text: string, mode: ErrorCorrection, events: KeyEvent[]): TypingState {
  let s = createTypingState(text, mode)
  let now = 0
  for (const [key, code, ms] of events) {
    now += ms
    s = pressKey(s, key, code, now)
  }
  return s
}

/** Anzahl Fehler, die anschließend korrigiert wurden („Fehler verbessert“). */
export function countFixed(s: TypingState): number {
  let fixed = 0
  for (const i of s.errors) if (i < s.pos && s.input[i] === s.text[i]) fixed++
  return fixed
}

export interface UnitSample {
  hits: number
  misses: number
  /** Mittlere Zeit bis zum Anschlag dieses Zeichens (ms), ohne ersten Anschlag */
  iki: number
}

/** Auswertung je Zeichen – Grundlage für das adaptive Training. */
export function computeUnitSamples(s: TypingState): Map<string, UnitSample> {
  const acc = new Map<string, { hits: number; misses: number; ikiSum: number; ikiN: number }>()
  let pos = 0
  for (const [key, , ms] of s.events) {
    if (key === 'Backspace') {
      if (s.mode === 'free' && pos > 0) pos--
      continue
    }
    const expected = s.text[pos]
    if (expected === undefined) break
    const entry = acc.get(expected) ?? { hits: 0, misses: 0, ikiSum: 0, ikiN: 0 }
    if (key === expected) {
      entry.hits++
      if (ms > 0) {
        entry.ikiSum += ms
        entry.ikiN++
      }
      pos++
    } else {
      entry.misses++
      if (s.mode === 'free') pos++
    }
    acc.set(expected, entry)
  }
  const result = new Map<string, UnitSample>()
  for (const [char, e] of acc) {
    result.set(char, { hits: e.hits, misses: e.misses, iki: e.ikiN ? e.ikiSum / e.ikiN : 0 })
  }
  return result
}

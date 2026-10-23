import type { KeyEvent } from './typing'

export interface SpeedPoint {
  /** Sekunde seit Start (Ende des Abschnitts) */
  second: number
  wpm: number
}

/** Tempoverlauf: richtige Anschläge je Zeitabschnitt, umgerechnet in WPM. */
export function speedSeries(text: string, events: KeyEvent[], bucketSeconds = 5): SpeedPoint[] {
  const buckets: number[] = []
  let now = 0
  let pos = 0
  for (const [key, , ms] of events) {
    now += ms
    if (key === 'Backspace') {
      if (pos > 0) pos--
      continue
    }
    const bucket = Math.floor(now / 1000 / bucketSeconds)
    buckets[bucket] ??= 0
    if (key === text[pos]) buckets[bucket]++
    pos++
  }
  return Array.from(buckets, (chars = 0, i) => ({
    second: (i + 1) * bucketSeconds,
    wpm: (chars / 5) * (60 / bucketSeconds),
  }))
}

export function formatPercent(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits).replace('.', ',')} %`
}

export function formatNumber(value: number, digits = 0): string {
  return value.toFixed(digits).replace('.', ',')
}

const dateFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short' })

export function formatDate(ms: number): string {
  return dateFormat.format(ms)
}

import type { SpeedPoint } from '@/lib/stats'

interface Props {
  points: SpeedPoint[]
  /** Gesamtdurchschnitt als gestrichelte Linie */
  average: number
}

const WIDTH = 640
const HEIGHT = 200
const PAD = { top: 12, right: 12, bottom: 28, left: 40 }

/** Tempoverlauf als einfaches Liniendiagramm (WPM je Abschnitt). */
export function SpeedChart({ points, average }: Props) {
  if (points.length < 2) return <p className="text-sm text-muted-foreground">Zu wenige Daten für einen Verlauf.</p>

  const maxWpm = Math.max(average, ...points.map((p) => p.wpm))
  const yMax = Math.max(20, Math.ceil(maxWpm / 20) * 20)
  const xMax = points[points.length - 1].second
  const w = WIDTH - PAD.left - PAD.right
  const h = HEIGHT - PAD.top - PAD.bottom
  const x = (s: number) => PAD.left + (s / xMax) * w
  const y = (wpm: number) => PAD.top + h - (wpm / yMax) * h
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.second).toFixed(1)},${y(p.wpm).toFixed(1)}`).join(' ')
  const area = `${line} L${x(xMax)},${y(0)} L${x(points[0].second)},${y(0)} Z`
  const yTicks = [0, yMax / 2, yMax]

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Tempoverlauf in Wörtern pro Minute">
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" />
          <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[11px]">
            {t}
          </text>
        </g>
      ))}
      {points.map((p) => (
        <text
          key={p.second}
          x={x(p.second)}
          y={HEIGHT - 8}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px]"
        >
          {p.second % 10 === 0 ? `${p.second}s` : ''}
        </text>
      ))}
      <path d={area} className="fill-primary/10" />
      <path d={line} className="fill-none stroke-primary" strokeWidth={2.5} strokeLinejoin="round" />
      <line
        x1={PAD.left}
        x2={WIDTH - PAD.right}
        y1={y(average)}
        y2={y(average)}
        className="stroke-muted-foreground"
        strokeDasharray="4 4"
      />
    </svg>
  )
}

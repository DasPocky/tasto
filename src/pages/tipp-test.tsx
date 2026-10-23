import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Keyboard } from '@/components/keyboard'
import { TypingText } from '@/components/typing-text'
import { useTyping } from '@/hooks/use-typing'
import { computeStats } from '@/lib/typing'
import { PseudoWordGenerator, createRng } from '@/lib/words'

const DURATION_MS = 60_000
const generator = new PseudoWordGenerator()

export function TippTestPage() {
  const [seed, setSeed] = useState(() => Date.now())
  const text = useMemo(() => generator.text(250, createRng(seed)), [seed])
  const [pressed, setPressed] = useState<string | null>(null)
  const [now, setNow] = useState(() => performance.now())
  const [timeUp, setTimeUp] = useState(false)
  const pressTimer = useRef<number>(undefined)

  const onKey = useCallback((code: string) => {
    setPressed(code)
    window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setPressed(null), 120)
  }, [])

  const { state } = useTyping(text, 'free', { enabled: !timeUp, onKey })

  // Countdown ab dem ersten Tastendruck
  useEffect(() => {
    if (state.startedAt === null || timeUp) return
    const id = window.setInterval(() => {
      const t = performance.now()
      setNow(t)
      if (t - state.startedAt! >= DURATION_MS) setTimeUp(true)
    }, 100)
    return () => window.clearInterval(id)
  }, [state.startedAt, timeUp])

  const restart = () => {
    setTimeUp(false)
    setSeed(Date.now())
  }

  const end = state.startedAt === null ? now : Math.min(now, state.startedAt + DURATION_MS)
  const stats = computeStats(state, end)
  const remaining = Math.ceil((DURATION_MS - stats.elapsedMs) / 1000)

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Wie schnell tippst du?</h1>
          <p className="text-neutral-500">1 Minute, computergenerierte Wörter. Der Test startet mit dem ersten Tastendruck.</p>
        </div>
        <div className="flex gap-6 font-mono text-neutral-700">
          <Stat label="Zeit" value={`${state.startedAt === null ? 60 : Math.max(0, remaining)}s`} />
          <Stat label="WPM" value={stats.wpm.toFixed(0)} />
          <Stat label="Genauigkeit" value={`${(stats.accuracy * 100).toFixed(0)}%`} />
        </div>
      </header>

      {timeUp ? (
        <section className="flex flex-col items-center gap-6 rounded-2xl border border-neutral-200 bg-white p-8 text-center">
          <h2 className="text-2xl font-semibold">Dein Ergebnis</h2>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Stat big label="WPM" value={stats.wpm.toFixed(1)} />
            <Stat big label="Anschläge/min" value={stats.cpm.toFixed(0)} />
            <Stat big label="Genauigkeit" value={`${(stats.accuracy * 100).toFixed(1)}%`} />
            <Stat big label="Punkte" value={String(stats.score)} />
          </div>
          <button
            onClick={restart}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700"
          >
            Neuer Test
          </button>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <TypingText state={state} />
          </section>
          <Keyboard nextChar={state.text[state.pos]} pressedCode={pressed} />
        </>
      )}
    </main>
  )
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={big ? 'text-4xl font-bold text-neutral-900' : 'text-xl font-semibold'}>{value}</span>
      <span className="text-xs tracking-wide text-neutral-500 uppercase">{label}</span>
    </div>
  )
}

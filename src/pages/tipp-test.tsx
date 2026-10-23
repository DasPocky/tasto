import { Loader2, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Keyboard } from '@/components/keyboard'
import { TypingText } from '@/components/typing-text'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTyping } from '@/hooks/use-typing'
import { api } from '@/lib/api'
import { formatNumber, formatPercent } from '@/lib/stats'
import { computeStats } from '@/lib/typing'
import { PseudoWordGenerator, createRng } from '@/lib/words'

const DURATION_MS = 60_000

interface Test {
  /** null = ohne Server (offline), Ergebnis wird nicht gespeichert */
  id: string | null
  text: string
}

export function TippTestPage() {
  const navigate = useNavigate()
  const [test, setTest] = useState<Test | null>(null)
  const [round, setRound] = useState(0)
  const [pressed, setPressed] = useState<string | null>(null)
  const [now, setNow] = useState(() => performance.now())
  const [timeUp, setTimeUp] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const pressTimer = useRef<number>(undefined)
  const submitted = useRef(false)

  // Neuen Test vom Server holen; ohne Server lokal einen Text erzeugen
  useEffect(() => {
    let cancelled = false
    setTest(null)
    setTimeUp(false)
    setSaveError(null)
    submitted.current = false
    api
      .createTest()
      .then((t) => !cancelled && setTest({ id: t.id, text: t.text }))
      .catch(() => !cancelled && setTest({ id: null, text: new PseudoWordGenerator().text(250, createRng()) }))
    return () => {
      cancelled = true
    }
  }, [round])

  const onKey = useCallback((code: string) => {
    setPressed(code)
    window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setPressed(null), 120)
  }, [])

  const { state } = useTyping(test?.text ?? '', 'free', { enabled: test !== null && !timeUp, onKey })

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

  // Nach Ablauf speichern und zur Ergebnisseite wechseln
  useEffect(() => {
    if (!timeUp || !test?.id || state.events.length === 0 || submitted.current) return
    submitted.current = true
    api
      .submitPerformance(test.id, state.events)
      .then(({ id }) => navigate(`/ergebnis/${id}`))
      .catch((err: Error) => setSaveError(err.message))
  }, [timeUp, test?.id, state.events, navigate])

  const restart = () => {
    // Fokus vom Button nehmen, sonst löst die Leertaste ihn erneut aus
    ;(document.activeElement as HTMLElement | null)?.blur()
    setRound((r) => r + 1)
  }

  const end = state.startedAt === null ? now : Math.min(now, state.startedAt + DURATION_MS)
  const stats = computeStats(state, end)
  const remaining = state.startedAt === null ? 60 : Math.max(0, Math.ceil((DURATION_MS - stats.elapsedMs) / 1000))
  const showLocalResult = timeUp && (test?.id === null || saveError !== null)

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wie schnell tippst du?</h1>
          <p className="text-muted-foreground">
            1 Minute, computergenerierte Wörter. Der Test startet mit dem ersten Tastendruck.
          </p>
        </div>
        <div className="flex gap-6 font-mono">
          <Stat label="Zeit" value={`${remaining}s`} />
          <Stat label="WPM" value={formatNumber(stats.wpm)} />
          <Stat label="Genauigkeit" value={formatPercent(stats.accuracy)} />
        </div>
      </header>

      {showLocalResult ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-6 text-center">
            <h2 className="text-2xl font-semibold">Dein Ergebnis</h2>
            {saveError && (
              <p className="text-sm text-destructive">Ergebnis konnte nicht gespeichert werden: {saveError}</p>
            )}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              <Stat big label="WPM" value={formatNumber(stats.wpm, 1)} />
              <Stat big label="Anschläge/min" value={formatNumber(stats.cpm)} />
              <Stat big label="Genauigkeit" value={formatPercent(stats.accuracy, 1)} />
              <Stat big label="Punkte" value={String(stats.score)} />
            </div>
            <Button onClick={restart}>
              <RotateCcw /> Neuer Test
            </Button>
          </CardContent>
        </Card>
      ) : timeUp ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="animate-spin" /> Ergebnis wird ausgewertet …
        </div>
      ) : (
        <>
          <Card>
            <CardContent>
              {test ? (
                <TypingText state={state} />
              ) : (
                <div className="flex h-[8.1rem] items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="animate-spin" /> Test wird vorbereitet …
                </div>
              )}
            </CardContent>
          </Card>
          <Keyboard nextChar={state.text[state.pos]} pressedCode={pressed} />
          {state.startedAt !== null && (
            <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={restart}>
                <RotateCcw /> Neu starten
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  )
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={big ? 'text-4xl font-bold' : 'text-xl font-semibold'}>{value}</span>
      <span className="text-xs tracking-wide text-muted-foreground uppercase">{label}</span>
    </div>
  )
}

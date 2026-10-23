import { Loader2, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Keyboard } from '@/components/keyboard'
import { Page, PageHeader, Stat, StatRow } from '@/components/page'
import { TypingText } from '@/components/typing-text'
import { Button } from '@/components/ui/button'
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
    <Page className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Tipp-Test · 60 Sekunden"
        title="Wie schnell tippst du?"
        description="Computergenerierte Wörter. Der Test startet mit dem ersten Tastendruck."
      />

      {showLocalResult ? (
        <section className="flex flex-col gap-6">
          {saveError && (
            <p className="text-sm text-destructive">Ergebnis konnte nicht gespeichert werden: {saveError}</p>
          )}
          <StatRow>
            <Stat label="Punkte" value={stats.score.toLocaleString('de-DE')} />
            <Stat label="WPM" value={formatNumber(stats.wpm, 1)} />
            <Stat label="Anschläge/min" value={formatNumber(stats.cpm)} />
            <Stat label="Genauigkeit" value={formatPercent(stats.accuracy, 1)} />
          </StatRow>
          <div>
            <Button onClick={restart}>
              <RotateCcw /> Neuer Test
            </Button>
          </div>
        </section>
      ) : timeUp ? (
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="animate-spin" /> Ergebnis wird ausgewertet …
        </div>
      ) : (
        <section className="flex flex-col gap-8">
          <StatRow>
            <Stat size="sm" label="Zeit" value={`${remaining} s`} />
            <Stat size="sm" label="WPM" value={formatNumber(stats.wpm)} />
            <Stat size="sm" label="Genauigkeit" value={formatPercent(stats.accuracy)} />
            <div className="flex items-center justify-end px-4 sm:px-6">
              {state.startedAt !== null && (
                <Button variant="ghost" size="sm" onClick={restart}>
                  <RotateCcw /> Neu starten
                </Button>
              )}
            </div>
          </StatRow>
          {test ? (
            <TypingText state={state} />
          ) : (
            <div className="flex h-[8.65rem] items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" /> Test wird vorbereitet …
            </div>
          )}
          <Keyboard nextChar={state.text[state.pos]} pressedCode={pressed} />
        </section>
      )}
    </Page>
  )
}

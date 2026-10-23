import { Loader2, RotateCcw, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { SpeedChart } from '@/components/speed-chart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { api } from '@/lib/api'
import type { PerformanceDto } from '@/lib/api-types'
import { formatDate, formatNumber, formatPercent, speedSeries } from '@/lib/stats'

export function ErgebnisPage() {
  const { id = '' } = useParams()
  const [result, setResult] = useState<PerformanceDto | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setResult(null)
    setError(null)
    api
      .performance(id)
      .then((p) => !cancelled && setResult(p))
      .catch((err: Error) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold">{error}</h1>
        <Button className="mt-6" asChild>
          <Link to="/tipp-test">Neuen Test starten</Link>
        </Button>
      </main>
    )
  }

  if (!result) {
    return (
      <main className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="animate-spin" /> Ergebnis wird geladen …
      </main>
    )
  }

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Tipp-Test vom {formatDate(result.createdAt)}</p>
          <h1 className="text-4xl font-bold tracking-tight">
            {result.score.toLocaleString('de-DE')} <span className="text-2xl text-muted-foreground">Punkte</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/bestenliste">
              <Trophy /> Bestenliste
            </Link>
          </Button>
          <Button asChild>
            <Link to="/tipp-test">
              <RotateCcw /> Nochmal
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Wörter pro Minute" value={formatNumber(result.wpm, 1)} />
        <Metric label="Zeichen pro Minute" value={formatNumber(result.cpm)} />
        <Metric label="Fehlerfrei" value={formatPercent(result.accuracy, 1)} />
        <Metric label="Fehler verbessert" value={String(result.fixed)} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Tempoverlauf</CardTitle>
          <CardDescription>Wörter pro Minute in 5-Sekunden-Abschnitten, gestrichelt dein Durchschnitt.</CardDescription>
        </CardHeader>
        <CardContent>
          <SpeedChart points={speedSeries(result.test.text, result.events)} average={result.wpm} />
        </CardContent>
      </Card>
    </main>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 py-4">
      <CardContent className="flex flex-col items-center">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-center text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  )
}

import { Loader2, RotateCcw, Trophy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { Eyebrow, Page, PageHeader, Stat, StatRow } from '@/components/page'
import { SpeedChart } from '@/components/speed-chart'
import { Button } from '@/components/ui/button'
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
      <Page className="text-center">
        <h1 className="text-2xl font-semibold">{error}</h1>
        <Button className="mt-6" asChild>
          <Link to="/tipp-test">Neuen Test starten</Link>
        </Button>
      </Page>
    )
  }

  if (!result) {
    return (
      <Page className="flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" /> Ergebnis wird geladen …
      </Page>
    )
  }

  return (
    <Page className="flex flex-col gap-10">
      <PageHeader
        eyebrow={`Tipp-Test · ${formatDate(result.createdAt)}`}
        title={
          <>
            {result.score.toLocaleString('de-DE')} <span className="text-muted-foreground">Punkte</span>
          </>
        }
      >
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
      </PageHeader>

      <StatRow>
        <Stat label="Wörter / Minute" value={formatNumber(result.wpm, 1)} />
        <Stat label="Zeichen / Minute" value={formatNumber(result.cpm)} />
        <Stat label="Fehlerfrei" value={formatPercent(result.accuracy, 1)} />
        <Stat label="Fehler verbessert" value={result.fixed} />
      </StatRow>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Eyebrow>Tempoverlauf</Eyebrow>
          <p className="text-xs text-muted-foreground">WPM je 5 Sekunden · gestrichelt: Durchschnitt</p>
        </div>
        <SpeedChart points={speedSeries(result.test.text, result.events)} average={result.wpm} />
      </section>
    </Page>
  )
}

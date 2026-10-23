import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { Page, PageHeader } from '@/components/page'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { api } from '@/lib/api'
import type { LeaderboardSort, PerformanceSummary } from '@/lib/api-types'
import { formatDate, formatNumber, formatPercent } from '@/lib/stats'
import { cn } from '@/lib/utils'

const SORTS: { value: LeaderboardSort; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'latest', label: 'Neueste' },
]

export function BestenlistePage() {
  const navigate = useNavigate()
  const [sort, setSort] = useState<LeaderboardSort>('top')
  const [rows, setRows] = useState<PerformanceSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setRows(null)
    setError(null)
    api
      .leaderboard(sort)
      .then((r) => !cancelled && setRows(r))
      .catch((err: Error) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [sort])

  return (
    <Page className="flex flex-col gap-10">
      <PageHeader eyebrow="Tipp-Test" title="Bestenliste" description="Die besten und neuesten Ergebnisse.">
        <div className="flex gap-5 border-b" role="tablist">
          {SORTS.map((s) => (
            <button
              key={s.value}
              role="tab"
              aria-selected={sort === s.value}
              onClick={() => setSort(s.value)}
              className={cn(
                '-mb-px border-b-2 border-transparent pb-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
                sort === s.value && 'border-navy text-foreground',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </PageHeader>

      {error ? (
        <p className="py-8 text-center text-destructive">{error}</p>
      ) : !rows ? (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="animate-spin" /> Wird geladen …
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-4 border-y py-12 text-center">
          <p className="text-muted-foreground">Noch keine Ergebnisse. Der erste Platz ist frei.</p>
          <Button asChild>
            <Link to="/tipp-test">Tipp-Test starten</Link>
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="font-mono text-[11px] tracking-wider uppercase hover:bg-transparent">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Punkte</TableHead>
              <TableHead>WPM</TableHead>
              <TableHead className="hidden sm:table-cell">Fehlerfrei</TableHead>
              <TableHead className="text-right">Datum</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={r.id} className="h-12 cursor-pointer" onClick={() => navigate(`/ergebnis/${r.id}`)}>
                <TableCell className="font-mono text-muted-foreground">{String(i + 1).padStart(2, '0')}</TableCell>
                <TableCell className="font-semibold tabular-nums">{r.score.toLocaleString('de-DE')}</TableCell>
                <TableCell className="tabular-nums">{formatNumber(r.wpm)}</TableCell>
                <TableCell className="hidden tabular-nums sm:table-cell">{formatPercent(r.accuracy)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Page>
  )
}

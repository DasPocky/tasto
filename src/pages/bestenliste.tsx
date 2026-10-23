import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { api } from '@/lib/api'
import type { LeaderboardSort, PerformanceSummary } from '@/lib/api-types'
import { formatDate, formatNumber, formatPercent } from '@/lib/stats'

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
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bestenliste</h1>
          <p className="text-muted-foreground">Die besten und neuesten Ergebnisse im Tipp-Test.</p>
        </div>
        <Tabs value={sort} onValueChange={(v) => setSort(v as LeaderboardSort)}>
          <TabsList>
            <TabsTrigger value="top">Top</TabsTrigger>
            <TabsTrigger value="latest">Neueste</TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <Card>
        <CardContent>
          {error ? (
            <p className="py-8 text-center text-destructive">{error}</p>
          ) : !rows ? (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="animate-spin" /> Wird geladen …
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <p className="text-muted-foreground">Noch keine Ergebnisse – sei die oder der Erste!</p>
              <Button asChild>
                <Link to="/tipp-test">Tipp-Test starten</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Punkte</TableHead>
                  <TableHead>WPM</TableHead>
                  <TableHead className="hidden sm:table-cell">Fehlerfrei</TableHead>
                  <TableHead className="text-right">Datum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.id} className="cursor-pointer" onClick={() => navigate(`/ergebnis/${r.id}`)}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell className="font-semibold">{r.score.toLocaleString('de-DE')}</TableCell>
                    <TableCell>{formatNumber(r.wpm)}</TableCell>
                    <TableCell className="hidden sm:table-cell">{formatPercent(r.accuracy)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  )
}

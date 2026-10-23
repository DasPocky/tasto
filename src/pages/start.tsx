import { GraduationCap, Timer, Trophy } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function StartPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12">
      <section className="flex flex-col items-start gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Tippen lernen mit allen zehn Fingern</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Tasto trainiert dich Taste für Taste, passt die Übungen an deine Schwächen an und zeigt dir, wie schnell du
          wirst. Kostenlos und ohne Anmeldung.
        </p>
        <Button size="lg" asChild>
          <Link to="/tipp-test">Tipp-Test starten</Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <Timer className="size-6 text-primary" />
            <CardTitle>Tipp-Test</CardTitle>
            <CardDescription>Eine Minute tippen und sofort sehen, wie viele Wörter pro Minute du schaffst.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/tipp-test">Jetzt testen</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Trophy className="size-6 text-primary" />
            <CardTitle>Bestenliste</CardTitle>
            <CardDescription>Vergleiche dich mit allen anderen und knacke die Top 20.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <Link to="/bestenliste">Ansehen</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <GraduationCap className="size-6 text-primary" />
            <CardTitle className="flex items-center gap-2">
              Training <Badge variant="secondary">bald</Badge>
            </CardTitle>
            <CardDescription>
              Lerne das 10-Finger-System von der Grundstellung an – mit Rängen und freischaltbaren Tasten.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  )
}

import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'

import { Keyboard } from '@/components/keyboard'
import { Eyebrow, Page } from '@/components/page'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    nr: '01',
    title: 'Tipp-Test',
    text: 'Eine Minute tippen, danach siehst du Wörter pro Minute, Genauigkeit und deinen Tempoverlauf.',
    to: '/tipp-test',
    link: 'Test starten',
  },
  {
    nr: '02',
    title: 'Bestenliste',
    text: 'Alle Ergebnisse werden vom Server nachgerechnet. Hier zählt nur, was wirklich getippt wurde.',
    to: '/bestenliste',
    link: 'Ansehen',
  },
  {
    nr: '03',
    title: 'Training',
    text: 'Von der Grundstellung bis zur letzten Taste – die Übungen passen sich deinen schwachen Tasten an.',
    to: null,
    link: 'In Arbeit',
  },
] as const

export function StartPage() {
  return (
    <>
      <Page className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <section>
          <Eyebrow>10-Finger-Tipptrainer</Eyebrow>
          <h1 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight sm:text-5xl">
            Blind tippen.
            <br />
            <span className="text-muted-foreground">Ohne Umwege.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Tasto trainiert dich Taste für Taste und zeigt dir ehrlich, wie schnell du wirst. Kostenlos, ohne
            Anmeldung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to="/tipp-test">
                Tipp-Test starten <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link to="/bestenliste">Bestenliste</Link>
            </Button>
          </div>
        </section>
        <section aria-hidden className="hidden rounded-md border bg-muted/50 p-5 sm:block">
          <p className="mb-5 font-mono text-xl">
            <span>fall dass </span>
            <span className="relative">
              <span className="absolute top-[0.2em] bottom-[0.15em] -left-px w-[2px] animate-pulse bg-navy" />f
            </span>
            <span className="text-muted-foreground/60">lach saal</span>
          </p>
          <Keyboard nextChar="f" />
        </section>
      </Page>

      <section className="border-t">
        <div className="mx-auto grid w-full max-w-5xl sm:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.nr} className="flex flex-col gap-3 border-b px-5 py-8 sm:border-b-0 sm:px-8 sm:not-first:border-l">
              <span className="font-mono text-xs text-muted-foreground">{f.nr}</span>
              <h2 className="text-lg font-semibold">{f.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              {f.to ? (
                <Link to={f.to} className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-navy hover:underline">
                  {f.link} <ArrowRight className="size-4" />
                </Link>
              ) : (
                <span className="mt-auto text-sm text-muted-foreground/60">{f.link}</span>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  )
}

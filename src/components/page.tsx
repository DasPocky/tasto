import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

/** Seitenrahmen mit einheitlicher Breite und Abständen. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <main className={cn('mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14', className)}>{children}</main>
}

/** Kleine Überzeile + Titel + optionale Beschreibung, rechts Platz für Aktionen. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      </div>
      {children}
    </header>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-xs tracking-wider text-muted-foreground uppercase', className)}>{children}</p>
  )
}

/** Kennzahlen in einer Reihe, getrennt durch feine Linien statt Karten (1px-Raster). */
export function StatRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <dl
      className={cn(
        'grid grid-cols-2 gap-px border-y bg-border sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none [&>*]:bg-background',
        className,
      )}
    >
      {children}
    </dl>
  )
}

export function Stat({ label, value, size = 'lg' }: { label: string; value: ReactNode; size?: 'sm' | 'lg' }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-5 sm:px-6">
      <dt className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">{label}</dt>
      <dd className={cn('font-semibold tracking-tight tabular-nums', size === 'lg' ? 'text-3xl' : 'text-xl')}>
        {value}
      </dd>
    </div>
  )
}

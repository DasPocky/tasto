import { BrowserRouter, Link, NavLink, Outlet, Route, Routes } from 'react-router'

import { Page } from '@/components/page'
import { cn } from '@/lib/utils'
import { BestenlistePage } from '@/pages/bestenliste'
import { ErgebnisPage } from '@/pages/ergebnis'
import { StartPage } from '@/pages/start'
import { TippTestPage } from '@/pages/tipp-test'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<StartPage />} />
          <Route path="tipp-test" element={<TippTestPage />} />
          <Route path="ergebnis/:id" element={<ErgebnisPage />} />
          <Route path="bestenliste" element={<BestenlistePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:px-8">
          <Wordmark />
          <nav className="flex h-full items-stretch gap-6">
            <NavItem to="/tipp-test">Tipp-Test</NavItem>
            <NavItem to="/bestenliste">Bestenliste</NavItem>
            <span className="hidden items-center text-sm text-muted-foreground/50 sm:flex">Training</span>
          </nav>
        </div>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl justify-between px-5 py-5 text-xs text-muted-foreground sm:px-8">
          <span>tasto – Tipptrainer für das 10-Finger-System</span>
          <span>EndLab</span>
        </div>
      </footer>
    </div>
  )
}

function Wordmark() {
  return (
    <Link to="/" className="flex items-center font-mono text-lg font-medium tracking-tight">
      tasto
      <span className="ml-0.5 inline-block h-5 w-[3px] animate-pulse bg-navy" aria-hidden />
    </Link>
  )
}

function NavItem({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          '-mb-px flex items-center border-b-2 border-transparent text-sm text-muted-foreground transition-colors hover:text-foreground',
          isActive && 'border-navy text-foreground',
        )
      }
    >
      {children}
    </NavLink>
  )
}

function NotFound() {
  return (
    <Page className="text-center">
      <h1 className="text-2xl font-semibold">Seite nicht gefunden</h1>
      <p className="mt-2 text-muted-foreground">
        Zurück zur{' '}
        <Link to="/" className="text-navy underline underline-offset-4">
          Startseite
        </Link>
      </p>
    </Page>
  )
}

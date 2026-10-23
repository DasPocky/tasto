import { BrowserRouter, NavLink, Outlet, Route, Routes } from 'react-router'

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
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="border-b bg-background">
        <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
          <NavLink to="/" className="text-xl font-bold text-primary">
            Tasto
          </NavLink>
          <NavItem to="/tipp-test">Tipp-Test</NavItem>
          <NavItem to="/bestenliste">Bestenliste</NavItem>
        </nav>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      <footer className="border-t bg-background py-4 text-center text-xs text-muted-foreground">
        Tasto · ein Projekt von EndLab
      </footer>
    </div>
  )
}

function NavItem({ to, children }: { to: string; children: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn('text-sm font-medium text-muted-foreground hover:text-foreground', isActive && 'text-foreground')
      }
    >
      {children}
    </NavLink>
  )
}

function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Seite nicht gefunden</h1>
      <p className="mt-2 text-muted-foreground">
        Zurück zur <NavLink to="/" className="text-primary underline">Startseite</NavLink>.
      </p>
    </main>
  )
}

import { TippTestPage } from '@/pages/tipp-test'

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
          <span className="text-xl font-bold text-emerald-700">Tasto</span>
          <span className="text-sm font-medium text-neutral-800">Tipp-Test</span>
        </div>
      </nav>
      <TippTestPage />
    </div>
  )
}

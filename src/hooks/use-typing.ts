import { useCallback, useEffect, useState } from 'react'

import { createTypingState, pressKey, type ErrorCorrection, type TypingState } from '@/lib/typing'

const IGNORED = new Set(['Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock', 'Tab', 'Dead'])

interface Options {
  enabled?: boolean
  onKey?: (code: string) => void
}

/** Hört auf Tastatureingaben im Fenster und führt die Tipp-Engine. */
export function useTyping(text: string, mode: ErrorCorrection, { enabled = true, onKey }: Options = {}) {
  const [state, setState] = useState<TypingState>(() => createTypingState(text, mode))

  const reset = useCallback((nextText = text) => setState(createTypingState(nextText, mode)), [text, mode])

  useEffect(() => reset(text), [text, reset])

  useEffect(() => {
    if (!enabled) return
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || IGNORED.has(e.key)) return
      if (e.key !== 'Backspace' && e.key.length !== 1) return
      // Leertaste (Scrollen) und ' / (Firefox-Schnellsuche) nicht an den Browser weitergeben
      e.preventDefault()
      onKey?.(e.code)
      const now = performance.now()
      setState((s) => pressKey(s, e.key, e.code, now))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, onKey])

  return { state, reset }
}

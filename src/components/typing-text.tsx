import { useLayoutEffect, useRef } from 'react'

import type { TypingState } from '@/lib/typing'
import { cn } from '@/lib/utils'

interface Props {
  state: TypingState
  /** Sichtbare Zeilen, der Text scrollt mit dem Cursor */
  lines?: number
  className?: string
}

export function TypingText({ state, lines = 3, className }: Props) {
  const boxRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  // Aktuelle Zeile immer als erste oder zweite sichtbare Zeile halten
  useLayoutEffect(() => {
    const box = boxRef.current
    const cursor = cursorRef.current
    if (!box || !cursor) return
    const lineHeight = parseFloat(getComputedStyle(box).lineHeight)
    const line = Math.floor(cursor.offsetTop / lineHeight)
    box.scrollTop = Math.max(0, line - 1) * lineHeight
  }, [state.pos])

  return (
    <div
      ref={boxRef}
      className={cn('relative overflow-hidden font-mono text-[1.6rem] leading-[1.8] whitespace-pre-wrap select-none', className)}
      style={{ height: `${lines * 1.8}em` }}
    >
      {[...state.text].map((char, i) => {
        const typed = i < state.pos
        const wrong = typed && state.input[i] !== char
        const fixed = typed && !wrong && state.errors.has(i)
        const current = i === state.pos
        return (
          <span
            key={i}
            ref={current ? cursorRef : undefined}
            className={cn(
              'relative',
              !typed && 'text-muted-foreground/60',
              typed && !wrong && 'text-foreground',
              fixed && 'underline decoration-amber-500 decoration-2 underline-offset-[6px]',
              wrong && 'bg-destructive/10 text-destructive',
              current && 'text-foreground',
              char === ' ' && typed && wrong && 'underline decoration-destructive decoration-2 underline-offset-[6px]',
            )}
          >
            {current && (
              <span
                className={cn(
                  'absolute top-[0.25em] bottom-[0.2em] -left-px w-[2px] animate-pulse',
                  state.errors.has(i) ? 'bg-destructive' : 'bg-navy',
                )}
              />
            )}
            {char}
          </span>
        )
      })}
    </div>
  )
}

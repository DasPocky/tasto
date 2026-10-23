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
      className={cn('relative overflow-hidden font-mono text-2xl leading-[1.8] tracking-wide whitespace-pre-wrap select-none', className)}
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
              'relative rounded-sm',
              !typed && 'text-muted-foreground',
              typed && !wrong && 'text-foreground',
              fixed && 'bg-yellow-200/70',
              wrong && 'bg-red-100 text-red-500',
              current && 'bg-emerald-100 text-neutral-900',
              current && state.errors.has(i) && 'bg-red-200',
              char === ' ' && typed && wrong && 'underline decoration-red-400',
            )}
          >
            {current && (
              <span className="absolute -bottom-0.5 left-0 h-0.5 w-full animate-pulse bg-emerald-500" />
            )}
            {char}
          </span>
        )
      })}
    </div>
  )
}

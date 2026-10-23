import { FINGER_NAMES, KEYBOARD_DE, fingerColor, keyForChar, shiftCodeFor } from '@/lib/layout-de'
import { cn } from '@/lib/utils'

interface Props {
  /** Nächstes zu tippendes Zeichen – die passende Taste wird hervorgehoben */
  nextChar?: string
  /** Gerade gedrückte Taste (KeyboardEvent.code) */
  pressedCode?: string | null
  /** Buchstaben, die noch nicht freigeschaltet sind, werden ausgegraut */
  enabledChars?: Set<string>
  className?: string
}

export function Keyboard({ nextChar, pressedCode, enabledChars, className }: Props) {
  const target = nextChar !== undefined ? keyForChar(nextChar) : undefined
  const highlight = new Set<string>()
  if (target) {
    highlight.add(target.key.code)
    if (target.shift) highlight.add(shiftCodeFor(target.key))
  }

  return (
    <div className={cn('mx-auto w-full max-w-3xl select-none', className)}>
      <div className="flex flex-col gap-1.5">
        {KEYBOARD_DE.map((row, r) => (
          <div key={r} className="flex gap-1.5">
            {row.map((key) => {
              const isTarget = highlight.has(key.code)
              const disabled = enabledChars && key.base && key.base !== ' ' && !enabledChars.has(key.base)
              const color = disabled ? undefined : fingerColor(key.finger)
              const isHome = key.code === 'KeyF' || key.code === 'KeyJ'
              return (
                <div
                  key={key.code}
                  className={cn(
                    'relative flex h-10 items-center justify-center overflow-hidden rounded-[5px] border bg-background text-[13px] text-foreground/80 transition-colors duration-75 sm:h-11',
                    !key.base && !key.finger && 'bg-muted text-muted-foreground',
                    disabled && 'text-muted-foreground/40',
                    isTarget && 'border-navy bg-navy text-primary-foreground',
                    pressedCode === key.code && !isTarget && 'bg-accent',
                  )}
                  style={{ flex: `${key.width ?? 1} 1 0` }}
                >
                  <span className="relative">
                    {key.label ?? capLabel(key.base)}
                    {isHome && <span className="absolute -bottom-1 left-1/2 h-px w-2 -translate-x-1/2 bg-current" />}
                  </span>
                  {color && (
                    <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ backgroundColor: color }} />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="mt-3 h-5 text-center text-sm text-muted-foreground">
        {target?.key.finger !== undefined && (
          <>
            {nextChar === ' ' ? 'Leertaste' : <kbd className="font-mono text-foreground">{nextChar}</kbd>} mit dem{' '}
            {FINGER_NAMES[target.key.finger]}
            {target.shift && ' + Umschalttaste'}
          </>
        )}
      </p>
    </div>
  )
}

/** Großbuchstabe als Tastenbeschriftung, außer bei ß (wäre sonst „SS“) */
function capLabel(base: string | undefined): string | undefined {
  const upper = base?.toUpperCase()
  return upper?.length === 1 ? upper : base
}

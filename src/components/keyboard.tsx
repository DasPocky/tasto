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
      <div className="flex flex-col gap-1 rounded-xl bg-neutral-100 p-2">
        {KEYBOARD_DE.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((key) => {
              const isTarget = highlight.has(key.code)
              const disabled = enabledChars && key.base && key.base !== ' ' && !enabledChars.has(key.base)
              const color = disabled ? undefined : fingerColor(key.finger)
              const isHome = key.code === 'KeyF' || key.code === 'KeyJ'
              return (
                <div
                  key={key.code}
                  className={cn(
                    'relative flex h-10 items-center justify-center rounded-md border border-black/10 text-sm text-neutral-700 transition-[transform,box-shadow] duration-75 sm:h-11',
                    !color && 'bg-white',
                    disabled && 'text-neutral-300',
                    isTarget && 'z-10 ring-2 ring-neutral-800',
                    pressedCode === key.code && 'translate-y-px shadow-inner',
                  )}
                  style={{ flex: `${key.width ?? 1} 1 0`, backgroundColor: color }}
                >
                  {key.label ?? capLabel(key.base)}
                  {isHome && <span className="absolute bottom-1 h-0.5 w-2 rounded bg-neutral-500" />}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {target?.key.finger !== undefined && (
        <p className="mt-2 text-center text-sm text-neutral-500">
          {nextChar === ' ' ? 'Leertaste' : <kbd className="font-mono">{nextChar}</kbd>} mit dem{' '}
          {FINGER_NAMES[target.key.finger]}
          {target.shift && ' + Umschalttaste'}
        </p>
      )}
    </div>
  )
}

/** Großbuchstabe als Tastenbeschriftung, außer bei ß (wäre sonst „SS“) */
function capLabel(base: string | undefined): string | undefined {
  const upper = base?.toUpperCase()
  return upper?.length === 1 ? upper : base
}

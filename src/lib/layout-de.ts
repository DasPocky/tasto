// Deutsches ISO-Layout (QWERTZ), 60%-Tastatur.
// Finger-IDs: 0–4 linke Hand (kleiner Finger → Daumen), 5–9 rechte Hand (kleiner Finger → Daumen).

export type FingerId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface KeyDef {
  code: string
  /** Zeichen ohne Shift */
  base?: string
  /** Zeichen mit Shift */
  shift?: string
  /** Beschriftung für Sondertasten */
  label?: string
  /** Breite in Tasteneinheiten */
  width?: number
  finger?: FingerId
}

const k = (code: string, base: string, shift: string, finger: FingerId): KeyDef => ({
  code,
  base,
  shift,
  finger,
})

export const KEYBOARD_DE: KeyDef[][] = [
  [
    k('Backquote', '^', '°', 0),
    k('Digit1', '1', '!', 0),
    k('Digit2', '2', '"', 1),
    k('Digit3', '3', '§', 2),
    k('Digit4', '4', '$', 3),
    k('Digit5', '5', '%', 3),
    k('Digit6', '6', '&', 8),
    k('Digit7', '7', '/', 8),
    k('Digit8', '8', '(', 7),
    k('Digit9', '9', ')', 6),
    k('Digit0', '0', '=', 5),
    k('Minus', 'ß', '?', 5),
    k('Equal', '´', '`', 5),
    { code: 'Backspace', label: '⌫', width: 2 },
  ],
  [
    { code: 'Tab', label: '⇥', width: 1.5 },
    k('KeyQ', 'q', 'Q', 0),
    k('KeyW', 'w', 'W', 1),
    k('KeyE', 'e', 'E', 2),
    k('KeyR', 'r', 'R', 3),
    k('KeyT', 't', 'T', 3),
    k('KeyY', 'z', 'Z', 8),
    k('KeyU', 'u', 'U', 8),
    k('KeyI', 'i', 'I', 7),
    k('KeyO', 'o', 'O', 6),
    k('KeyP', 'p', 'P', 5),
    k('BracketLeft', 'ü', 'Ü', 5),
    k('BracketRight', '+', '*', 5),
    { code: 'Enter', label: '⏎', width: 1.5 },
  ],
  [
    { code: 'CapsLock', label: '⇪', width: 1.75 },
    k('KeyA', 'a', 'A', 0),
    k('KeyS', 's', 'S', 1),
    k('KeyD', 'd', 'D', 2),
    k('KeyF', 'f', 'F', 3),
    k('KeyG', 'g', 'G', 3),
    k('KeyH', 'h', 'H', 8),
    k('KeyJ', 'j', 'J', 8),
    k('KeyK', 'k', 'K', 7),
    k('KeyL', 'l', 'L', 6),
    k('Semicolon', 'ö', 'Ö', 5),
    k('Quote', 'ä', 'Ä', 5),
    k('Backslash', '#', "'", 5),
    { code: 'Enter2', label: '', width: 1.25 },
  ],
  [
    { code: 'ShiftLeft', label: '⇧', width: 1.25, finger: 0 },
    k('IntlBackslash', '<', '>', 0),
    k('KeyZ', 'y', 'Y', 0),
    k('KeyX', 'x', 'X', 1),
    k('KeyC', 'c', 'C', 2),
    k('KeyV', 'v', 'V', 3),
    k('KeyB', 'b', 'B', 3),
    k('KeyN', 'n', 'N', 8),
    k('KeyM', 'm', 'M', 8),
    k('Comma', ',', ';', 7),
    k('Period', '.', ':', 6),
    k('Slash', '-', '_', 5),
    { code: 'ShiftRight', label: '⇧', width: 2.75, finger: 5 },
  ],
  [
    { code: 'ControlLeft', label: 'Strg', width: 1.5 },
    { code: 'MetaLeft', label: '', width: 1.5 },
    { code: 'AltLeft', label: 'Alt', width: 1.5 },
    { code: 'Space', base: ' ', label: '', width: 6, finger: 9 },
    { code: 'AltRight', label: 'Alt Gr', width: 1.5 },
    { code: 'MetaRight', label: '', width: 1.5 },
    { code: 'ControlRight', label: 'Strg', width: 1.5 },
  ],
]

const ALL_KEYS = KEYBOARD_DE.flat()

/** Findet die Taste für ein Zeichen und ob Shift nötig ist. */
export function keyForChar(char: string): { key: KeyDef; shift: boolean } | undefined {
  for (const key of ALL_KEYS) {
    if (key.base === char) return { key, shift: false }
    if (key.shift === char) return { key, shift: true }
  }
  return undefined
}

/** Shift wird mit der jeweils anderen Hand gedrückt. */
export function shiftCodeFor(key: KeyDef): string {
  return key.finger !== undefined && key.finger < 5 ? 'ShiftRight' : 'ShiftLeft'
}

export const FINGER_COLORS = {
  pinky: '#c7eae4',
  ring: '#c3ebf3',
  middle: '#9edce3',
  index: '#a7e8bd',
  thumb: '#ffe398',
} as const

export function fingerColor(finger: FingerId | undefined): string | undefined {
  if (finger === undefined) return undefined
  switch (finger >= 5 ? finger - 5 : finger) {
    case 0:
      return FINGER_COLORS.pinky
    case 1:
      return FINGER_COLORS.ring
    case 2:
      return FINGER_COLORS.middle
    case 3:
      return FINGER_COLORS.index
    default:
      return FINGER_COLORS.thumb
  }
}

/** Dativ, für „mit dem …“ */
export const FINGER_NAMES: Record<FingerId, string> = {
  0: 'linken kleinen Finger',
  1: 'linken Ringfinger',
  2: 'linken Mittelfinger',
  3: 'linken Zeigefinger',
  4: 'linken Daumen',
  5: 'rechten kleinen Finger',
  6: 'rechten Ringfinger',
  7: 'rechten Mittelfinger',
  8: 'rechten Zeigefinger',
  9: 'Daumen',
}

// Deutscher Grundwortschatz + Generator für Übungstexte.

const WORDS_RAW = `
aber alle allein als also alt am an andere anders arbeit arbeiten art auch auf aufgabe aus auto bad bald
ball band bank bau bauen baum bei beide bein beispiel bekannt berg beruf besser best bett bild bis bitte
blatt blau bleiben blick blume boden brief bringen brot bruder buch bunt dach dafür damit dank dann darf
das dass dauer decke dein denken denn der des dich dick die dienst dies ding doch dorf dort drei du dunkel
durch eben ecke egal ehe eigen ein einfach einmal eltern ende eng er erde erst es essen etwas euch fahren
fall fallen falsch familie farbe fast fehlen feld fenster ferien fern fest feuer film finden fisch flach
flasche fleisch fliegen flug fluss folgen form frage fragen frau frei freund froh früh fuß ganz garten gast
geben gebiet gegen gehen geld gelb genau gern gesicht gestern gewinn glas glauben gleich glück gold gras
grau groß grün gruppe gut haar haben halb hals halten hand hart hase haus heben heft heiß heißen helfen
hell her herr heute hier hilfe himmel hin hoch hof hoffen holen holz hören hose hund hunger idee ihr immer
in insel ja jahr jede jetzt jung kaffee kalt kampf kann karte katze kaufen kein kennen kind kino klar klasse
klein klug knie koch kochen kommen kopf kraft krank kreis küche kuchen kunst kurz lachen lage lampe land
lang langsam lassen laufen laut leben leer legen lehrer leicht leise lernen lesen letzt leute licht lieb
liegen links liste loch los luft lust machen mal man mann markt maus meer mehr mein meist mensch messer
milch mit mittag mond morgen müde mund musik muss mutter nach nacht nah name nase nass natur neben nehmen
nein nest neu nicht nichts noch nord null nur ob oben obst oder offen oft ohne ohr oma onkel opa ort paar
papier park pause pferd plan platz post preis prima punkt rad rasen rat raum rechnen recht regen reich reise
rennen rest richtig rock rot ruf ruhe ruhig rund sache saft sagen salz satz schaf schal schiff schlafen
schlecht schnee schnell schon schön schrank schreiben schuh schule schwarz schwer see sehen sehr sein seite
selbst setzen sie sind sitzen so sofort sohn soll sommer sonne spaß spät spiel spielen sport sprache stadt
stark stein stelle stern still straße stück stuhl stunde suchen süß tag tante tasche tasse teil teller tier
tisch tochter tor tragen traum treffen treppe tun tür turm über uhr um und uns unten vater viel vier vogel
voll vom von vor wagen wahl wald wand wann warm warten was wasser weg weil wein weit welt wenig wer werden
wetter wie wieder wind winter wir wissen wo woche wohl wohnen wolf wolke wort wunsch zahl zahn zeit zeitung
ziel zimmer zug zu zwei zwischen
skala falls fass lass kalk saal haken lade sage sahne halle helfe all dass klasse
`

export const WORDS: string[] = [...new Set(WORDS_RAW.split(/\s+/).filter(Boolean))]

/** Zufallszahlengenerator mit Seed (mulberry32), damit Texte reproduzierbar sind. */
export function createRng(seed = Date.now()): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const START = '^'
const END = '$'

/** Trigramm-Modell: erzeugt deutsch klingende Pseudo-Wörter für den Tipp-Test. */
export class PseudoWordGenerator {
  private table = new Map<string, Map<string, number>>()

  constructor(words: string[] = WORDS) {
    for (const w of words) {
      const s = START + START + w + END
      for (let i = 2; i < s.length; i++) {
        const ctx = s.slice(i - 2, i)
        const next = s[i]
        const m = this.table.get(ctx) ?? new Map<string, number>()
        m.set(next, (m.get(next) ?? 0) + 1)
        this.table.set(ctx, m)
      }
    }
  }

  word(rng: () => number, minLen = 3, maxLen = 9): string {
    for (let attempt = 0; attempt < 50; attempt++) {
      let ctx = START + START
      let out = ''
      while (out.length <= maxLen) {
        const next = pick(this.table.get(ctx), rng)
        if (next === undefined || next === END) break
        out += next
        ctx = ctx[1] + next
      }
      if (out.length >= minLen && out.length <= maxLen) return out
    }
    return 'tippen'
  }

  text(count: number, rng: () => number): string {
    return Array.from({ length: count }, () => this.word(rng)).join(' ')
  }
}

function pick(m: Map<string, number> | undefined, rng: () => number): string | undefined {
  if (!m) return undefined
  let total = 0
  for (const n of m.values()) total += n
  let r = rng() * total
  for (const [k, n] of m) {
    r -= n
    if (r < 0) return k
  }
  return undefined
}

/**
 * Übungstext für das Training: nur Wörter aus freigeschalteten Buchstaben.
 * `weights` hebt schwache Buchstaben hervor (höher = öfter üben).
 */
export function trainingText(
  allowed: Set<string>,
  weights: Map<string, number>,
  count: number,
  rng: () => number,
  words: string[] = WORDS,
): string {
  const pool = words.filter((w) => [...w].every((c) => allowed.has(c)))
  const letters = [...allowed].filter((c) => c !== ' ')
  if (pool.length < 5) {
    // Zu wenig echte Wörter: Buchstabenkombinationen bilden
    return Array.from({ length: count }, () => {
      const len = 2 + Math.floor(rng() * 3)
      return Array.from({ length: len }, () => weightedChar(letters, weights, rng)).join('')
    }).join(' ')
  }
  const scored = pool.map((w) => ({
    w,
    score: [...w].reduce((sum, c) => sum + (weights.get(c) ?? 1), 0) / w.length,
  }))
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const total = scored.reduce((s, x) => s + x.score, 0)
    let r = rng() * total
    let chosen = scored[0].w
    for (const x of scored) {
      r -= x.score
      if (r < 0) {
        chosen = x.w
        break
      }
    }
    if (out[out.length - 1] === chosen && scored.length > 1) {
      i--
      continue
    }
    out.push(chosen)
  }
  return out.join(' ')
}

function weightedChar(letters: string[], weights: Map<string, number>, rng: () => number): string {
  const total = letters.reduce((s, c) => s + (weights.get(c) ?? 1), 0)
  let r = rng() * total
  for (const c of letters) {
    r -= weights.get(c) ?? 1
    if (r < 0) return c
  }
  return letters[0]
}

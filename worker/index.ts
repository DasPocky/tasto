import { Hono } from 'hono'

import type {
  ApiError,
  ApiResponse,
  LeaderboardSort,
  PerformanceDto,
  PerformanceSummary,
  TestDto,
} from '../src/lib/api-types'
import { computeStats, countFixed, replay, type KeyEvent } from '../src/lib/typing'
import { PseudoWordGenerator, createRng } from '../src/lib/words'

const BASE_PATH = '/tasto'

interface Env {
  DB: D1Database
  ASSETS: Fetcher
}

const TEST_PERIOD = 60
const TEST_WORDS = 250
/** Mehr Anschläge schafft in 60 s niemand (≈ 300 WPM inkl. Korrekturen) */
const MAX_EVENTS = 2000
/** Darüber gilt ein Ergebnis als unplausibel */
const MAX_WPM = 250

const generator = new PseudoWordGenerator()

const api = new Hono<{ Bindings: Env }>().basePath(`${BASE_PATH}/api`)

const ok = <T>(data: T): ApiResponse<T> => ({ data })
const fail = (error: string): ApiError => ({ error })

api.post('/tests', async (c) => {
  const test: TestDto = {
    id: crypto.randomUUID(),
    language: 'de',
    period: TEST_PERIOD,
    text: generator.text(TEST_WORDS, createRng(crypto.getRandomValues(new Uint32Array(1))[0])),
  }
  await c.env.DB.prepare('INSERT INTO tests (id, language, period, text, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(test.id, test.language, test.period, test.text, Date.now())
    .run()
  return c.json(ok(test), 201)
})

api.get('/tests/:id', async (c) => {
  const test = await findTest(c.env.DB, c.req.param('id'))
  return test ? c.json(ok(test)) : c.json(fail('Test nicht gefunden'), 404)
})

api.post('/tests/:id/performances', async (c) => {
  const test = await findTest(c.env.DB, c.req.param('id'))
  if (!test) return c.json(fail('Test nicht gefunden'), 404)

  const events = parseEvents(await c.req.json().catch(() => null))
  if (!events) return c.json(fail('Ungültiges Tastenprotokoll'), 400)

  // Ergebnis nicht vom Browser übernehmen, sondern aus dem Protokoll nachrechnen
  const state = replay(test.text, 'free', events)
  const totalMs = events.reduce((sum, [, , ms]) => sum + ms, 0)
  if (totalMs > (test.period + 5) * 1000) return c.json(fail('Zeit überschritten'), 400)
  const stats = computeStats(state, test.period * 1000)
  if (stats.wpm > MAX_WPM) return c.json(fail('Ergebnis nicht plausibel'), 400)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    `INSERT INTO performances (id, test_id, score, wpm, cpm, accuracy, fixed, events, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, test.id, stats.score, stats.wpm, stats.cpm, stats.accuracy, countFixed(state), JSON.stringify(events), Date.now())
    .run()
  return c.json(ok({ id }), 201)
})

api.get('/performances', async (c) => {
  const sort: LeaderboardSort = c.req.query('sort') === 'latest' ? 'latest' : 'top'
  const limit = Math.min(Math.max(Number(c.req.query('limit')) || 20, 1), 100)
  const order = sort === 'top' ? 'score DESC, created_at ASC' : 'created_at DESC'
  const { results } = await c.env.DB.prepare(
    `SELECT id, score, wpm, cpm, accuracy, fixed, created_at FROM performances ORDER BY ${order} LIMIT ?`,
  )
    .bind(limit)
    .all<PerformanceRow>()
  return c.json(ok(results.map(toSummary)))
})

api.get('/performances/random', async (c) => {
  const row = await c.env.DB.prepare(`${PERFORMANCE_SELECT} ORDER BY RANDOM() LIMIT 1`).first<PerformanceJoinRow>()
  return row ? c.json(ok(toPerformance(row))) : c.json(fail('Noch keine Ergebnisse'), 404)
})

api.get('/performances/:id', async (c) => {
  const row = await c.env.DB.prepare(`${PERFORMANCE_SELECT} WHERE p.id = ?`)
    .bind(c.req.param('id'))
    .first<PerformanceJoinRow>()
  return row ? c.json(ok(toPerformance(row))) : c.json(fail('Ergebnis nicht gefunden'), 404)
})

api.notFound((c) => c.json(fail('Nicht gefunden'), 404))
api.onError((err, c) => {
  console.error(err)
  return c.json(fail('Interner Fehler'), 500)
})

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (url.pathname.startsWith(`${BASE_PATH}/api/`)) return api.fetch(request, env, ctx)
    if (url.pathname === BASE_PATH) return Response.redirect(`${url.origin}${BASE_PATH}/`, 301)

    // Statische Dateien; unbekannte Seiten-Pfade bekommen die App (Client-Routing)
    const res = await env.ASSETS.fetch(request)
    if (res.status === 404 && request.method === 'GET' && request.headers.get('accept')?.includes('text/html')) {
      return env.ASSETS.fetch(new Request(new URL(`${BASE_PATH}/`, url), request))
    }
    return res
  },
} satisfies ExportedHandler<Env>

// --- Datenbank-Hilfen ---

interface PerformanceRow {
  id: string
  score: number
  wpm: number
  cpm: number
  accuracy: number
  fixed: number
  created_at: number
}

interface PerformanceJoinRow extends PerformanceRow {
  events: string
  test_id: string
  language: string
  period: number
  text: string
}

const PERFORMANCE_SELECT = `SELECT p.id, p.score, p.wpm, p.cpm, p.accuracy, p.fixed, p.created_at, p.events,
  t.id AS test_id, t.language, t.period, t.text
  FROM performances p JOIN tests t ON t.id = p.test_id`

async function findTest(db: D1Database, id: string): Promise<TestDto | null> {
  return db.prepare('SELECT id, language, period, text FROM tests WHERE id = ?').bind(id).first<TestDto>()
}

function toSummary(r: PerformanceRow): PerformanceSummary {
  return { id: r.id, score: r.score, wpm: r.wpm, cpm: r.cpm, accuracy: r.accuracy, fixed: r.fixed, createdAt: r.created_at }
}

function toPerformance(r: PerformanceJoinRow): PerformanceDto {
  return {
    ...toSummary(r),
    test: { id: r.test_id, language: r.language, period: r.period, text: r.text },
    events: JSON.parse(r.events) as KeyEvent[],
  }
}

function parseEvents(body: unknown): KeyEvent[] | null {
  const list = (body as { events?: unknown } | null)?.events
  if (!Array.isArray(list) || list.length === 0 || list.length > MAX_EVENTS) return null
  for (const e of list) {
    if (
      !Array.isArray(e) ||
      e.length !== 3 ||
      typeof e[0] !== 'string' ||
      e[0].length === 0 ||
      e[0].length > 9 ||
      typeof e[1] !== 'string' ||
      e[1].length > 20 ||
      !Number.isInteger(e[2]) ||
      e[2] < 0 ||
      e[2] > 60_000
    ) {
      return null
    }
  }
  return list as KeyEvent[]
}

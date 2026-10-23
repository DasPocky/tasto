// Packt den Vite-Build (dist/tasto) als Modul in den Worker, damit kein separater
// Asset-Upload nötig ist. Ergebnis: worker/assets.gen.ts (nicht eingecheckt).
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DIST = join(ROOT, 'dist/tasto')
const OUT = join(ROOT, 'worker/assets.gen.ts')

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const entries = walk(DIST).map((file) => {
  const path = '/' + relative(DIST, file).split('\\').join('/')
  const type = TYPES[extname(file)] ?? 'application/octet-stream'
  // Dateien mit Hash im Namen ändern sich nie → dauerhaft cachebar
  const immutable = path.startsWith('/assets/')
  return `  ${JSON.stringify(path)}: { type: ${JSON.stringify(type)}, immutable: ${immutable}, body: ${JSON.stringify(readFileSync(file).toString('base64'))} },`
})

writeFileSync(
  OUT,
  `// Automatisch erzeugt von scripts/embed-assets.mjs – nicht bearbeiten.\n` +
    `export interface EmbeddedAsset {\n  type: string\n  immutable: boolean\n  /** Base64 */\n  body: string\n}\n\n` +
    `export const ASSETS: Record<string, EmbeddedAsset> = {\n${entries.join('\n')}\n}\n`,
)
console.log(`${entries.length} Dateien in worker/assets.gen.ts eingebettet`)

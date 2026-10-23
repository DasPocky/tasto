import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Die App läuft unter endlab.de/tasto
  base: '/tasto/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, './src') },
  },
  build: {
    // dist/tasto/… → vom Worker als /tasto/… ausgeliefert
    outDir: 'dist/tasto',
    emptyOutDir: true,
  },
  server: {
    // API im Dev-Modus an `wrangler dev` weiterreichen
    proxy: { '/tasto/api': 'http://localhost:8787' },
  },
})

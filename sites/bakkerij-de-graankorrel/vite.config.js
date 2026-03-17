import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// v8.8 Universal Base URL Detection
const isProduction = process.env.NODE_ENV === 'production';
const siteName = path.basename(__dirname);

export default defineConfig({
  // In development (Dashboard Reviewer) gebruiken we root of de ath- prefix
  // In production (GitHub Pages) gebruiken we de site-naam
  base: isProduction ? `/${siteName}/` : './', 
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: false,
    host: true
  }
})

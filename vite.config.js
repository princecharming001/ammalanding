import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ammalanding/', // GitHub Pages repo path (non-custom domain)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  }
})

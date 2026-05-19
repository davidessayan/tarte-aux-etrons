import { defineConfig } from 'vite'

export default defineConfig({
  root: 'playground',
  base: '/',
  build: {
    outDir: '../dist-playground',
    emptyOutDir: true,
  },
})

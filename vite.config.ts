import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vite.dev/config/
export default defineConfig({
  base: '/lightsup-pro/',
  plugins: [
    react(),
    viteSingleFile()
  ],
  build: {
    assetsInlineLimit: 100000000, 
    cssCodeSplit: false,
  },
})

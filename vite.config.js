import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true, // Keep source maps for debugging
  },
  server: {
    hmr: {
      overlay: true, // Show error overlay
    }
  }
})

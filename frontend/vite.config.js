import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Move Vite's dep optimization cache outside OneDrive to avoid file locks
  // on synced directories that cause EPERM on Windows.
  cacheDir: process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'vite-cache')
    : path.resolve(__dirname, '.vite-cache'),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-day-picker'],
    force: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
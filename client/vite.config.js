import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // הגדרת ה-base כסלאש מבטיחה שהנתיבים לקבצי ה-assets (CSS/JS) 
  // תמיד יתחילו מהשורש של הדומיין ולא מהנתיב הנוכחי (כמו /login/)
  base: '/',
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    // זה מבטיח שה-assets יישמרו בתיקייה תקנית בתוך dist
    outDir: 'dist',
    assetsDir: 'assets',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
    globals: true,
  },
})
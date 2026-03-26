import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // base: '/' ensures all asset paths (JS/CSS chunks) are resolved from the
  // domain root, so they load correctly on deep routes like /cart or /scan.
  base: '/',
  plugins: [
    react(),
    tailwindcss()
  ],
  // appType: 'spa' (Vite's default) makes the dev server respond to every
  // request — including page refreshes on /cart, /scan, etc. — by serving
  // index.html instead of a 404. React Router then takes over on the client.
  appType: 'spa',
  server: {
    // Explicit SPA fallback: any path that doesn't match a real file is
    // served as index.html, allowing BrowserRouter to handle the route.
    // This is what prevents "Not Found" when refreshing a deep URL in dev.
    historyApiFallback: true,
  },
  build: {
    // Assets are emitted into dist/assets/ with content-hash filenames for
    // long-term browser caching.
    outDir: 'dist',
    assetsDir: 'assets',
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
    globals: true,
  },
})
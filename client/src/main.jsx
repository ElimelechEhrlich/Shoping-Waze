import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'

createRoot(document.getElementById('root')).render(
  // StrictMode intentionally mounts components twice in development to surface
  // side-effects and deprecated API usage early.
  <StrictMode>
    {/* BrowserRouter uses the HTML5 History API so every URL is a real path.
        Vite dev server (appType "spa") returns index.html for all 404s,
        letting React Router handle routing entirely on the client side.
        Production fallbacks are in: public/_redirects (Netlify/Render),
        vercel.json (Vercel), and nginx.conf (nginx). */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

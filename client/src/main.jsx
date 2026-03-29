import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

const routerTree = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        {routerTree}
      </GoogleOAuthProvider>
    ) : (
      routerTree
    )}
  </StrictMode>,
)

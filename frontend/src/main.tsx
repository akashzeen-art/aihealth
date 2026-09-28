import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { hydrateStorageGuard } from './local/db'
import { hydrateEngagementForSession } from './store/engagementStore'
import './index.css'
import App from './App.tsx'

hydrateStorageGuard()
hydrateEngagementForSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

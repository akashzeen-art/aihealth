import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { hydrateStorageGuard } from './local/db'
import { hydrateEngagementForSession } from './store/engagementStore'
import './index.css'
import App from './App.tsx'
import './styles/theme.css'
import './styles/home.css'

hydrateStorageGuard()
hydrateEngagementForSession()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

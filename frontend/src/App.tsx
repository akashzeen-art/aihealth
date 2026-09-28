import { useCallback, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import Preloader, { hasSeenPreloader } from './components/common/Preloader'
import SafetyOnboardingGate from './components/common/SafetyOnboardingGate'
import ScrollToTop from './components/common/ScrollToTop'
import AppShell from './layouts/AppShell'
import AboutPage from './pages/AboutPage'
import AssistantDetailPage from './pages/AssistantDetailPage'
import AssistantsPage from './pages/AssistantsPage'
import ChatRedirectPage from './pages/ChatRedirectPage'
import DashboardPage from './pages/DashboardPage'
import DocumentReaderPage from './pages/DocumentReaderPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import RemindersPage from './pages/RemindersPage'
import SafetyPage from './pages/SafetyPage'
import SignupPage from './pages/SignupPage'
import TrackerPage from './pages/TrackerPage'

function SafetyLayout() {
  return (
    <SafetyOnboardingGate>
      <Outlet />
    </SafetyOnboardingGate>
  )
}

export default function App() {
  const [ready, setReady] = useState(() => hasSeenPreloader())
  const handlePreloaderDone = useCallback(() => setReady(true), [])

  if (!ready) {
    return <Preloader onDone={handlePreloaderDone} />
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell />}>
          <Route path="signup" element={<SignupPage />} />
          <Route path="login" element={<Navigate to="/signup" replace />} />
          <Route path="register" element={<Navigate to="/signup" replace />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="safety" element={<SafetyPage />} />

          <Route element={<SafetyLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="assistants" element={<AssistantsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="document-reader" element={<DocumentReaderPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="tracker" element={<TrackerPage />} />

            <Route
              path="assistant/:assistantType/:conversationId?"
              element={<AssistantDetailPage />}
            />

            <Route path="app" element={<Navigate to="/" replace />} />
            <Route path="app/profile" element={<Navigate to="/profile" replace />} />
            <Route path="app/documents" element={<Navigate to="/document-reader" replace />} />
            <Route path="app/disclaimers" element={<Navigate to="/safety" replace />} />
            <Route path="app/chat/:assistantType" element={<ChatRedirectPage />} />
            <Route
              path="app/chat/:assistantType/:conversationId"
              element={<ChatRedirectPage />}
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

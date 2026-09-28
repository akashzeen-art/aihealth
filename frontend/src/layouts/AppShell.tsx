import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../components/common/BottomNav'
import PageTransition from '../components/motion/PageTransition'
import ReminderAlerts from '../components/tools/ReminderAlerts'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuthStore } from '../store/authStore'

export default function AppShell() {
  const user = useAuthStore((s) => s.user)
  const { pathname } = useLocation()
  const isChat = pathname.startsWith('/assistant/')
  const dir = user.preferredLanguage === 'ar' ? 'rtl' : 'ltr'
  const shellClass = [
    'app-shell',
    'is-authenticated',
    isChat ? 'is-chat' : '',
    'is-app',
    dir === 'rtl' ? 'is-rtl' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass} dir={dir}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Navbar />
      <main className="app-main" id="main-content" tabIndex={-1}>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      {!isChat && <Footer />}
      <BottomNav />
      <ReminderAlerts key={user.id} />
    </div>
  )
}

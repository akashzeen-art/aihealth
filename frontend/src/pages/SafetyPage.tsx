import { Link } from 'react-router-dom'
import DisclaimersPage from './DisclaimersPage'

export default function SafetyPage() {
  return (
    <div>
      <div className="page-pad" style={{ paddingBottom: 0 }}>
        <p className="muted">
          Review platform safety principles. For product context see{' '}
          <Link to="/about">About</Link>.
        </p>
      </div>
      <DisclaimersPage />
    </div>
  )
}

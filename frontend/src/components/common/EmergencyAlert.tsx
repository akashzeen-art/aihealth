export default function EmergencyAlert({
  children = 'If someone is in immediate danger, call your local emergency number now. This guide is educational and not a substitute for emergency services.',
}: {
  children?: string
}) {
  return (
    <aside className="emergency-banner" role="alert">
      <strong>Emergency — act first.</strong> {children}
    </aside>
  )
}

export default function Toast({ message }) {
  if (!message.text) return null;
  return (
    <div style={{ position: 'fixed', top: '80px', right: '50%', transform: 'translateX(50%)', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', zIndex: 50, backgroundColor: message.type === 'error' ? '#ef4444' : '#10b981', color: 'white', whiteSpace: 'nowrap' }}>
      {message.text}
    </div>
  )
}
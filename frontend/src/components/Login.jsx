import { Lock } from 'lucide-react'

export default function Login({ pin, setPin, handleLogin, message }) {
  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui', padding: '1rem' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: '#1e293b', padding: '2.5rem 1.5rem', borderRadius: '12px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#3b82f6', padding: '1rem', borderRadius: '50%' }}><Lock size={32} color="white" /></div>
        </div>
        <h2 style={{ color: 'white', marginBottom: '2rem' }}>Admin Access</h2>
        <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="Enter PIN" autoFocus
          style={{ width: '100%', padding: '1rem', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', fontSize: '1.2rem', textAlign: 'center', marginBottom: '1.5rem' }} />
        <button type="submit" style={{ width: '100%', padding: '1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold' }}>
          Unlock
        </button>
        {message.text && <p style={{ color: '#ef4444', marginTop: '1rem' }}>{message.text}</p>}
      </form>
    </div>
  )
}
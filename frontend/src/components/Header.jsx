import { Activity, LayoutDashboard, CalendarDays, Moon, Sun, BarChart3, BookOpen } from 'lucide-react'

export default function Header({ activeTab, setActiveTab, handleLogout, isDarkMode, setIsDarkMode }) {
  return (
    <header style={{ backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Activity color="#2563eb" size={28} />
        <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)' }}>Teer Engine V7.0</h1>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', backgroundColor: activeTab === 'dashboard' ? '#3b82f6' : 'transparent', color: activeTab === 'dashboard' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          <LayoutDashboard size={18}/> Dashboard
        </button>
        
        <button onClick={() => setActiveTab('history')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', backgroundColor: activeTab === 'history' ? '#10b981' : 'transparent', color: activeTab === 'history' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          <CalendarDays size={18}/> History Book
        </button>

        <button onClick={() => setActiveTab('analytics')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', backgroundColor: activeTab === 'analytics' ? '#8b5cf6' : 'transparent', color: activeTab === 'analytics' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          <BarChart3 size={18}/> Analytics
        </button>

        {/* NEW ARCHIVES BUTTON */}
        <button onClick={() => setActiveTab('archives')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.5rem 1rem', backgroundColor: activeTab === 'archives' ? '#f59e0b' : 'transparent', color: activeTab === 'archives' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          <BookOpen size={18}/> Archives
        </button>
        
        <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ padding: '0.5rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '6px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </header>
  )
}
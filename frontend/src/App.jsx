import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'
axios.defaults.headers.common['ngrok-skip-browser-warning'] = '69420';
// Import your components
import Login from './components/Login'
import Header from './components/Header'
import Toast from './components/Toast'
import Dashboard from './components/Dashboard'
import HistoryBook from './components/HistoryBook'
import Analytics from './components/Analytics'
import PredictionArchive from './components/PredictionArchive'
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isTeerAdmin') === 'true')
  const [pin, setPin] = useState('')
  const CORRECT_PIN = '2026'

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('teerTheme') === 'dark')

  // Navigation & Form States
  const [activeTab, setActiveTab] = useState('dashboard')
  const [date, setDate] = useState('')
  const [fr, setFr] = useState('')
  const [sr, setSr] = useState('')
  const [message, setMessage] = useState({ text: '', type: '' })
  
  // Data States
  const [prediction, setPrediction] = useState(() => {
    const saved = localStorage.getItem('teerPrediction')
    return saved ? JSON.parse(saved) : null
  })
  const [targetDate, setTargetDate] = useState('')
  const [recentHistory, setRecentHistory] = useState([])
  const [fullHistory, setFullHistory] = useState({})
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [showAllMonths, setShowAllMonths] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  
  // NEW: State for storing the archived predictions for the History Book highlights
  const [savedPredictions, setSavedPredictions] = useState({})

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('teerTheme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const fetchRecentHistory = async () => {
    try {
      const res = await axios.get('https://aubrie-illustrative-nondigestibly.ngrok-free.dev/api/history/Shillong?limit=10')
      setRecentHistory(res.data)
    } catch (error) {
      console.error("Could not fetch recent history", error)
    }
  }

  const fetchFullHistory = async () => {
    setIsHistoryLoading(true)
    try {
      // Fetch Results
      const res = await axios.get('https://aubrie-illustrative-nondigestibly.ngrok-free.dev/api/history/Shillong?limit=5000')
      const grouped = res.data.reduce((acc, curr) => {
        const monthYear = new Date(curr.result_date).toLocaleString('default', { month: 'long', year: 'numeric' })
        if (!acc[monthYear]) acc[monthYear] = []
        acc[monthYear].push(curr)
        return acc
      }, {})
      setFullHistory(grouped)

      // Fetch Predictions to highlight the hits
      const predRes = await axios.get('https://aubrie-illustrative-nondigestibly.ngrok-free.dev/api/predictions/Shillong')
      setSavedPredictions(predRes.data)
      
    } catch (error) {
      setMessage({ text: '❌ Could not load full history', type: 'error' })
    }
    setIsHistoryLoading(false)
  }

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('https://aubrie-illustrative-nondigestibly.ngrok-free.dev/api/analytics/Shillong')
      setAnalyticsData(res.data)
    } catch (error) {
      console.error("Could not fetch analytics", error)
    }
  }

  useEffect(() => { if (isAuthenticated) fetchRecentHistory() }, [isAuthenticated])
  useEffect(() => { if ((activeTab === 'history' || activeTab === 'archives') && Object.keys(fullHistory).length === 0) fetchFullHistory() }, [activeTab])
  useEffect(() => { if (activeTab === 'analytics' && !analyticsData) fetchAnalytics() }, [activeTab])

  const handleLogin = (e) => {
    e.preventDefault()
    if (pin === CORRECT_PIN) {
      localStorage.setItem('isTeerAdmin', 'true')
      setIsAuthenticated(true)
    } else {
      setMessage({ text: '❌ Incorrect PIN', type: 'error' })
      setPin('')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isTeerAdmin')
    setIsAuthenticated(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('https://aubrie-illustrative-nondigestibly.ngrok-free.dev/api/results', { city: 'Shillong', result_date: date, fr: parseInt(fr), sr: parseInt(sr) })
      setMessage({ text: '✅ Result saved successfully!', type: 'success' })
      setFr(''); setSr('');
      fetchRecentHistory()
      
      if (activeTab === 'history') fetchFullHistory()
      
      setPrediction(null)
      localStorage.removeItem('teerPrediction')
      setAnalyticsData(null) // Clears old analytics
    } catch (error) {
      setMessage({ text: '❌ Error: ' + (error.response?.data?.detail || error.message), type: 'error' })
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result?")) return
    try {
      await axios.delete(`https://aubrie-illustrative-nondigestibly.ngrok-free.dev/api/results/${id}`)
      fetchRecentHistory()
      
      if (activeTab === 'history') fetchFullHistory()
      
      setMessage({ text: '🗑️ Result deleted.', type: 'success' })
      setPrediction(null)
      localStorage.removeItem('teerPrediction')
      setAnalyticsData(null) // Clears old analytics
    } catch (error) {
      setMessage({ text: '❌ Error deleting result.', type: 'error' })
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const runPrediction = async () => {
    try {
      const res = await axios.get('https://aubrie-illustrative-nondigestibly.ngrok-free.dev/api/predict/Shillong')
      setPrediction(res.data)
      localStorage.setItem('teerPrediction', JSON.stringify(res.data))
      
      // Auto-set tomorrow's date for the save box
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTargetDate(tomorrow.toISOString().split('T')[0]);
      
      setMessage({ text: '🎯 Prediction Generated!', type: 'success' })
    } catch (error) {
      setMessage({ text: '❌ Error: Need more history data.', type: 'error' })
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  // NEW: Saves the generated targets to the database
  const handleSavePrediction = async (e) => {
    e.preventDefault();
    if (!prediction || !targetDate) return;
    
    // Combine Raw Bait and Evasion Shields into one list
    const allTargets = [
      ...prediction.raw_bait_targets,
      ...prediction.evasion_shields.flatMap(s => s.evasion_hits)
    ];

    try {
      await axios.post('https://aubrie-illustrative-nondigestibly.ngrok-free.dev/api/predictions', {
        city: 'Shillong',
        target_date: targetDate,
        numbers: allTargets.join(',')
      });
      setMessage({ text: '💾 Prediction Archived for Hit Tracking!', type: 'success' });
      
      // Refresh history to ensure the new saved prediction is loaded
      if (activeTab === 'history') fetchFullHistory(); 
    } catch (error) {
      setMessage({ text: '❌ Error saving prediction', type: 'error' });
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  if (!isAuthenticated) return <Login pin={pin} setPin={setPin} handleLogin={handleLogin} message={message} />

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: 'system-ui' }}>
      
      <Header 
        activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={handleLogout} 
        isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} 
      />
      
      <Toast message={message} />
      
      <main style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {activeTab === 'dashboard' ? (
          <Dashboard 
            date={date} setDate={setDate} fr={fr} setFr={setFr} sr={sr} setSr={setSr}
            handleSubmit={handleSubmit} recentHistory={recentHistory} handleDelete={handleDelete}
            prediction={prediction} runPrediction={runPrediction}
            
            // Passed the new props down to the Dashboard
            targetDate={targetDate} setTargetDate={setTargetDate} handleSavePrediction={handleSavePrediction}
          />
        ) : activeTab === 'history' ? (
          <HistoryBook 
            fullHistory={fullHistory} isHistoryLoading={isHistoryLoading} 
            showAllMonths={showAllMonths} setShowAllMonths={setShowAllMonths} handleDelete={handleDelete}
            
            // Passed the saved predictions down to the History Book
            savedPredictions={savedPredictions}
          />
        ) : activeTab === 'analytics' ? (
          <Analytics analyticsData={analyticsData} prediction={prediction}/>
        ) : (
          <PredictionArchive savedPredictions={savedPredictions} fullHistory={fullHistory} />
        )}
      </main>
    </div>
  )
}

export default App
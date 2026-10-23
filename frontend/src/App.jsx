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
  
  // Data & Credit States
  const [prediction, setPrediction] = useState(() => {
    const saved = localStorage.getItem('teerPrediction')
    return saved ? JSON.parse(saved) : null
  })
  
  const [credits, setCredits] = useState(() => {
    const saved = localStorage.getItem('teerCredits')
    return saved !== null ? parseInt(saved) : 1000
  })

  // NEW: Track when they last paid for a prediction
  const [lastPredictionDate, setLastPredictionDate] = useState(() => {
    return localStorage.getItem('teerLastPredictionDate') || ''
  })
  
  const todayString = new Date().toDateString();
  const alreadyPaidToday = lastPredictionDate === todayString;

  const [targetDate, setTargetDate] = useState('')
  const [recentHistory, setRecentHistory] = useState([])
  const [fullHistory, setFullHistory] = useState({})
  const [isHistoryLoading, setIsHistoryLoading] = useState(false)
  const [showAllMonths, setShowAllMonths] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  
  const [savedPredictions, setSavedPredictions] = useState({})

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('teerTheme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const fetchRecentHistory = async () => {
    try {
      const res = await axios.get('https://teer-api-7erf.onrender.com/api/history/Shillong?limit=10')
      setRecentHistory(res.data)
    } catch (error) {
      console.error("Could not fetch recent history", error)
    }
  }

  const fetchFullHistory = async () => {
    setIsHistoryLoading(true)
    try {
      const res = await axios.get('https://teer-api-7erf.onrender.com/api/history/Shillong?limit=5000')
      const grouped = res.data.reduce((acc, curr) => {
        const monthYear = new Date(curr.result_date).toLocaleString('default', { month: 'long', year: 'numeric' })
        if (!acc[monthYear]) acc[monthYear] = []
        acc[monthYear].push(curr)
        return acc
      }, {})
      setFullHistory(grouped)

      const predRes = await axios.get('https://teer-api-7erf.onrender.com/api/predictions/Shillong')
      setSavedPredictions(predRes.data)
      
    } catch (error) {
      setMessage({ text: '❌ Could not load full history', type: 'error' })
    }
    setIsHistoryLoading(false)
  }

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('https://teer-api-7erf.onrender.com/api/analytics/Shillong')
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
      await axios.post('https://teer-api-7erf.onrender.com/api/results', { city: 'Shillong', result_date: date, fr: parseInt(fr), sr: parseInt(sr) })
      setMessage({ text: '✅ Result saved successfully!', type: 'success' })
      setFr(''); setSr('');
      
      fetchRecentHistory()
      fetchFullHistory()
      
      setPrediction(null)
      localStorage.removeItem('teerPrediction')
      setAnalyticsData(null)
    } catch (error) {
      setMessage({ text: '❌ Error: ' + (error.response?.data?.detail || error.message), type: 'error' })
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result?")) return
    try {
      await axios.delete(`https://teer-api-7erf.onrender.com/api/results/${id}`)
      
      fetchRecentHistory()
      fetchFullHistory()
      
      setMessage({ text: '🗑️ Result deleted.', type: 'success' })
      setPrediction(null)
      localStorage.removeItem('teerPrediction')
      setAnalyticsData(null)
    } catch (error) {
      setMessage({ text: '❌ Error deleting result.', type: 'error' })
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const runPrediction = async () => {
    const COST_PER_RUN = 30; 

    // Check if they need to pay and if they have enough credits
    if (!alreadyPaidToday && credits < COST_PER_RUN) {
      setMessage({ text: '❌ Out of credits! Please contact admin to renew.', type: 'error' })
      return
    }

    try {
      const res = await axios.get('https://teer-api-7erf.onrender.com/api/predict/Shillong')
      setPrediction(res.data)
      localStorage.setItem('teerPrediction', JSON.stringify(res.data))
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTargetDate(tomorrow.toISOString().split('T')[0]);
      
      // Only deduct if they haven't paid today
      if (!alreadyPaidToday) {
        const newCredits = credits - COST_PER_RUN;
        setCredits(newCredits)
        localStorage.setItem('teerCredits', newCredits)
        
        setLastPredictionDate(todayString)
        localStorage.setItem('teerLastPredictionDate', todayString)
        
        setMessage({ text: `🎯 Prediction Generated! (-${COST_PER_RUN} credits)`, type: 'success' })
      } else {
        setMessage({ text: `🎯 Prediction Refreshed! (Free today)`, type: 'success' })
      }
    } catch (error) {
      setMessage({ text: '❌ Error: Need more history data.', type: 'error' })
    }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleSavePrediction = async (e) => {
    e.preventDefault();
    if (!prediction || !targetDate) return;
    
    const allTargets = [
      ...prediction.raw_bait_targets,
      ...prediction.evasion_shields.flatMap(s => s.evasion_hits)
    ];

    try {
      await axios.post('https://teer-api-7erf.onrender.com/api/predictions', {
        city: 'Shillong',
        target_date: targetDate,
        numbers: allTargets.join(',')
      });
      setMessage({ text: '💾 Prediction Archived for Hit Tracking!', type: 'success' });
      
      fetchFullHistory(); 
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
            targetDate={targetDate} setTargetDate={setTargetDate} handleSavePrediction={handleSavePrediction}
            credits={credits} 
            alreadyPaidToday={alreadyPaidToday} // NEW: Pass the status down
          />
        ) : activeTab === 'history' ? (
          <HistoryBook 
            fullHistory={fullHistory} isHistoryLoading={isHistoryLoading} 
            showAllMonths={showAllMonths} setShowAllMonths={setShowAllMonths} handleDelete={handleDelete}
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
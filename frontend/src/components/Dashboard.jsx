import { Shield, Target, AlertCircle, Trash2, Clock } from 'lucide-react'

export default function Dashboard({ 
  date, setDate, fr, setFr, sr, setSr, 
  handleSubmit, recentHistory, handleDelete, 
  prediction, runPrediction, 
  targetDate, setTargetDate, handleSavePrediction,
  credits, alreadyPaidToday // NEW: Added alreadyPaidToday prop
}) {
  
  const cardStyle = { backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }
  const inputStyle = { width: '100%', padding: '0.875rem', borderRadius: '6px', backgroundColor: 'var(--input-bg)', border: '1px solid var(--border-color)', color: 'var(--text-main)', outline: 'none' }
  
  const handleWhatsAppShare = () => {
    if (!prediction || !targetDate) {
      alert("Please generate a prediction and set a target date first!");
      return;
    }
    
    const baitNumbers = prediction.raw_bait_targets.join(', ');
    const shieldNumbers = prediction.evasion_shields.flatMap(s => s.evasion_hits).join(', ');
    
    const message = `🎯 *Teer Engine Predictions* 🎯\n*City:* Shillong\n*Date:* ${targetDate}\n\n🔥 *Direct Targets:*\n${baitNumbers}\n\n🛡️ *Backup/Shields:*\n${shieldNumbers}\n\n🍀 Best of Luck!`;
    
    const whatsappUrl = `https://wa.me/919707551889?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="dashboard-grid">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* ADD RESULT FORM */}
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', color: 'var(--text-main)' }}>
            <Target size={24} color="#2563eb"/> Add Daily Result
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>Date</label>
              <input 
                type="date" 
                required 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                style={inputStyle} 
              />
            </div>
            <div className="form-row">
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>First Round (F/R)</label>
                <input type="number" required min="0" max="99" value={fr} onChange={(e) => setFr(e.target.value)} style={{...inputStyle, fontSize: '1.2rem', textAlign: 'center'}} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>Second Round (S/R)</label>
                <input type="number" required min="0" max="99" value={sr} onChange={(e) => setSr(e.target.value)} style={{...inputStyle, fontSize: '1.2rem', textAlign: 'center'}} />
              </div>
            </div>
            <button type="submit" style={{ padding: '1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>Save Data</button>
          </form>
        </div>

        {/* RECENT DATA */}
        <div style={cardStyle}>
           <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', color: 'var(--text-main)' }}>
            <Clock size={24} color="#10b981"/> Recent Data
          </h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {recentHistory.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>{item.result_date}</span>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>F: <span className="navy-number" style={{animationDelay: '0.1s'}}>{String(item.fr).padStart(2, '0')}</span></span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>S: <span className="navy-number" style={{animationDelay: '0.2s'}}>{String(item.sr).padStart(2, '0')}</span></span>
                  <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} color="#ef4444" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PREDICTION ENGINE */}
      <div style={cardStyle}>
        
        {/* Credit Display */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: credits >= 30 ? 'var(--text-main)' : '#ef4444' }}>
            💳 Credits Remaining: {credits} / 1000
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
            Cost per run: 30 credits
          </span>
        </div>

        <div className="header-layout" style={{ marginBottom: '2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, color: 'var(--text-main)' }}>
            <Shield size={24} color="#8b5cf6"/> Protocol Engine
          </h2>
          
          {/* UPDATED: Run Button with Once-a-day Free check */}
          <button 
            onClick={runPrediction} 
            disabled={!alreadyPaidToday && credits < 30}
            style={{ 
              padding: '0.875rem', 
              width: '100%', 
              maxWidth: '200px', 
              backgroundColor: (!alreadyPaidToday && credits < 30) ? '#888' : '#8b5cf6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontWeight: 'bold', 
              cursor: (!alreadyPaidToday && credits < 30) ? 'not-allowed' : 'pointer', 
              boxShadow: (!alreadyPaidToday && credits < 30) ? 'none' : '0 4px 6px -1px rgba(139, 92, 246, 0.3)' 
            }}
          >
            {alreadyPaidToday ? 'Refresh Targets (Free)' : (!alreadyPaidToday && credits < 30) ? 'Credits Exhausted' : 'Run Targets'}
          </button>
          
          <button 
            onClick={handleWhatsAppShare}
            style={{
              backgroundColor: '#25D366',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginLeft: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            📱 Share to WhatsApp
          </button>
        </div>
        
        {prediction ? (
          <div>
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Raw Bait Targets (Top 20)</h3>
              <div className="targets-grid">
                {prediction.raw_bait_targets.map((num, i) => (
                  <div key={i} style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '0.75rem 0.5rem', borderRadius: '6px', textAlign: 'center' }}>
                    <span className="navy-number" style={{ fontSize: '1.2rem', animationDelay: `${i * 0.02}s` }}>{num}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <AlertCircle size={18} color="#ef4444"/> The Evasion Shield
              </h3>
              {prediction.evasion_shields.map((shield, i) => (
                <div key={i} className="evasion-shield" style={{ backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '900', color: '#ef4444' }}>{shield.bait}</span>
                    <span style={{ color: '#f87171', margin: '0 1rem' }}>➡</span>
                  </div>
                  <div className="shield-hits">
                    {shield.evasion_hits.map((hit, j) => (
                      <span key={j} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', padding: '0.5rem 1rem', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <span className="navy-number" style={{ fontSize: '1.25rem', animationDelay: `${(i * 0.1) + (j * 0.05)}s` }}>{hit}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Archive Prediction Box */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>Archive Targets For Date</label>
                <input 
                  type="date" 
                  required 
                  value={targetDate} 
                  onChange={(e) => setTargetDate(e.target.value)} 
                  style={inputStyle} 
                />
              </div>
              <button onClick={handleSavePrediction} style={{ padding: '0.875rem 1.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}>
                💾 Save to History
              </button>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '3rem 2rem', backgroundColor: 'var(--bg-main)' }}>
            <Shield size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }}/>
            <p style={{ margin: 0, fontSize: '1.1rem' }}>System idle. Awaiting command.</p>
          </div>
        )}
      </div>
    </div>
  )
}
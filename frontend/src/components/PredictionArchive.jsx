import { BookOpen, Calendar, Target } from 'lucide-react'

export default function PredictionArchive({ savedPredictions, fullHistory }) {
  // Sort dates from newest to oldest
  const dates = Object.keys(savedPredictions).sort((a, b) => new Date(b) - new Date(a));

  // Create a quick lookup dictionary for actual results: { "2026-10-22": { fr: "45", sr: "89" } }
  const resultsLookup = {};
  if (fullHistory) {
    Object.values(fullHistory).forEach(monthArray => {
      monthArray.forEach(row => {
        resultsLookup[row.result_date] = {
          fr: String(row.fr).padStart(2, '0'),
          sr: String(row.sr).padStart(2, '0')
        };
      });
    });
  }

  // The style applied to winning numbers
  const hitStyle = { 
    backgroundColor: '#10b981', 
    color: 'white', 
    borderColor: '#059669',
    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)',
    transform: 'scale(1.15)',
    zIndex: 10,
    position: 'relative'
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
        <BookOpen size={32} color="#8b5cf6" />
        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '2rem' }}>Target Archives</h2>
      </div>

      {dates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
          <Target size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No predictions archived yet.</p>
          <p style={{ fontSize: '0.9rem' }}>Generate targets on the Dashboard and click "Save to History" to see them here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {dates.map(date => {
            const actualResult = resultsLookup[date];
            
            return (
              <div key={date} style={{ backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                
                {/* Header with Date and Actual Result (if available) */}
                <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={20} color="#10b981"/> 
                    Targets Saved For: <span style={{ color: '#10b981' }}>{date}</span>
                  </div>
                  
                  {actualResult ? (
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: 'auto', backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      Actual Result: <strong style={{ color: 'var(--text-main)' }}>F({actualResult.fr}) S({actualResult.sr})</strong>
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.9rem', color: '#f59e0b', marginLeft: 'auto' }}>
                      ⏳ Awaiting Results
                    </span>
                  )}
                </h3>
                
                {/* The Numbers Grid */}
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', padding: '0.5rem' }}>
                  {savedPredictions[date].split(',').map((num, i) => {
                    // Check if this number matches the real FR or SR
                    const isHit = actualResult && (num === actualResult.fr || num === actualResult.sr);
                    
                    return (
                      <span key={i} className={isHit ? "" : "navy-number"} style={{ 
                        backgroundColor: 'var(--bg-main)', 
                        padding: '0.75rem 1.25rem', 
                        borderRadius: '8px', 
                        fontSize: '1.25rem',
                        fontWeight: '900',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s ease',
                        ...(isHit ? hitStyle : { color: 'var(--navy-number)', animationDelay: `${i * 0.01}s` }) 
                      }}>
                        {num}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
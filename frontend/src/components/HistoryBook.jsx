import { CalendarDays, Trash2, Target, CheckCircle } from 'lucide-react'

export default function HistoryBook({ fullHistory, isHistoryLoading, showAllMonths, setShowAllMonths, handleDelete, savedPredictions }) {
  const allMonths = Object.keys(fullHistory)
  const visibleMonths = showAllMonths ? allMonths : allMonths.slice(0, 6)

  // A light green glow for Hit Targets
  const hitStyle = { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', boxShadow: 'inset 0 0 0 1px rgba(16, 185, 129, 0.4)' }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', margin: 0, fontSize: '2rem' }}>
          <CalendarDays size={32}/> Historical Data Archive
        </h2>
        {allMonths.length > 6 && (
          <button onClick={() => setShowAllMonths(!showAllMonths)} style={{ padding: '0.75rem 1.5rem', backgroundColor: 'var(--card-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {showAllMonths ? 'Hide Older Data' : `Load Older Data (${allMonths.length - 6} more months)`}
          </button>
        )}
      </div>
      
      {isHistoryLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading historical archive...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {allMonths.length === 0 ? (
            <div style={{ color: 'var(--text-muted)' }}>No data found in database.</div>
          ) : (
            visibleMonths.map((monthGroup) => (
              <div key={monthGroup} style={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem 1.5rem', borderBottom: '2px solid var(--border-color)' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>{monthGroup}</h3>
                </div>
                <div style={{ overflowX: 'auto', padding: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '500px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Date</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>First Round (FR)</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)' }}>Second Round (SR)</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Algorithm Status</th>
                        <th style={{ padding: '0.75rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fullHistory[monthGroup].map((row) => {
                        // --- HIT DETECTION LOGIC ---
                        const predString = savedPredictions[row.result_date];
                        const predArray = predString ? predString.split(',') : [];
                        const frStr = String(row.fr).padStart(2, '0');
                        const srStr = String(row.sr).padStart(2, '0');
                        
                        const isFrHit = predArray.includes(frStr);
                        const isSrHit = predArray.includes(srStr);
                        const isHit = isFrHit || isSrHit;
                        const hasPrediction = predArray.length > 0;

                        return (
                          <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>{row.result_date}</td>
                            
                            {/* Highlight FR if Hit */}
                            <td style={{ padding: '0.75rem', fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-main)', ...(isFrHit ? hitStyle : {}) }}>
                              {frStr}
                            </td>
                            
                            {/* Highlight SR if Hit */}
                            <td style={{ padding: '0.75rem', fontWeight: '900', fontSize: '1.2rem', color: 'var(--text-main)', ...(isSrHit ? hitStyle : {}) }}>
                              {srStr}
                            </td>
                            
                            <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>
                              {!hasPrediction ? (
                                <span style={{ color: 'var(--text-muted)' }}>No Archive</span>
                              ) : isHit ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#10b981', fontWeight: 'bold' }}><CheckCircle size={16}/> Target Hit!</span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#ef4444' }}><Target size={16}/> Missed</span>
                              )}
                            </td>
                            
                            <td style={{ padding: '0.75rem' }}>
                              <button onClick={() => handleDelete(row.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} color="#ef4444" /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
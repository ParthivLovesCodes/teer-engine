import { BarChart3, Flame, Snowflake, Copy, Hash, Crosshair, Star } from 'lucide-react'

// Added prediction to props
export default function Analytics({ analyticsData, prediction }) {
  if (!analyticsData) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading market data...</div>

  const cardStyle = { backgroundColor: 'var(--card-bg)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }
  const highlightCardStyle = { ...cardStyle, border: '2px solid #8b5cf6', backgroundColor: 'var(--bg-main)' }

  // --- NEW: Calculate Big Chances ---
  // Cross-reference V7.0 targets with Hot Houses and Hot Endings
  let bigChances = [];
  if (prediction && prediction.raw_bait_targets) {
    bigChances = prediction.raw_bait_targets.filter(numStr => {
      const num = parseInt(numStr, 10);
      const house = Math.floor(num / 10);
      const ending = num % 10;
      return analyticsData.hot_houses.includes(house) || analyticsData.hot_endings.includes(ending);
    });
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-in' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', marginBottom: '2rem', fontSize: '2rem' }}>
        <BarChart3 size={32} color="#8b5cf6"/> Market Trends (Last {analyticsData.days_analyzed} Days)
      </h2>
      
      {/* THE BIG CHANCES SECTION */}
      {prediction ? (
        <div style={{ ...highlightCardStyle, marginBottom: '2rem' }}>
           <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            <Star size={24} color="#f59e0b" fill="#f59e0b" /> The Big Chances (High-Conviction Targets)
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            These V7.0 generated targets align perfectly with the current hottest Houses and Endings.
          </p>
          
          {bigChances.length > 0 ? (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {bigChances.map((num, i) => (
                <span key={i} className="navy-number" style={{ backgroundColor: '#fef3c7', padding: '0.75rem 1.5rem', borderRadius: '8px', fontSize: '1.5rem', border: '2px solid #f59e0b', color: '#b45309', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.2)' }}>
                  {num}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1rem', backgroundColor: 'var(--card-bg)', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)' }}>
              No overlapping targets today. The algorithm suggests playing it safe.
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px dashed var(--text-muted)', color: 'var(--text-muted)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Crosshair size={20} /> Generate a prediction on the Dashboard to reveal "The Big Chances".
        </div>
      )}

      {/* CORE ANALYTICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        
        {/* Houses & Endings (New!) */}
        <div style={{ ...cardStyle, gridColumn: '1 / -1', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', textTransform: 'uppercase' }}>🔥 Top Houses (10s)</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {analyticsData.hot_houses.map((h, i) => (
                <span key={i} style={{ backgroundColor: '#2563eb', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '1.5rem', fontWeight: 'bold' }}>{h}</span>
              ))}
            </div>
          </div>
          <div style={{ width: '2px', backgroundColor: '#cbd5e1', margin: '0 1rem' }}></div>
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.1rem', textTransform: 'uppercase' }}>🎯 Top Endings (1s)</h3>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {analyticsData.hot_endings.map((e, i) => (
                <span key={i} style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1.25rem', borderRadius: '6px', fontSize: '1.5rem', fontWeight: 'bold' }}>{e}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Hot Numbers */}
        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', textTransform: 'uppercase' }}>
            <Flame size={18} color="#ef4444"/> Hot Numbers
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {analyticsData.hot_numbers.map((num, i) => (
              <span key={i} className="navy-number" style={{ backgroundColor: '#fee2e2', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '1.1rem', border: '1px solid #fca5a5' }}>
                {String(num).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>

        {/* Cold Numbers */}
        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', textTransform: 'uppercase' }}>
            <Snowflake size={18} color="#3b82f6"/> Cold Numbers
          </h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {analyticsData.cold_numbers.map((num, i) => (
              <span key={i} className="navy-number" style={{ backgroundColor: '#eff6ff', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '1.1rem', border: '1px solid #bfdbfe' }}>
                {String(num).padStart(2, '0')}
              </span>
            ))}
          </div>
        </div>

        {/* Jora (Pairs) Trend */}
        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', textTransform: 'uppercase' }}>
            <Copy size={18} color="#f59e0b"/> Jora (Double) Trend
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)' }}>{analyticsData.jora_hits}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>Hits</span>
          </div>
          <div style={{ backgroundColor: 'var(--bg-main)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>
            Hit Rate: <span style={{ color: '#f59e0b' }}>{analyticsData.jora_probability}%</span>
          </div>
        </div>

        {/* Odd/Even Skew */}
        <div style={cardStyle}>
          <h3 style={{ margin: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', textTransform: 'uppercase' }}>
            <Hash size={18} color="#10b981"/> Short-Term FR Skew
          </h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <span style={{ fontSize: '2rem', fontWeight: '900', color: analyticsData.fr_odd_even_skew === 'Odd-Heavy' ? '#8b5cf6' : '#10b981' }}>
              {analyticsData.fr_odd_even_skew}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Last 7 days pull <strong>{analyticsData.odd_percentage}% Odd</strong> in F/R.
          </p>
        </div>

      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const cmToFeetInches = (cm) => {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}"`
}

const statBar = (value) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{
      width: '150px', height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden'
    }}>
      <div style={{
        width: `${value}%`, height: '100%',
        background: value >= 85 ? '#22c55e' : value >= 70 ? '#f59e0b' : '#ef4444',
        borderRadius: '5px'
      }} />
    </div>
    <span style={{ fontWeight: 'bold', minWidth: '28px' }}>{value}</span>
  </div>
)

function FighterProfile({ fighterId, session, onBack }) {
  const [fighter, setFighter] = useState(null)
  const [fightHistory, setFightHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFighter()
  }, [fighterId])

  const fetchFighter = async () => {
    const { data } = await supabase
      .from('fighters')
      .select('*')
      .eq('id', fighterId)
      .single()
    if (data) setFighter(data)

    // Fight history — placeholder until fight simulation is built
    setFightHistory([])
    setLoading(false)
  }

  if (loading) return <p>Loading...</p>
  if (!fighter) return <p>Fighter not found</p>

  const heightDisplay = `${cmToFeetInches(fighter.height_cm)} (${fighter.height_cm} cm)`
  const reachDisplay = `${(fighter.reach_cm / 2.54).toFixed(1)}" (${fighter.reach_cm} cm)`
  const legReachDisplay = `${(fighter.leg_reach_cm / 2.54).toFixed(1)}" (${fighter.leg_reach_cm} cm)`

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px' }}>
      <button onClick={onBack}>← Back</button>

      {/* Header */}
      <div style={{ textAlign: 'center', margin: '24px 0' }}>
        <div style={{ fontSize: '48px' }}>{fighter.flag}</div>
        <h1 style={{ margin: '8px 0' }}>{fighter.name}</h1>
        <p style={{ color: '#666', margin: '4px 0' }}>{fighter.city}, {fighter.country}</p>
        <p style={{ color: '#666', margin: '4px 0' }}>Age: {fighter.age}</p>
        <div style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0' }}>
          {fighter.wins}-{fighter.losses}{fighter.no_contests > 0 ? `-${fighter.no_contests}` : ''}
        </div>
        <p style={{ color: '#888' }}>{fighter.gender === 'women' ? "Women's" : "Men's"} {fighter.weight_class}</p>
        {fighter.ranking === 1 && <span style={{ color: 'gold', fontWeight: 'bold', fontSize: '18px' }}>🏆 Champion</span>}
        {fighter.ranking > 1 && fighter.ranking <= 15 && <span style={{ fontWeight: 'bold' }}>Ranked #{fighter.ranking}</span>}
        {fighter.ranking > 15 && <span style={{ color: '#aaa' }}>Not Ranked</span>}
      </div>

      {/* Physical Stats */}
      <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px' }}>📏 Physical</h3>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr><td style={{ color: '#666', paddingBottom: '6px' }}>Height</td><td style={{ fontWeight: 'bold' }}>{heightDisplay}</td></tr>
            <tr><td style={{ color: '#666', paddingBottom: '6px' }}>Reach</td><td style={{ fontWeight: 'bold' }}>{reachDisplay}</td></tr>
            <tr><td style={{ color: '#666', paddingBottom: '6px' }}>Leg Reach</td><td style={{ fontWeight: 'bold' }}>{legReachDisplay}</td></tr>
            <tr><td style={{ color: '#666', paddingBottom: '6px' }}>Nationality</td><td style={{ fontWeight: 'bold' }}>{fighter.nationality}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Skills */}
      <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px' }}>⚡ Skills — OVR: <span style={{ color: '#2563eb' }}>{fighter.overall}</span></h3>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr><td style={{ color: '#666', paddingBottom: '8px', width: '120px' }}>⚔️ Striking</td><td>{statBar(fighter.striking)}</td></tr>
            <tr><td style={{ color: '#666', paddingBottom: '8px' }}>🤼 Grappling</td><td>{statBar(fighter.grappling)}</td></tr>
            <tr><td style={{ color: '#666', paddingBottom: '8px' }}>👊 Clinch</td><td>{statBar(fighter.clinch)}</td></tr>
            <tr><td style={{ color: '#666', paddingBottom: '8px' }}>🧠 Fight IQ</td><td>{statBar(fighter.fight_iq)}</td></tr>
            <tr><td style={{ color: '#666', paddingBottom: '8px' }}>⚡ Athleticism</td><td>{statBar(fighter.athleticism)}</td></tr>
          </tbody>
        </table>
      </div>

      {/* Fight History */}
      <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
        <h3 style={{ margin: '0 0 12px' }}>📋 Fight History</h3>
        {fightHistory.length === 0 ? (
          <p style={{ color: '#aaa' }}>No fights recorded yet</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ textAlign: 'left', padding: '6px' }}>Result</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Opponent</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Method</th>
                <th style={{ textAlign: 'left', padding: '6px' }}>Round</th>
              </tr>
            </thead>
            <tbody>
              {fightHistory.map((fight, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '6px', color: fight.result === 'W' ? 'green' : fight.result === 'L' ? 'red' : 'orange', fontWeight: 'bold' }}>
                    {fight.result}
                  </td>
                  <td style={{ padding: '6px' }}>{fight.opponent}</td>
                  <td style={{ padding: '6px' }}>{fight.method}</td>
                  <td style={{ padding: '6px' }}>{fight.round}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Potential */}
      <div style={{ background: '#f9f9f9', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ margin: '0 0 8px' }}>🌟 Potential</h3>
        <span style={{
          background: fighter.potential === 'high' ? '#22c55e' : fighter.potential === 'medium' ? '#f59e0b' : '#94a3b8',
          color: 'white', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'capitalize'
        }}>
          {fighter.potential}
        </span>
      </div>
    </div>
  )
}

export default FighterProfile
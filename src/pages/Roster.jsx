import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import FighterProfile from './FighterProfile'

const MEN_CLASSES = [
  'Heavyweight', 'Cruiserweight', 'Light Heavyweight', 'Super Middleweight',
  'Middleweight', 'Super Welterweight', 'Welterweight', 'Super Lightweight',
  'Lightweight', 'Featherweight', 'Bantamweight', 'Flyweight'
]

const WOMEN_CLASSES = [
  'Featherweight', 'Bantamweight', 'Flyweight', 'Strawweight', 'Atomweight'
]

const getRankDisplay = (ranking) => {
  if (ranking === 1) return { label: 'C', style: { color: 'gold', fontWeight: 'bold', fontSize: '18px' } }
  if (ranking <= 15) return { label: `#${ranking}`, style: { fontWeight: 'bold' } }
  return { label: 'NR', style: { color: '#aaa' } }
}

function Roster({ session, onBack }) {
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(true)
  const [gender, setGender] = useState('men')
  const [weightClass, setWeightClass] = useState('Lightweight')
  const [selectedFighterId, setSelectedFighterId] = useState(null)

  const classes = gender === 'men' ? MEN_CLASSES : WOMEN_CLASSES

  useEffect(() => {
    fetchFighters()
  }, [gender, weightClass])

  const fetchFighters = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('fighters')
      .select('*')
      .eq('owner_id', session.user.id)
      .eq('weight_class', weightClass)
      .eq('gender', gender)
      .order('ranking', { ascending: true, nullsFirst: false })

    if (error) console.log('Roster error:', error)
    if (data) setFighters(data)
    setLoading(false)
  }

  if (selectedFighterId) return (
    <FighterProfile
      fighterId={selectedFighterId}
      session={session}
      onBack={() => setSelectedFighterId(null)}
    />
  )

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h1>UMA League</h1>

      <div>
        <button onClick={() => { setGender('men'); setWeightClass('Lightweight') }}
          style={{ fontWeight: gender === 'men' ? 'bold' : 'normal' }}>Men's</button>
        <button onClick={() => { setGender('women'); setWeightClass('Strawweight') }}
          style={{ fontWeight: gender === 'women' ? 'bold' : 'normal' }}>Women's</button>
      </div>

      <div>
        <select value={weightClass} onChange={e => setWeightClass(e.target.value)}>
          {classes.map(wc => <option key={wc}>{wc}</option>)}
        </select>
      </div>

      {loading ? <p>Loading...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid black' }}>
              <th style={{ width: '40px' }}>RNK</th>
              <th style={{ textAlign: 'left' }}>Fighter</th>
              <th>Nat.</th>
              <th>Record</th>
              <th>STR</th>
              <th>GRP</th>
              <th>CLI</th>
              <th>IQ</th>
              <th>ATH</th>
              <th>OVR</th>
            </tr>
          </thead>
          <tbody>
            {fighters.length === 0 ? (
              <tr><td colSpan={10}>No fighters found</td></tr>
            ) : fighters.map((f, i) => {
              const rank = getRankDisplay(f.ranking)
              return (
                <tr key={f.id} style={{
                  background: f.ranking === 1 ? '#fffbe0' : !f.is_ai ? '#e8f4ff' : i % 2 === 0 ? '#fff' : '#f9f9f9',
                  borderBottom: f.ranking === 15 ? '2px dashed #ccc' : 'none'
                }}>
                  <td style={{ textAlign: 'center', ...rank.style }}>{rank.label}</td>
                  <td
                    onClick={() => setSelectedFighterId(f.id)}
                    style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {f.name} {!f.is_ai && '⭐'}
                  </td>
                  <td style={{ textAlign: 'center' }}>{f.flag}</td>
                  <td style={{ textAlign: 'center' }}>{f.wins}-{f.losses}</td>
                  <td style={{ textAlign: 'center' }}>{f.striking}</td>
                  <td style={{ textAlign: 'center' }}>{f.grappling}</td>
                  <td style={{ textAlign: 'center' }}>{f.clinch}</td>
                  <td style={{ textAlign: 'center' }}>{f.fight_iq}</td>
                  <td style={{ textAlign: 'center' }}>{f.athleticism}</td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{f.overall}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Roster
import { useState, useEffect } from 'react'
import { generateCard } from '../lib/cardGenerator'

const positionOrder = ['Main Event', 'Co-Main Event', 'Main Card', 'Prelim']
const positionColors = {
  'Main Event': '#ffd700',
  'Co-Main Event': '#c0c0c0',
  'Main Card': '#fff',
  'Prelim': '#f0f0f0'
}

function FightRow({ fight, index }) {
  const { f1, f2, odds, isTitleFight, division, gender, cardPosition } = fight

  return (
    <div style={{
      background: positionColors[cardPosition],
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
        <span>{cardPosition}</span>
        <span>{gender === 'women' ? "Women's" : "Men's"} {division} {isTitleFight && '🏆 TITLE FIGHT'}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontWeight: 'bold' }}>{f1.flag} {f1.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{f1.wins}-{f1.losses} | #{f1.ranking || 'NR'}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: odds.fighter1Odds.startsWith('-') ? '#cc0000' : '#006600' }}>
            {odds.fighter1Odds}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '0 16px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px' }}>VS</div>
          <div style={{ fontSize: '11px', color: '#999' }}>Hype: {fight.hype}</div>
        </div>

        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold' }}>{f2.flag} {f2.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{f2.wins}-{f2.losses} | #{f2.ranking || 'NR'}</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: odds.fighter2Odds.startsWith('-') ? '#cc0000' : '#006600' }}>
            {odds.fighter2Odds}
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ session, onBack }) {
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buildCard()
  }, [])

  const buildCard = async () => {
    setLoading(true)
    const fights = await generateCard(session.user.id)
    setCard(fights)
    setLoading(false)
  }

  if (loading) return (
    <div>
      <button onClick={onBack}>← Back</button>
      <p>Building card...</p>
    </div>
  )

  const mainCard = card.filter(f => f.cardPosition === 'Main Event' || f.cardPosition === 'Co-Main Event' || f.cardPosition === 'Main Card')
  const prelims = card.filter(f => f.cardPosition === 'Prelim')

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h1>🥊 UMA Fight Night</h1>
      <button onClick={buildCard}>🔄 Generate New Card</button>

      <h2 style={{ borderBottom: '2px solid gold', paddingBottom: '4px' }}>Main Card</h2>
      {mainCard.map((fight, i) => (
        <FightRow key={i} fight={fight} index={i} />
      ))}

      <h2 style={{ borderBottom: '2px solid #ccc', paddingBottom: '4px', marginTop: '24px' }}>Prelims</h2>
      {prelims.map((fight, i) => (
        <FightRow key={i} fight={fight} index={i} />
      ))}
    </div>
  )
}

export default Card
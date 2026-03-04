import { useState } from 'react'
import { supabase } from '../lib/supabase'

const MEN_CLASSES = [
  'Heavyweight', 'Light Heavyweight', 'Middleweight', 'Welterweight',
  'Lightweight', 'Featherweight', 'Bantamweight', 'Flyweight',
  'Strawweight', 'Atomweight'
]

const WOMEN_CLASSES = [
  'Featherweight', 'Bantamweight', 'Flyweight', 'Strawweight', 'Atomweight'
]

const STYLES = ['Striker', 'Wrestler', 'BJJ', 'Muay Thai', 'Boxer', 'Kickboxer', 'Grappler', 'All-Rounder']

const STAT_BUDGET = 250
const BASE_COST = 10000
const POTENTIAL_COSTS = { low: 0, medium: 2000, high: 5000, elite: 10000 }

function FighterCreator({ session, onBack }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('men')
  const [weightClass, setWeightClass] = useState(MEN_CLASSES[0])
  const [style, setStyle] = useState(STYLES[0])
  const [potential, setPotential] = useState('low')
  const [stats, setStats] = useState({
    striking: 50,
    grappling: 50,
    cardio: 50,
    chin: 50
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const classes = gender === 'men' ? MEN_CLASSES : WOMEN_CLASSES
  const totalSpent = Object.values(stats).reduce((a, b) => a + b, 0)
  const remaining = STAT_BUDGET - totalSpent
  const fighterCost = BASE_COST + POTENTIAL_COSTS[potential]

  const handleGender = (g) => {
    setGender(g)
    setWeightClass(g === 'men' ? MEN_CLASSES[0] : WOMEN_CLASSES[0])
  }

  const handleStat = (stat, value) => {
    const newVal = parseInt(value)
    const otherStats = totalSpent - stats[stat]
    if (otherStats + newVal <= STAT_BUDGET) {
      setStats({ ...stats, [stat]: newVal })
    }
  }

  const handleCreate = async () => {
    if (!name) return setError('Give your fighter a name!')
    if (remaining < 0) return setError('Over stat budget!')

    setSaving(true)
    setError(null)

    const { data: profile } = await supabase
      .from('profiles')
      .select('rebirth_points')
      .eq('id', session.user.id)
      .single()

    if (profile.rebirth_points < fighterCost) {
      setError(`Not enough RBs! Need ${fighterCost}, have ${profile.rebirth_points}`)
      setSaving(false)
      return
    }

    const { error: fighterError } = await supabase
      .from('fighters')
      .insert({
        owner_id: session.user.id,
        name,
        weight_class: weightClass,
        style,
        striking: stats.striking,
        grappling: stats.grappling,
        cardio: stats.cardio,
        chin: stats.chin,
        cost: fighterCost,
        value: fighterCost,
        potential,
        gender
      })

    if (fighterError) {
      setError(fighterError.message)
      setSaving(false)
      return
    }

    await supabase
      .from('profiles')
      .update({ rebirth_points: profile.rebirth_points - fighterCost })
      .eq('id', session.user.id)

    setSaving(false)
    onBack()
  }

  return (
    <div>
      <button onClick={onBack}>← Back</button>
      <h1>Create Fighter</h1>

      <div>
        <label>Division</label><br />
        <button onClick={() => handleGender('men')} style={{ fontWeight: gender === 'men' ? 'bold' : 'normal' }}>Men's</button>
        <button onClick={() => handleGender('women')} style={{ fontWeight: gender === 'women' ? 'bold' : 'normal' }}>Women's</button>
      </div>

      <div>
        <label>Name</label><br />
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Fighter name"
        />
      </div>

      <div>
        <label>Weight Class</label><br />
        <select value={weightClass} onChange={e => setWeightClass(e.target.value)}>
          {classes.map(wc => <option key={wc}>{wc}</option>)}
        </select>
      </div>

      <div>
        <label>Style</label><br />
        <select value={style} onChange={e => setStyle(e.target.value)}>
          {STYLES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label>Potential</label><br />
        {Object.entries(POTENTIAL_COSTS).map(([p, cost]) => (
          <button
            key={p}
            onClick={() => setPotential(p)}
            style={{ fontWeight: potential === p ? 'bold' : 'normal' }}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)} {cost > 0 ? `(+${cost} RBs)` : '(free)'}
          </button>
        ))}
      </div>

      <h3>Stats — Points remaining: {remaining}</h3>
      {Object.entries(stats).map(([stat, val]) => (
        <div key={stat}>
          <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}: {val}</label><br />
          <input
            type="range"
            min={10}
            max={100}
            value={val}
            onChange={e => handleStat(stat, e.target.value)}
          />
        </div>
      ))}

      <p>Total Cost: <strong>{fighterCost} RBs</strong></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleCreate} disabled={saving}>
        {saving ? 'Creating...' : `Create Fighter (-${fighterCost} RBs)`}
      </button>
    </div>
  )
}

export default FighterCreator
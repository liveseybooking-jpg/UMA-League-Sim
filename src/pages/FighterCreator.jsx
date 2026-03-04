import { useState } from 'react'
import { supabase } from '../lib/supabase'

const WEIGHT_CLASSES = [
  'Atomweight', 'Strawweight', 'Flyweight', 'Bantamweight',
  'Featherweight', 'Lightweight', 'Welterweight', 'Middleweight',
  'Light Heavyweight', 'Heavyweight'
]

const STYLES = ['Striker', 'Wrestler', 'BJJ', 'Muay Thai', 'Boxer', 'Kickboxer', 'Grappler', 'All-Rounder']

const STAT_BUDGET = 250
const BASE_COST = 10000

function FighterCreator({ session, onBack }) {
  const [name, setName] = useState('')
  const [weightClass, setWeightClass] = useState(WEIGHT_CLASSES[0])
  const [style, setStyle] = useState(STYLES[0])
  const [stats, setStats] = useState({
    striking: 50,
    grappling: 50,
    cardio: 50,
    chin: 50
  })
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const totalSpent = Object.values(stats).reduce((a, b) => a + b, 0)
  const remaining = STAT_BUDGET - totalSpent
  const fighterCost = BASE_COST

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

    // Check RB balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('rebirth_points')
      .eq('id', session.user.id)
      .single()

    if (profile.rebirth_points < fighterCost) {
      setError('Not enough RBs!')
      setSaving(false)
      return
    }

    // Create fighter
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
        value: fighterCost
      })

    if (fighterError) {
      setError(fighterError.message)
      setSaving(false)
      return
    }

    // Deduct RBs
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
      <p>Cost: {fighterCost} RBs</p>

      <div>
        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Fighter name"
        />
      </div>

      <div>
        <label>Weight Class</label>
        <select value={weightClass} onChange={e => setWeightClass(e.target.value)}>
          {WEIGHT_CLASSES.map(wc => <option key={wc}>{wc}</option>)}
        </select>
      </div>

      <div>
        <label>Style</label>
        <select value={style} onChange={e => setStyle(e.target.value)}>
          {STYLES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <h3>Stats — Points remaining: {remaining}</h3>
      {Object.entries(stats).map(([stat, val]) => (
        <div key={stat}>
          <label>{stat.charAt(0).toUpperCase() + stat.slice(1)}: {val}</label>
          <input
            type="range"
            min={10}
            max={100}
            value={val}
            onChange={e => handleStat(stat, e.target.value)}
          />
        </div>
      ))}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleCreate} disabled={saving}>
        {saving ? 'Creating...' : `Create Fighter (-${fighterCost} RBs)`}
      </button>
    </div>
  )
}

export default FighterCreator
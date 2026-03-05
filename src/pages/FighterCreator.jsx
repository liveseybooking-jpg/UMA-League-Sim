import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import WeightClassSelector, { MEN_CLASSES, WOMEN_CLASSES } from '../components/fighter/WeightClassSelector'
import PhysicalSliders, { getReachCost } from '../components/fighter/PhysicalSliders'
import StatSliders from '../components/fighter/StatSliders'
import PotentialSelector, { POTENTIAL_COSTS } from '../components/fighter/PotentialSelector'

const REACH_RATIO = 1.0
const LEG_REACH_RATIO = 0.497
const BASE_COST = 10000
const STYLES = ['Striker', 'Wrestler', 'BJJ', 'Muay Thai', 'Boxer', 'Kickboxer', 'Grappler', 'All-Rounder']

const getDefaults = (wc) => ({
  height: wc.avgHeight,
  reach: Math.round(wc.avgHeight * REACH_RATIO),
  legReach: Math.round(wc.avgHeight * LEG_REACH_RATIO),
})

function FighterCreator({ session, isGuest, guestData, onGuestCreate, onBack }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('men')
  const [weightClassIndex, setWeightClassIndex] = useState(0)
  const [style, setStyle] = useState(STYLES[0])
  const [potential, setPotential] = useState('low')
  const [stats, setStats] = useState({ striking: 50, wrestling: 50, ground_game: 50, clinch: 50, fight_iq: 50, athleticism: 50 })
const [statCost, setStatCost] = useState(0)
  const [physicals, setPhysicals] = useState({ height: 177, reach: 177, legReach: 88 })
  const [units, setUnits] = useState('imperial')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const classes = gender === 'men' ? MEN_CLASSES : WOMEN_CLASSES
  const currentClass = classes[weightClassIndex]
  const avgReach = Math.round(currentClass.avgHeight * REACH_RATIO)
  const avgLegReach = Math.round(currentClass.avgHeight * LEG_REACH_RATIO)

  useEffect(() => {
    if (!isGuest && session) {
      supabase.from('profiles').select('unit_system').eq('id', session.user.id).single()
        .then(({ data }) => { if (data) setUnits(data.unit_system || 'imperial') })
    }
  }, [])

  useEffect(() => {
    const defaults = getDefaults(currentClass)
    setPhysicals({ height: defaults.height, reach: defaults.reach, legReach: defaults.legReach })
  }, [weightClassIndex, gender])

  const reachCost = getReachCost(physicals.reach, avgReach, physicals.legReach, avgLegReach)
  const fighterCost = BASE_COST + POTENTIAL_COSTS[potential] + reachCost + statCost

  const handleGender = (g) => {
    setGender(g)
    setWeightClassIndex(0)
  }

  const handleCreate = async () => {
    if (!name) return setError('Give your fighter a name!')

    setSaving(true)
    setError(null)

    const fighter = {
      name,
      weight_class: currentClass.name,
      style,
      striking: stats.striking,
      grappling: stats.grappling,
      cardio: stats.cardio,
      chin: stats.chin,
      cost: fighterCost,
      value: fighterCost,
      potential,
      gender,
      height_cm: physicals.height,
      reach_cm: physicals.reach,
      leg_reach_cm: physicals.legReach,
      wins: 0,
      losses: 0
    }

    if (isGuest) {
      if (guestData.rebirth_points < fighterCost) {
        setError(`Not enough RBs! Need ${fighterCost}, have ${guestData.rebirth_points}`)
        setSaving(false)
        return
      }
      onGuestCreate(fighter)
      return
    }

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
      .insert({ ...fighter, owner_id: session.user.id })

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
        <label>Units</label><br />
        <button onClick={() => setUnits('imperial')} style={{ fontWeight: units === 'imperial' ? 'bold' : 'normal' }}>🇺🇸 Imperial</button>
        <button onClick={() => setUnits('metric')} style={{ fontWeight: units === 'metric' ? 'bold' : 'normal' }}>🌍 Metric</button>
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

      <WeightClassSelector
        gender={gender}
        weightClassIndex={weightClassIndex}
        setWeightClassIndex={setWeightClassIndex}
        units={units}
      />

      <div>
        <label>Style</label><br />
        <select value={style} onChange={e => setStyle(e.target.value)}>
          {STYLES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <PotentialSelector potential={potential} setPotential={setPotential} />

      <PhysicalSliders
        physicals={physicals}
        setPhysicals={setPhysicals}
        currentClass={currentClass}
        avgReach={avgReach}
        avgLegReach={avgLegReach}
        units={units}
      />

      <StatSliders stats={stats} setStats={setStats} />

      <p>Total Cost: <strong>{fighterCost} RBs</strong></p>
      {reachCost > 0 && <p style={{ color: 'orange' }}>Reach/Leg Reach premium: +{reachCost} RBs</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleCreate} disabled={saving}>
        {saving ? 'Creating...' : `Create Fighter (-${fighterCost} RBs)`}
      </button>
    </div>
  )
}

export default FighterCreator
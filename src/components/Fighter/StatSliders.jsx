const BASE_STAT = 50
const BASE_COST_PER_POINT = 100

export const calcStatCost = (val) => {
  if (val === BASE_STAT) return 0
  if (val > BASE_STAT) {
    // Above 50: scaling cost gets more expensive
    let cost = 0
    for (let i = BASE_STAT; i < val; i++) {
      cost += Math.round(BASE_COST_PER_POINT * (i / BASE_STAT))
    }
    return cost
  } else {
    // Below 50: scaling refund gets cheaper as you go lower
    let refund = 0
    for (let i = val; i < BASE_STAT; i++) {
      refund += Math.round(BASE_COST_PER_POINT * (i / BASE_STAT))
    }
    return -refund
  }
}

export const totalStatCost = (stats) => {
  return Object.values(stats).reduce((total, val) => {
    return total + calcStatCost(val)
  }, 0)
}

const STATS = [
  { key: 'striking', label: '⚔️ Striking' },
  { key: 'grappling', label: '🤼 Grappling' },
  { key: 'clinch', label: '👊 Clinch' },
  { key: 'fight_iq', label: '🧠 Fight IQ' },
  { key: 'athleticism', label: '⚡ Athleticism' },
]

function StatSliders({ stats, setStats, onCostChange }) {
  const handleStat = (key, newVal) => {
    const updated = { ...stats, [key]: parseInt(newVal) }
    setStats(updated)
    if (onCostChange) onCostChange(totalStatCost(updated))
  }

  return (
    <div>
      <h3>Stats</h3>
      {STATS.map(({ key, label }) => {
        const cost = calcStatCost(stats[key])
        return (
          <div key={key}>
            <label>
              {label}: {stats[key]}
              {cost > 0 && <span style={{ color: 'orange' }}> +{cost} RBs</span>}
              {cost < 0 && <span style={{ color: 'green' }}> {cost} RBs</span>}
            </label><br />
            <input
              type="range"
              min={1}
              max={100}
              value={stats[key]}
              onChange={e => handleStat(key, e.target.value)}
            />
          </div>
        )
      })}
    </div>
  )
}

export default StatSliders
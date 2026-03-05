const BASE_STAT = 50
const BASE_COST = 100

const STATS = [
  { key: 'striking', label: '⚔️ Striking' },
  { key: 'wrestling', label: '🤼 Wrestling' },
  { key: 'ground_game', label: '🥊 Ground Game' },
  { key: 'clinch', label: '👊 Clinch' },
  { key: 'fight_iq', label: '🧠 Fight IQ' },
  { key: 'athleticism', label: '⚡ Athleticism' },
]

export const calcStatCost = (fromVal, toVal) => {
  let cost = 0
  for (let i = fromVal; i < toVal; i++) {
    cost += Math.round(BASE_COST * (i / BASE_STAT))
  }
  return cost
}

export const totalStatCost = (stats) => {
  return Object.values(stats).reduce((total, val) => {
    return total + calcStatCost(BASE_STAT, val)
  }, 0)
}

function StatSliders({ stats, setStats, onCostChange }) {
  const handleStat = (key, newVal) => {
    const updated = { ...stats, [key]: parseInt(newVal) }
    setStats(updated)
    onCostChange(totalStatCost(updated))
  }

  return (
    <div>
      <h3>Stats</h3>
      {STATS.map(({ key, label }) => (
        <div key={key}>
          <label>
            {label}: {stats[key]}
            {stats[key] > BASE_STAT && (
              <span style={{ color: 'orange' }}>
                {' '}(+{calcStatCost(BASE_STAT, stats[key])} RBs)
              </span>
            )}
          </label><br />
          <input
            type="range"
            min={BASE_STAT}
            max={100}
            value={stats[key]}
            onChange={e => handleStat(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}

export default StatSliders
const POTENTIAL_COSTS = { low: 0, medium: 2000, high: 5000, elite: 10000 }

export { POTENTIAL_COSTS }

function PotentialSelector({ potential, setPotential }) {
  return (
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
  )
}

export default PotentialSelector
const REACH_COST_PER_CM = 150
const HEIGHT_COST_PER_CM = 100

export const cmToFeetInches = (cm) => {
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = (totalInches % 12).toFixed(1)
  return `${feet}'${inches}"`
}

export const displayMeasurement = (cm, units) =>
  units === 'metric' ? `${cm} cm` : cmToFeetInches(cm)

export const displayReach = (cm, units) =>
  units === 'metric' ? `${cm} cm` : `${(cm / 2.54).toFixed(1)}"`

export const getDeviance = (value, avg) =>
  (((value - avg) / avg) * 100).toFixed(1)

export const getPhysicalCost = (height, avgHeight, reach, avgReach, legReach, avgLegReach) => {
  const heightCost = (height - avgHeight) * HEIGHT_COST_PER_CM
  const reachCost = (reach - avgReach) * REACH_COST_PER_CM
  const legCost = (legReach - avgLegReach) * REACH_COST_PER_CM
  return heightCost + reachCost + legCost
}

export const getReachCost = getPhysicalCost

function PhysicalSliders({ physicals, setPhysicals, currentClass, avgReach, avgLegReach, units }) {
  const handlePhysical = (key, value) => {
    setPhysicals({ ...physicals, [key]: parseInt(value) })
  }

  const heightDev = getDeviance(physicals.height, currentClass.avgHeight)
  const reachDev = getDeviance(physicals.reach, avgReach)
  const legDev = getDeviance(physicals.legReach, avgLegReach)

  const heightCost = (physicals.height - currentClass.avgHeight) * HEIGHT_COST_PER_CM
  const reachCost = (physicals.reach - avgReach) * REACH_COST_PER_CM
  const legCost = (physicals.legReach - avgLegReach) * REACH_COST_PER_CM

  const formatCost = (val) => {
    if (val > 0) return <span style={{ color: 'orange' }}> +{val} RBs</span>
    if (val < 0) return <span style={{ color: 'green' }}> {val} RBs</span>
    return null
  }

  return (
    <div>
      <h3>Physical Attributes</h3>

      <div>
        <label>
          Height: {displayMeasurement(physicals.height, units)} ({heightDev > 0 ? '+' : ''}{heightDev}% vs avg)
          {formatCost(heightCost)}
        </label><br />
        <input
          type="range"
          min={currentClass.avgHeight - 15}
          max={currentClass.avgHeight + 15}
          value={physicals.height}
          onChange={e => handlePhysical('height', e.target.value)}
        />
      </div>

      <div>
        <label>
          Reach: {displayReach(physicals.reach, units)} ({reachDev > 0 ? '+' : ''}{reachDev}% vs avg)
          {formatCost(reachCost)}
        </label><br />
        <input
          type="range"
          min={avgReach - 15}
          max={avgReach + 15}
          value={physicals.reach}
          onChange={e => handlePhysical('reach', e.target.value)}
        />
      </div>

      <div>
        <label>
          Leg Reach: {displayReach(physicals.legReach, units)} ({legDev > 0 ? '+' : ''}{legDev}% vs avg)
          {formatCost(legCost)}
        </label><br />
        <input
          type="range"
          min={avgLegReach - 10}
          max={avgLegReach + 10}
          value={physicals.legReach}
          onChange={e => handlePhysical('legReach', e.target.value)}
        />
      </div>
    </div>
  )
}

export default PhysicalSliders
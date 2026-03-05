const REACH_COST_PER_CM = 200

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

export const getReachCost = (reach, avgReach, legReach, avgLegReach) => {
  const reachDiff = Math.max(0, reach - avgReach)
  const legDiff = Math.max(0, legReach - avgLegReach)
  return (reachDiff + legDiff) * REACH_COST_PER_CM
}

function PhysicalSliders({ physicals, setPhysicals, currentClass, avgReach, avgLegReach, units }) {
  const handlePhysical = (key, value) => {
    setPhysicals({ ...physicals, [key]: parseInt(value) })
  }

  const heightDev = getDeviance(physicals.height, currentClass.avgHeight)
  const reachDev = getDeviance(physicals.reach, avgReach)
  const legDev = getDeviance(physicals.legReach, avgLegReach)
  const reachExtra = Math.max(0, physicals.reach - avgReach) * REACH_COST_PER_CM
  const legExtra = Math.max(0, physicals.legReach - avgLegReach) * REACH_COST_PER_CM

  return (
    <div>
      <h3>Physical Attributes</h3>

      <div>
        <label>
          Height: {displayMeasurement(physicals.height, units)} ({heightDev > 0 ? '+' : ''}{heightDev}% vs avg)
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
          {reachExtra > 0 && <span style={{ color: 'orange' }}> +{reachExtra} RBs</span>}
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
          {legExtra > 0 && <span style={{ color: 'orange' }}> +{legExtra} RBs</span>}
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
export const MEN_CLASSES = [
  { name: 'Heavyweight', lbs: '206-265', kg: '94-120', avgHeight: 189 },
  { name: 'Light Heavyweight', lbs: '186-205', kg: '85-93', avgHeight: 186 },
  { name: 'Middleweight', lbs: '171-185', kg: '78-84', avgHeight: 184 },
  { name: 'Welterweight', lbs: '156-170', kg: '71-77', avgHeight: 180 },
  { name: 'Lightweight', lbs: '146-155', kg: '67-70', avgHeight: 177 },
  { name: 'Featherweight', lbs: '136-145', kg: '62-66', avgHeight: 176 },
  { name: 'Bantamweight', lbs: '126-135', kg: '58-61', avgHeight: 171 },
  { name: 'Flyweight', lbs: '116-125', kg: '53-57', avgHeight: 168 },
  { name: 'Strawweight', lbs: '106-115', kg: '49-52', avgHeight: 163 },
  { name: 'Atomweight', lbs: '105 & under', kg: '48 & under', avgHeight: 157 },
]

export const WOMEN_CLASSES = [
  { name: 'Featherweight', lbs: '136-145', kg: '62-66', avgHeight: 174 },
  { name: 'Bantamweight', lbs: '126-135', kg: '58-61', avgHeight: 170 },
  { name: 'Flyweight', lbs: '116-125', kg: '53-57', avgHeight: 168 },
  { name: 'Strawweight', lbs: '106-115', kg: '49-52', avgHeight: 160 },
  { name: 'Atomweight', lbs: '105 & under', kg: '48 & under', avgHeight: 155 },
]

function WeightClassSelector({ gender, weightClassIndex, setWeightClassIndex, units }) {
  const classes = gender === 'men' ? MEN_CLASSES : WOMEN_CLASSES

  return (
    <div>
      <label>Weight Class</label><br />
      <select
        value={weightClassIndex}
        onChange={e => setWeightClassIndex(parseInt(e.target.value))}
      >
        {classes.map((wc, i) => (
          <option key={wc.name} value={i}>
            {wc.name} ({units === 'metric' ? `${wc.kg} kg` : `${wc.lbs} lbs`})
          </option>
        ))}
      </select>
    </div>
  )
}

export default WeightClassSelector
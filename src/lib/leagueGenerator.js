import { supabase } from './supabase'
import { generateName } from './fighterNames'

const MEN_CLASSES = [
  { name: 'Heavyweight', avgHeight: 189 },
  { name: 'Light Heavyweight', avgHeight: 186 },
  { name: 'Middleweight', avgHeight: 184 },
  { name: 'Welterweight', avgHeight: 180 },
  { name: 'Lightweight', avgHeight: 177 },
  { name: 'Featherweight', avgHeight: 176 },
  { name: 'Bantamweight', avgHeight: 171 },
  { name: 'Flyweight', avgHeight: 168 },
  { name: 'Strawweight', avgHeight: 163 },
  { name: 'Atomweight', avgHeight: 157 },
]

const WOMEN_CLASSES = [
  { name: 'Featherweight', avgHeight: 174 },
  { name: 'Bantamweight', avgHeight: 170 },
  { name: 'Flyweight', avgHeight: 168 },
  { name: 'Strawweight', avgHeight: 160 },
  { name: 'Atomweight', avgHeight: 155 },
]

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const generateRecord = (rating) => {
  const fights = randomBetween(0, 25)
  const winRate = 0.3 + (rating / 100) * 0.6
  const wins = Math.round(fights * winRate)
  const losses = fights - wins
  return { wins, losses }
}

const generateFighter = (wc, gender, rank, userId) => {
  const rating = Math.max(40, 95 - (rank * 2) + randomBetween(-5, 5))
  const { wins, losses } = generateRecord(rating)
  const height = wc.avgHeight + randomBetween(-10, 10)
  const reach = Math.round(height * 1.0) + randomBetween(-5, 5)
  const legReach = Math.round(height * 0.497) + randomBetween(-3, 3)
  const statBase = Math.max(40, rating - randomBetween(0, 15))
  const potentials = ['low', 'low', 'medium', 'medium', 'high']
  const { name, flag, nationality } = generateName(wc.name, gender)

  return {
    owner_id: userId,
    name,
    flag,
    nationality,
    weight_class: wc.name,
    gender,
    is_ai: true,
    ranking: rank,
    striking: Math.min(99, statBase + randomBetween(-10, 10)),
    wrestling: Math.min(99, statBase + randomBetween(-10, 10)),
    ground_game: Math.min(99, statBase + randomBetween(-10, 10)),
    clinch: Math.min(99, statBase + randomBetween(-10, 10)),
    fight_iq: Math.min(99, statBase + randomBetween(-10, 10)),
    athleticism: Math.min(99, statBase + randomBetween(-10, 10)),
    height_cm: height,
    reach_cm: reach,
    leg_reach_cm: legReach,
    wins,
    losses,
    potential: potentials[randomBetween(0, 4)],
    cost: 0,
    value: Math.round(rating * 500),
    status: 'active'
  }
}

export const generateLeague = async (userId) => {
  const fighters = []

  for (const wc of MEN_CLASSES) {
    for (let rank = 1; rank <= 30; rank++) {
      fighters.push(generateFighter(wc, 'men', rank, userId))
    }
  }

  for (const wc of WOMEN_CLASSES) {
    for (let rank = 1; rank <= 30; rank++) {
      fighters.push(generateFighter(wc, 'women', rank, userId))
    }
  }

  const batchSize = 50
  for (let i = 0; i < fighters.length; i += batchSize) {
    const batch = fighters.slice(i, i + batchSize)
    const { error } = await supabase.from('fighters').insert(batch)
    if (error) console.error('Error inserting fighters:', error)
  }

  console.log(`Generated ${fighters.length} AI fighters!`)
  return fighters.length
}
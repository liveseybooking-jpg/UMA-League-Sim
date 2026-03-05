import { supabase } from './supabase'
import { generateName } from './fighterNames'

const MEN_CLASSES = [
  { name: 'Heavyweight', avgHeight: 189 },
  { name: 'Cruiserweight', avgHeight: 187 },
  { name: 'Light Heavyweight', avgHeight: 186 },
  { name: 'Super Middleweight', avgHeight: 185 },
  { name: 'Middleweight', avgHeight: 184 },
  { name: 'Super Welterweight', avgHeight: 181 },
  { name: 'Welterweight', avgHeight: 180 },
  { name: 'Super Lightweight', avgHeight: 178 },
  { name: 'Lightweight', avgHeight: 177 },
  { name: 'Featherweight', avgHeight: 176 },
  { name: 'Bantamweight', avgHeight: 171 },
  { name: 'Flyweight', avgHeight: 168 },
]

const WOMEN_CLASSES = [
  { name: 'Featherweight', avgHeight: 174 },
  { name: 'Bantamweight', avgHeight: 170 },
  { name: 'Flyweight', avgHeight: 168 },
  { name: 'Strawweight', avgHeight: 160 },
  { name: 'Atomweight', avgHeight: 155 },
]

const DIVISION_SIZES = {
  men: {
    'Heavyweight': 55,
    'Cruiserweight': 50,
    'Light Heavyweight': 60,
    'Super Middleweight': 55,
    'Middleweight': 65,
    'Super Welterweight': 60,
    'Welterweight': 80,
    'Super Lightweight': 70,
    'Lightweight': 85,
    'Featherweight': 70,
    'Bantamweight': 65,
    'Flyweight': 55,
  },
  women: {
    'Featherweight': 20,
    'Bantamweight': 35,
    'Flyweight': 30,
    'Strawweight': 35,
    'Atomweight': 25,
  }
}

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

const generateRecord = (rank, avgStat) => {
  // Stat-based modifiers
  const isElite = avgStat >= 88      // Jones/GSP/Silva tier
  const isSolid = avgStat >= 75      // reliable UFC vet
  const isGreen = avgStat < 55       // newcomer/journeyman

  // Total fights — veterans can have huge fight counts at any rank
  let minFights, maxFights
  if (rank === 1) {
    minFights = isElite ? 14 : 12
    maxFights = isElite ? 32 : 26
  } else if (rank <= 5) {
    minFights = isElite ? 12 : 8
    maxFights = isElite ? 30 : 24
  } else if (rank <= 15) {
    minFights = 6
    maxFights = isElite ? 28 : 22
  } else if (rank <= 30) {
    minFights = 3
    maxFights = isGreen ? 8 : 20
  } else {
    // Deep NR — journeymen, veterans, newcomers
    minFights = 1
    maxFights = isGreen ? 6 : 18
  }

  // Veteran roll — any fighter can randomly be a high volume vet
  const isVeteran = Math.random() < 0.12 // 12% chance of 35-50 fight career
  const total = isVeteran && rank > 5
    ? randomBetween(35, 50)
    : randomBetween(minFights, maxFights)

  // Undefeated chance — heavily stat based
  const undefeatedChance = isElite
    ? (rank === 1 ? 0.20 : rank <= 3 ? 0.30 : rank <= 5 ? 0.15 : rank <= 10 ? 0.08 : 0.03)
    : (rank <= 3 ? 0.08 : rank <= 5 ? 0.04 : 0.01)

  if (Math.random() < undefeatedChance) {
    return { wins: total, losses: 0 }
  }

  // Win rate — heavily influenced by stats
  let baseWinRate
  if (isElite) {
    baseWinRate = rank === 1 ? 0.88 : rank <= 5 ? 0.82 : rank <= 15 ? 0.74 : 0.65
  } else if (isSolid) {
    baseWinRate = rank === 1 ? 0.80 : rank <= 5 ? 0.74 : rank <= 15 ? 0.65 : 0.55
  } else if (isGreen) {
    baseWinRate = rank <= 15 ? 0.58 : 0.42
  } else {
    baseWinRate = rank === 1 ? 0.76 : rank <= 5 ? 0.70 : rank <= 15 ? 0.61 : 0.50
  }

  // Add random variance — Aspinall 15-3 vs Makhachev 28-1 both valid for champ
  const variance = (Math.random() - 0.5) * 0.12
  const winRate = Math.min(0.97, Math.max(0.35, baseWinRate + variance))
  const wins = Math.min(total, Math.round(total * winRate))

  return { wins, losses: total - wins }
}

const generateFighter = (wc, gender, rank, userId) => {
  const rating = Math.round(Math.max(55, 97 - (rank * 0.8) + randomBetween(-4, 4)))
  const height = Math.round(wc.avgHeight + randomBetween(-10, 10))
  const reach = Math.round(height) + randomBetween(-5, 5)
  const legReach = Math.round(height * 0.497) + randomBetween(-3, 3)
  const statBase = Math.round(Math.max(52, rating - randomBetween(0, 8)))
  const potentials = ['low', 'low', 'medium', 'medium', 'high']
  const { name, flag, nationality, city, country } = generateName(wc.name, gender)

  const statVariance = rank > 30 ? 12 : rank > 15 ? 10 : 7
  const statFloor = rank > 30 ? 52 : rank > 15 ? 58 : 63
  const randStat = () => Math.round(Math.min(99, Math.max(statFloor, statBase + randomBetween(-statVariance, statVariance))))

  const stats = {
    striking: randStat(),
    grappling: randStat(),
    clinch: randStat(),
    fight_iq: randStat(),
    athleticism: randStat(),
  }

  if (Math.random() < 0.35) {
    const keys = Object.keys(stats)
    const speciality = keys[randomBetween(0, keys.length - 1)]
    stats[speciality] = Math.round(Math.min(99, stats[speciality] + randomBetween(6, 14)))
  }

  const overall = Math.round(Object.values(stats).reduce((a, b) => a + b, 0) / 5)
  const { wins, losses } = generateRecord(rank, overall)

  // Age: champ/top 5 tend to be prime (26-33), deep NR can be prospects or veterans
  const age = rank === 1 ? randomBetween(27, 34) :
    rank <= 5 ? randomBetween(25, 33) :
    rank <= 15 ? randomBetween(23, 35) :
    rank <= 30 ? randomBetween(22, 36) :
    randomBetween(20, 38)

  return {
    owner_id: userId,
    name,
    flag,
    nationality,
    city,
    country,
    age,
    weight_class: wc.name,
    gender,
    is_ai: true,
    ranking: rank,
    overall,
    ...stats,
    height_cm: height,
    reach_cm: reach,
    leg_reach_cm: legReach,
    wins,
    losses,
    no_contests: 0,
    potential: potentials[randomBetween(0, 4)],
    style: 'None',
    cost: 0,
    value: Math.round(overall * 500),
    status: 'active'
  }
}

export const generateLeague = async (userId) => {
  await supabase.from('fighters').delete().eq('owner_id', userId).eq('is_ai', true)

  const fighters = []

  for (const wc of MEN_CLASSES) {
    const count = DIVISION_SIZES.men[wc.name]
    for (let rank = 1; rank <= count; rank++) {
      fighters.push(generateFighter(wc, 'men', rank, userId))
    }
  }

  for (const wc of WOMEN_CLASSES) {
    const count = DIVISION_SIZES.women[wc.name]
    for (let rank = 1; rank <= count; rank++) {
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
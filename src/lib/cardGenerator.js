import { supabase } from './supabase'
import { getOdds } from './odds'

const MEN_DIVISIONS = [
  'Heavyweight', 'Cruiserweight', 'Light Heavyweight', 'Super Middleweight',
  'Middleweight', 'Super Welterweight', 'Welterweight', 'Super Lightweight',
  'Lightweight', 'Featherweight', 'Bantamweight', 'Flyweight'
]

const WOMEN_DIVISIONS = [
  'Featherweight', 'Bantamweight', 'Flyweight', 'Strawweight', 'Atomweight'
]

const shuffleArray = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const getFightersByDivision = async (userId, weightClass, gender) => {
  const { data } = await supabase
    .from('fighters')
    .select('*')
    .eq('owner_id', userId)
    .eq('weight_class', weightClass)
    .eq('gender', gender)
    .eq('status', 'active')
    .order('ranking', { ascending: true, nullsFirst: false })
  return data || []
}

const makeMatchup = (fighters) => {
  // Match closest ranked fighters together
  if (fighters.length < 2) return null
  const ranked = fighters.filter(f => f.ranking <= 15)
  const nr = fighters.filter(f => f.ranking > 15)

  // Try to make ranked vs ranked matchups first
  if (ranked.length >= 2) {
    const idx = Math.floor(Math.random() * (ranked.length - 1))
    return { f1: ranked[idx], f2: ranked[idx + 1] }
  }
  // Fall back to any two fighters
  return { f1: fighters[0], f2: fighters[1] }
}

const calcHype = (f1, f2) => {
  const rankScore = Math.max(0, 30 - (f1.ranking || 30)) + Math.max(0, 30 - (f2.ranking || 30))
  const recordScore = (f1.wins + f2.wins) / 2
  const statGap = Math.abs(
    (f1.striking + f1.wrestling + f1.ground_game + f1.clinch + f1.fight_iq + f1.athleticism) -
    (f2.striking + f2.wrestling + f2.ground_game + f2.clinch + f2.fight_iq + f2.athleticism)
  ) / 6
  const closeness = Math.max(0, 20 - statGap)
  return Math.round(rankScore + recordScore * 0.5 + closeness)
}

export const generateCard = async (userId) => {
  const fights = []

  // Pick 2-4 women's fights (no featherweight usually)
  const womenDivs = shuffleArray(['Bantamweight', 'Flyweight', 'Strawweight', 'Atomweight'])
  const womenCount = Math.floor(Math.random() * 3) + 2 // 2-4
  for (let i = 0; i < womenCount && i < womenDivs.length; i++) {
    const fighters = await getFightersByDivision(userId, womenDivs[i], 'women')
    const matchup = makeMatchup(fighters)
    if (matchup) {
      const odds = getOdds(matchup.f1, matchup.f2)
      const hype = calcHype(matchup.f1, matchup.f2)
      const isTitleFight = matchup.f1.ranking === 1 || matchup.f2.ranking === 1
      fights.push({ ...matchup, odds, hype, isTitleFight, division: womenDivs[i], gender: 'women' })
    }
  }

  // Pick men's fights to fill rest of card (11-15 total)
  const targetTotal = Math.floor(Math.random() * 5) + 11
  const menNeeded = targetTotal - fights.length
  const menDivs = shuffleArray(MEN_DIVISIONS)

  for (let i = 0; i < menDivs.length && fights.length < targetTotal; i++) {
    const fighters = await getFightersByDivision(userId, menDivs[i], 'men')
    const matchup = makeMatchup(fighters)
    if (matchup) {
      const odds = getOdds(matchup.f1, matchup.f2)
      const hype = calcHype(matchup.f1, matchup.f2)
      const isTitleFight = matchup.f1.ranking === 1 || matchup.f2.ranking === 1
      fights.push({ ...matchup, odds, hype, isTitleFight, division: menDivs[i], gender: 'men' })
    }
  }

  // Sort by hype — highest hype = main event
  fights.sort((a, b) => b.hype - a.hype)

  // Title fights always go to top
  const titleFights = fights.filter(f => f.isTitleFight)
  const nonTitleFights = fights.filter(f => !f.isTitleFight)
  const sorted = [...titleFights, ...nonTitleFights]

  // Label card positions
  return sorted.map((fight, i) => ({
    ...fight,
    cardPosition: i === 0 ? 'Main Event' :
      i === 1 ? 'Co-Main Event' :
      i <= 4 ? 'Main Card' : 'Prelim'
  }))
}
// Calculate American odds based on fighter comparison
// Returns { fighter1Odds, fighter2Odds } as American odds strings

const statWeight = {
  striking: 0.25,
  wrestling: 0.15,
  ground_game: 0.15,
  clinch: 0.10,
  fight_iq: 0.20,
  athleticism: 0.15,
}

const calcPowerRating = (fighter) => {
  return Object.entries(statWeight).reduce((total, [stat, weight]) => {
    return total + (fighter[stat] || 50) * weight
  }, 0)
}

const calcReachAdvantage = (f1, f2) => {
  const f1ArmReach = (f1.reach_cm || 177) / 2.3
  const f2ArmReach = (f2.reach_cm || 177) / 2.3
  const f1LegReach = f1.leg_reach_cm || 88
  const f2LegReach = f2.leg_reach_cm || 88
  const armDiff = f1ArmReach - f2ArmReach
  const legDiff = f1LegReach - f2LegReach
  return (armDiff * 0.6 + legDiff * 0.4) * 0.3
}

const calcRecordScore = (fighter) => {
  const total = (fighter.wins || 0) + (fighter.losses || 0)
  if (total === 0) return 0
  const winRate = fighter.wins / total
  const experience = Math.min(total / 20, 1) * 5
  return winRate * 10 + experience
}

const calcRankingScore = (fighter) => {
  const rank = fighter.ranking || 30
  if (rank === 1) return 15
  if (rank <= 5) return 10
  if (rank <= 10) return 7
  if (rank <= 15) return 4
  return 0
}

export const calcWinProbability = (f1, f2) => {
  const f1Power = calcPowerRating(f1)
  const f2Power = calcPowerRating(f2)
  const f1Reach = calcReachAdvantage(f1, f2)
  const f2Reach = calcReachAdvantage(f2, f1)
  const f1Record = calcRecordScore(f1)
  const f2Record = calcRecordScore(f2)
  const f1Rank = calcRankingScore(f1)
  const f2Rank = calcRankingScore(f2)

  const f1Score = f1Power + f1Reach + f1Record + f1Rank
  const f2Score = f2Power + f2Reach + f2Record + f2Rank

  const total = f1Score + f2Score
  const f1Prob = f1Score / total

  return { f1Prob, f2Prob: 1 - f1Prob }
}

export const toAmericanOdds = (probability) => {
  if (probability >= 0.5) {
    const odds = Math.round(-probability / (1 - probability) * 100)
    return odds
  } else {
    const odds = Math.round((1 - probability) / probability * 100)
    return odds
  }
}

export const formatOdds = (probability) => {
  const odds = toAmericanOdds(probability)
  return odds > 0 ? `+${odds}` : `${odds}`
}

export const getOdds = (f1, f2) => {
  const { f1Prob, f2Prob } = calcWinProbability(f1, f2)
  return {
    fighter1Odds: formatOdds(f1Prob),
    fighter2Odds: formatOdds(f2Prob),
    fighter1Prob: Math.round(f1Prob * 100),
    fighter2Prob: Math.round(f2Prob * 100)
  }
}
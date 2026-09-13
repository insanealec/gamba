import type { HorseDef } from '../types/horses'

// Weights determine each horse's win probability (weight / totalWeight).
// Real horse racing famously has a much worse "takeout" than casino games —
// we still keep it in the same honest-math ballpark as the other games, just
// slightly worse, which is itself an accurate bit of gambling trivia.
export const HORSES_RTP = 0.93
export const HORSES_HOUSE_EDGE = 1 - HORSES_RTP

export const HORSES: HorseDef[] = [
  { id: 'thunderbolt', name: 'Thunderbolt', icon: '🐎', weight: 32 },
  { id: 'silver-streak', name: 'Silver Streak', icon: '🐴', weight: 22 },
  { id: 'lucky-dice', name: 'Lucky Dice', icon: '🦄', weight: 16 },
  { id: 'midnight-run', name: 'Midnight Run', icon: '🐎', weight: 12 },
  { id: 'longshot-lil', name: 'Longshot Lil', icon: '🐴', weight: 10 },
  { id: 'rusty-nail', name: 'Rusty Nail', icon: '🦓', weight: 8 },
]

const TOTAL_WEIGHT = HORSES.reduce((sum, h) => sum + h.weight, 0)

export function winProbability(horseId: string): number {
  const horse = HORSES.find((h) => h.id === horseId)
  return horse ? horse.weight / TOTAL_WEIGHT : 0
}

/**
 * Every horse's payout multiplier is derived directly from its win
 * probability so that betting on ANY horse has the exact same expected
 * value (HORSES_RTP) — the same "fair odds" property real racing boards
 * aim for, computed rather than hand-tuned per horse.
 */
export function multiplierFor(horseId: string): number {
  const p = winProbability(horseId)
  return p > 0 ? HORSES_RTP / p : 0
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * Cosmetic-only display of the true multiplier as racing-style fractional
 * odds (e.g. "7/2"). Biased toward simple denominators like a real tote
 * board — only reaches for a fancier denominator when it fits meaningfully
 * better, rather than chasing the mathematically-closest fraction (which
 * tends to produce ugly, clearly-computer-generated results like "19/10").
 */
export function fractionalOddsFor(horseId: string): string {
  const profit = multiplierFor(horseId) - 1
  const denominators = [2, 4, 5]
  const SWITCH_THRESHOLD = 0.05

  const wholeNum = Math.max(1, Math.round(profit))
  let best = { num: wholeNum, den: 1, err: Math.abs(wholeNum - profit) }

  for (const den of denominators) {
    const num = Math.round(profit * den)
    if (num <= 0) continue
    const err = Math.abs(num / den - profit)
    if (err < best.err - SWITCH_THRESHOLD) best = { num, den, err }
  }

  const divisor = gcd(best.num, best.den)
  return `${best.num / divisor}/${best.den / divisor}`
}

export function nameFor(horseId: string): string {
  return HORSES.find((h) => h.id === horseId)?.name ?? horseId
}

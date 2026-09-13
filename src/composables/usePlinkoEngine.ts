import { PLINKO_MULTIPLIERS, PLINKO_RTP, ROWS } from '../data/plinkoConfig'
import type { GameEngine } from '../types/game'
import type { BounceDirection, PlinkoRoundResult } from '../types/plinko'

export function usePlinkoEngine(): GameEngine<PlinkoRoundResult> {
  return {
    id: 'plinko',
    targetRtp: PLINKO_RTP,
    resolveRound(): PlinkoRoundResult {
      const path: BounceDirection[] = Array.from({ length: ROWS }, () => (Math.random() < 0.5 ? 'L' : 'R'))
      const bin = path.filter((d) => d === 'R').length
      return { path, bin, multiplier: PLINKO_MULTIPLIERS[bin] }
    },
    payoutFor(result, bet) {
      return bet * result.multiplier
    },
  }
}

import { HORSES, HORSES_RTP } from '../data/horsesConfig'
import type { GameEngine } from '../types/game'
import type { HorseRaceResult } from '../types/horses'
import { pickWeighted } from './useRng'

/**
 * The full finish order is drawn honestly via weighted sampling without
 * replacement (a Plackett-Luce model): pick the winner weighted by odds,
 * then pick 2nd from whoever's left weighted by their odds, and so on. This
 * gives every horse a real, odds-consistent finish position — not just an
 * arbitrary ordering — computed entirely before any race animation plays.
 */
export function useHorseRacingEngine(): GameEngine<HorseRaceResult> {
  return {
    id: 'horses',
    targetRtp: HORSES_RTP,
    resolveRound(): HorseRaceResult {
      const remaining = [...HORSES]
      const finishOrder: string[] = []
      while (remaining.length > 0) {
        const picked = pickWeighted(remaining)
        finishOrder.push(picked.id)
        remaining.splice(remaining.indexOf(picked), 1)
      }
      return { finishOrder, winnerId: finishOrder[0] }
    },
    payoutFor(_result, _bet) {
      // Payout depends on which horse the player backed, which this
      // generic contract has no slot for — HorseRaceBoard.vue computes the
      // real payout itself once the race resolves, the same way CrashView
      // computes its own payout at cashout time rather than through here.
      return 0
    },
  }
}

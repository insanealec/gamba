import { CRASH_HOUSE_EDGE, CRASH_RTP } from '../data/crashConfig'
import type { GameEngine } from '../types/game'
import type { CrashRoundResult } from '../types/crash'
import { randomUnit } from './useRng'

/**
 * Crash point is drawn so that P(crashPoint >= m) = (1 - houseEdge) / m for
 * any m >= 1. That makes the expected value of cashing out at any fixed
 * multiplier a constant (1 - houseEdge), regardless of when the player
 * chooses to cash out — the same property real crash games have. No
 * provably-fair hash-seeding is used since no real money is at stake here;
 * Math.random() is a deliberate, documented scope choice.
 */
export function useCrashEngine(): GameEngine<CrashRoundResult> {
  return {
    id: 'crash',
    targetRtp: CRASH_RTP,
    resolveRound(): CrashRoundResult {
      const u = randomUnit()
      const raw = (1 - CRASH_HOUSE_EDGE) / (1 - u)
      const crashPoint = Math.max(1, Math.floor(raw * 100) / 100)
      return { crashPoint }
    },
    payoutFor(_result, _bet) {
      // Actual payout for crash is computed at cashout time by the caller
      // (payout = bet * multiplier at the moment cashed out), not here.
      return 0
    },
  }
}

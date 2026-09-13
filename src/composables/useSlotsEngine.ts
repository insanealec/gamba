import { SLOT_SYMBOLS, SLOTS_RTP, multiplierFor } from '../data/slotsConfig'
import type { GameEngine } from '../types/game'
import type { SlotRoundResult } from '../types/slots'
import { pickWeighted } from './useRng'

/**
 * Each reel is an independent weighted draw from the same symbol
 * distribution. There is no near-miss injection: the three reels are simply
 * three honest independent samples, whatever they land on is what shows.
 * Fudging reel 3 to "almost" match on a loss (a real technique some slot
 * machines use) would misrepresent the actual odds, which defeats the point
 * of this app.
 */
export function useSlotsEngine(): GameEngine<SlotRoundResult> {
  return {
    id: 'slots',
    targetRtp: SLOTS_RTP,
    resolveRound(): SlotRoundResult {
      const reels = [pickWeighted(SLOT_SYMBOLS), pickWeighted(SLOT_SYMBOLS), pickWeighted(SLOT_SYMBOLS)]
      const win = reels[0].id === reels[1].id && reels[1].id === reels[2].id
      const multiplier = win ? multiplierFor(reels[0].id) : 0
      return {
        reels: [reels[0].id, reels[1].id, reels[2].id],
        win,
        multiplier,
      }
    },
    payoutFor(result, bet) {
      return result.win ? bet * result.multiplier : 0
    },
  }
}

import { DICE_RTP } from '../data/diceConfig'
import type { GameEngine } from '../types/game'
import type { DiceRoundResult } from '../types/dice'
import { randomUnit } from './useRng'

export function useDiceEngine(): GameEngine<DiceRoundResult> {
  return {
    id: 'dice',
    targetRtp: DICE_RTP,
    resolveRound(): DiceRoundResult {
      return { roll: randomUnit() * 100 }
    },
    payoutFor(_result, _bet) {
      // Payout depends on the player's threshold/mode choice, which this
      // generic contract has no slot for — DiceBoard.vue computes the real
      // payout itself, the same way HorseRaceBoard does for horse picks.
      return 0
    },
  }
}

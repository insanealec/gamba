import { rtpFor, wheelOrderFor } from '../data/rouletteConfig'
import type { GameEngine } from '../types/game'
import type { RouletteRoundResult, WheelType } from '../types/roulette'

export function useRouletteEngine(wheelType: WheelType): GameEngine<RouletteRoundResult> {
  const order = wheelOrderFor(wheelType)
  return {
    id: 'roulette',
    targetRtp: rtpFor(wheelType),
    resolveRound(): RouletteRoundResult {
      const pocket = order[Math.floor(Math.random() * order.length)]
      return { pocket }
    },
    payoutFor(_result, _bet) {
      // Payout depends on which bet type the player picked, which this
      // generic contract has no slot for — RouletteBoard.vue computes the
      // real payout itself, the same way HorseRaceBoard does for horse picks.
      return 0
    },
  }
}

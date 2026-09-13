import { GRID_SIZE, MINES_RTP } from '../data/minesConfig'
import type { GameEngine } from '../types/game'
import type { MinesRoundResult } from '../types/mines'

export function useMinesEngine(mineCount: number): GameEngine<MinesRoundResult> {
  return {
    id: 'mines',
    targetRtp: MINES_RTP,
    resolveRound(): MinesRoundResult {
      const positions = Array.from({ length: GRID_SIZE }, (_, i) => i)
      // Fisher-Yates partial shuffle — an honest, unbiased way to pick
      // mineCount distinct tiles out of the grid.
      for (let i = positions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[positions[i], positions[j]] = [positions[j], positions[i]]
      }
      return { minePositions: positions.slice(0, mineCount) }
    },
    payoutFor(_result, _bet) {
      // Payout depends on how many tiles the player revealed before
      // cashing out or hitting a mine — a multi-step round, computed by
      // MinesBoard.vue as it plays out, not from a single fixed result.
      return 0
    },
  }
}

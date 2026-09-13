import { describe, expect, it } from 'vitest'
import { useHorseRacingEngine } from './useHorseRacingEngine'
import { HORSES, winProbability } from '../data/horsesConfig'

describe('useHorseRacingEngine', () => {
  it('finish order always contains every horse exactly once', () => {
    const engine = useHorseRacingEngine()
    for (let i = 0; i < 500; i++) {
      const { finishOrder } = engine.resolveRound(10)
      expect(finishOrder).toHaveLength(HORSES.length)
      expect(new Set(finishOrder).size).toBe(HORSES.length)
      for (const horse of HORSES) {
        expect(finishOrder).toContain(horse.id)
      }
    }
  })

  it('winnerId is always finishOrder[0]', () => {
    const engine = useHorseRacingEngine()
    for (let i = 0; i < 200; i++) {
      const result = engine.resolveRound(10)
      expect(result.winnerId).toBe(result.finishOrder[0])
    }
  })

  it('win rate for each horse converges to its configured win probability', () => {
    const engine = useHorseRacingEngine()
    const N = 50_000
    const wins: Record<string, number> = Object.fromEntries(HORSES.map((h) => [h.id, 0]))

    for (let i = 0; i < N; i++) {
      wins[engine.resolveRound(10).winnerId] += 1
    }

    for (const horse of HORSES) {
      expect(wins[horse.id] / N).toBeCloseTo(winProbability(horse.id), 1)
    }
  })
})

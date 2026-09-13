import { describe, expect, it } from 'vitest'
import { useMinesEngine } from './useMinesEngine'
import { GRID_SIZE } from '../data/minesConfig'

describe('useMinesEngine', () => {
  it('always returns exactly mineCount distinct, in-range positions', () => {
    for (const mineCount of [1, 3, 5, 10, 24]) {
      const engine = useMinesEngine(mineCount)
      for (let i = 0; i < 200; i++) {
        const { minePositions } = engine.resolveRound(10)
        expect(minePositions).toHaveLength(mineCount)
        expect(new Set(minePositions).size).toBe(mineCount)
        for (const pos of minePositions) {
          expect(pos).toBeGreaterThanOrEqual(0)
          expect(pos).toBeLessThan(GRID_SIZE)
        }
      }
    }
  })

  it('mine placement is uniform across all tiles (Fisher-Yates is unbiased)', () => {
    const mineCount = 5
    const engine = useMinesEngine(mineCount)
    const N = 50_000
    const hitCounts = new Array(GRID_SIZE).fill(0)

    for (let i = 0; i < N; i++) {
      for (const pos of engine.resolveRound(10).minePositions) {
        hitCounts[pos] += 1
      }
    }

    const expectedRate = mineCount / GRID_SIZE
    for (const count of hitCounts) {
      expect(count / N).toBeCloseTo(expectedRate, 1)
    }
  })
})

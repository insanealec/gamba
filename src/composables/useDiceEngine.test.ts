import { describe, expect, it } from 'vitest'
import { useDiceEngine } from './useDiceEngine'

describe('useDiceEngine', () => {
  it('roll is always in [0, 100)', () => {
    const engine = useDiceEngine()
    for (let i = 0; i < 2000; i++) {
      const { roll } = engine.resolveRound(10)
      expect(roll).toBeGreaterThanOrEqual(0)
      expect(roll).toBeLessThan(100)
    }
  })

  it('roll is uniformly distributed (P(roll < 50) converges to 0.5)', () => {
    const engine = useDiceEngine()
    const N = 50_000
    let below50 = 0
    for (let i = 0; i < N; i++) {
      if (engine.resolveRound(10).roll < 50) below50 += 1
    }
    expect(below50 / N).toBeCloseTo(0.5, 1)
  })
})

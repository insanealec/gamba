import { describe, expect, it } from 'vitest'
import { usePlinkoEngine } from './usePlinkoEngine'
import { BINS, PLINKO_MULTIPLIERS, PLINKO_RTP, ROWS } from '../data/plinkoConfig'

describe('usePlinkoEngine', () => {
  it('path always has exactly ROWS bounces of L or R', () => {
    const engine = usePlinkoEngine()
    for (let i = 0; i < 500; i++) {
      const { path } = engine.resolveRound(10)
      expect(path).toHaveLength(ROWS)
      for (const step of path) {
        expect(['L', 'R']).toContain(step)
      }
    }
  })

  it('bin always equals the count of R bounces, and is a valid bin index', () => {
    const engine = usePlinkoEngine()
    for (let i = 0; i < 500; i++) {
      const { path, bin } = engine.resolveRound(10)
      expect(bin).toBe(path.filter((d) => d === 'R').length)
      expect(bin).toBeGreaterThanOrEqual(0)
      expect(bin).toBeLessThan(BINS)
    }
  })

  it('multiplier matches the configured payout table for the landed bin', () => {
    const engine = usePlinkoEngine()
    for (let i = 0; i < 200; i++) {
      const result = engine.resolveRound(10)
      expect(result.multiplier).toBe(PLINKO_MULTIPLIERS[result.bin])
    }
  })

  it('payoutFor is bet times the landed multiplier', () => {
    const engine = usePlinkoEngine()
    const result = engine.resolveRound(1)
    expect(engine.payoutFor(result, 37)).toBeCloseTo(37 * result.multiplier, 10)
  })

  it('bin distribution converges to the true binomial shape (bounces are unbiased)', () => {
    const engine = usePlinkoEngine()
    const N = 50_000
    const counts = new Array(BINS).fill(0)
    for (let i = 0; i < N; i++) counts[engine.resolveRound(10).bin] += 1

    // Center bin should be visited far more often than an edge bin.
    const center = Math.floor(BINS / 2)
    expect(counts[center] / N).toBeGreaterThan(counts[0] / N * 10)

    // Simulated RTP should land near the analytic target. Tolerance is wide
    // (not tight, like other games' RTP checks) because Plinko's payout
    // variance is dominated by the rare 1000x edge bins — the exact EV is
    // already pinned down precisely and analytically in plinkoConfig.test.ts,
    // this check just confirms the engine's random walk isn't badly biased.
    let totalPayout = 0
    for (let bin = 0; bin < BINS; bin++) totalPayout += counts[bin] * PLINKO_MULTIPLIERS[bin]
    expect(Math.abs(totalPayout / N - PLINKO_RTP)).toBeLessThan(0.15)
  })
})

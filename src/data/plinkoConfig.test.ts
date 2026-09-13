import { describe, expect, it } from 'vitest'
import { BINS, PLINKO_HOUSE_EDGE, PLINKO_MULTIPLIERS, PLINKO_RTP, ROWS } from './plinkoConfig'

// Independently-derived binomial probability (deliberately not imported from
// plinkoConfig.ts) so this test can actually catch a bug in that file's own
// math, rather than just re-asserting it against itself.
function binomialCoeff(n: number, k: number): number {
  let coeff = 1
  for (let i = 0; i < k; i++) coeff = (coeff * (n - i)) / (i + 1)
  return coeff
}
function binProbability(k: number): number {
  return binomialCoeff(ROWS, k) / 2 ** ROWS
}

describe('plinkoConfig', () => {
  it('RTP + house edge sum to 1', () => {
    expect(PLINKO_RTP + PLINKO_HOUSE_EDGE).toBeCloseTo(1, 10)
  })

  it('has BINS = ROWS + 1 multipliers', () => {
    expect(PLINKO_MULTIPLIERS).toHaveLength(BINS)
  })

  it('the payout curve is symmetric (bin k pays the same as bin BINS-1-k)', () => {
    for (let k = 0; k < BINS; k++) {
      expect(PLINKO_MULTIPLIERS[k]).toBeCloseTo(PLINKO_MULTIPLIERS[BINS - 1 - k], 10)
    }
  })

  it('edge bins pay dramatically more than the center bin (the "smile" curve)', () => {
    const center = Math.floor(BINS / 2)
    expect(PLINKO_MULTIPLIERS[0]).toBeGreaterThan(PLINKO_MULTIPLIERS[center])
    expect(PLINKO_MULTIPLIERS[BINS - 1]).toBeGreaterThan(PLINKO_MULTIPLIERS[center])
  })

  it('the true binomial-weighted EV of the payout curve equals the exact target RTP', () => {
    let ev = 0
    for (let k = 0; k < BINS; k++) {
      ev += binProbability(k) * PLINKO_MULTIPLIERS[k]
    }
    expect(ev).toBeCloseTo(PLINKO_RTP, 10)
    expect(ev).toBeCloseTo(0.95, 6)
  })

  it('bin probabilities (independently computed) sum to 1', () => {
    let total = 0
    for (let k = 0; k < BINS; k++) total += binProbability(k)
    expect(total).toBeCloseTo(1, 10)
  })
})

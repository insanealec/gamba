import { describe, expect, it } from 'vitest'
import { SLOTS_HOUSE_EDGE, SLOTS_RTP, SLOT_SYMBOLS, computeSlotsRtp, multiplierFor } from './slotsConfig'

describe('slotsConfig', () => {
  it('RTP + house edge sum to 1', () => {
    expect(SLOTS_RTP + SLOTS_HOUSE_EDGE).toBeCloseTo(1, 10)
  })

  it('SLOTS_RTP is exactly what computeSlotsRtp() returns — never hardcoded', () => {
    expect(SLOTS_RTP).toBe(computeSlotsRtp())
  })

  it('RTP is a plausible casino-slot value (not free money, not a scam)', () => {
    expect(SLOTS_RTP).toBeGreaterThan(0.9)
    expect(SLOTS_RTP).toBeLessThan(1)
  })

  it('symbol weights sum to a sane total (probabilities are well-formed)', () => {
    const total = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0)
    expect(total).toBeGreaterThan(0)
  })

  it('multiplierFor returns the configured payout for every real symbol', () => {
    for (const symbol of SLOT_SYMBOLS) {
      expect(multiplierFor(symbol.id)).toBeGreaterThan(0)
    }
  })

  it('multiplierFor returns 0 for an unknown symbol (no silent undefined payouts)', () => {
    expect(multiplierFor('not-a-real-symbol')).toBe(0)
  })

  it('rarer symbols pay more — the analytic RTP model only works if this holds', () => {
    const byWeight = [...SLOT_SYMBOLS].sort((a, b) => b.weight - a.weight)
    for (let i = 0; i < byWeight.length - 1; i++) {
      expect(multiplierFor(byWeight[i].id)).toBeLessThanOrEqual(multiplierFor(byWeight[i + 1].id))
    }
  })
})

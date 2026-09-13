import { describe, expect, it } from 'vitest'
import {
  MEGASLOTS_HOUSE_EDGE,
  MEGASLOTS_RTP,
  MEGA_SYMBOLS,
  PAYLINES,
  REEL_COUNT,
  ROW_COUNT,
  computeMegaSlotsRtp,
  multiplierFor,
} from './megaSlotsConfig'

describe('megaSlotsConfig', () => {
  it('RTP + house edge sum to 1', () => {
    expect(MEGASLOTS_RTP + MEGASLOTS_HOUSE_EDGE).toBeCloseTo(1, 10)
  })

  it('MEGASLOTS_RTP is exactly what computeMegaSlotsRtp() returns — never hardcoded', () => {
    expect(MEGASLOTS_RTP).toBe(computeMegaSlotsRtp())
  })

  it('RTP is a plausible casino value', () => {
    expect(MEGASLOTS_RTP).toBeGreaterThan(0.85)
    expect(MEGASLOTS_RTP).toBeLessThan(1)
  })

  it('every payline has exactly REEL_COUNT entries, each a valid row index', () => {
    for (const line of PAYLINES) {
      expect(line).toHaveLength(REEL_COUNT)
      for (const row of line) {
        expect(row).toBeGreaterThanOrEqual(0)
        expect(row).toBeLessThan(ROW_COUNT)
      }
    }
  })

  it('multiplierFor requires at least 3 consecutive matches to pay anything', () => {
    for (const symbol of MEGA_SYMBOLS) {
      expect(multiplierFor(symbol.id, 0)).toBe(0)
      expect(multiplierFor(symbol.id, 1)).toBe(0)
      expect(multiplierFor(symbol.id, 2)).toBe(0)
      expect(multiplierFor(symbol.id, 3)).toBeGreaterThan(0)
    }
  })

  it('multiplierFor pays more for longer runs of the same symbol', () => {
    for (const symbol of MEGA_SYMBOLS) {
      const m3 = multiplierFor(symbol.id, 3)
      const m4 = multiplierFor(symbol.id, 4)
      const m5 = multiplierFor(symbol.id, 5)
      expect(m4).toBeGreaterThan(m3)
      expect(m5).toBeGreaterThan(m4)
    }
  })

  it('rarer symbols pay more for the same run length', () => {
    const byWeight = [...MEGA_SYMBOLS].sort((a, b) => b.weight - a.weight)
    for (let i = 0; i < byWeight.length - 1; i++) {
      expect(multiplierFor(byWeight[i].id, 3)).toBeLessThanOrEqual(multiplierFor(byWeight[i + 1].id, 3))
    }
  })

  it('unknown symbol pays nothing regardless of count', () => {
    expect(multiplierFor('not-a-symbol', 5)).toBe(0)
  })
})

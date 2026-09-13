import { describe, expect, it } from 'vitest'
import { DICE_RTP, MAX_THRESHOLD, MIN_THRESHOLD, multiplierFor, winChancePercent } from './diceConfig'

describe('diceConfig', () => {
  it('every win-chance choice across the full allowed slider range has identical EV', () => {
    for (let winChance = MIN_THRESHOLD; winChance <= MAX_THRESHOLD; winChance++) {
      const ev = (winChance / 100) * multiplierFor(winChance)
      expect(ev).toBeCloseTo(DICE_RTP, 10)
    }
  })

  it('multiplierFor(0) is 0, not Infinity or NaN (guards the degenerate case)', () => {
    expect(multiplierFor(0)).toBe(0)
  })

  it('a lower win chance always pays a higher multiplier', () => {
    expect(multiplierFor(10)).toBeGreaterThan(multiplierFor(50))
    expect(multiplierFor(50)).toBeGreaterThan(multiplierFor(90))
  })

  it('winChancePercent: "under" mode equals the threshold, "over" mode is its complement', () => {
    expect(winChancePercent(30, 'under')).toBe(30)
    expect(winChancePercent(30, 'over')).toBe(70)
    expect(winChancePercent(50, 'under') + winChancePercent(50, 'over')).toBe(100)
  })
})

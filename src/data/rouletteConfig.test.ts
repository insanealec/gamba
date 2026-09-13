import { describe, expect, it } from 'vitest'
import {
  AMERICAN_WHEEL_ORDER,
  EUROPEAN_WHEEL_ORDER,
  colorFor,
  outsideBets,
  rtpFor,
  straightBet,
  wheelOrderFor,
} from './rouletteConfig'

describe('rouletteConfig', () => {
  it('European wheel has 37 unique pockets, American has 38', () => {
    expect(new Set(EUROPEAN_WHEEL_ORDER).size).toBe(37)
    expect(new Set(AMERICAN_WHEEL_ORDER).size).toBe(38)
  })

  it('American wheel has both 0 and 00; European has only 0', () => {
    expect(EUROPEAN_WHEEL_ORDER).toContain('0')
    expect(EUROPEAN_WHEEL_ORDER).not.toContain('00')
    expect(AMERICAN_WHEEL_ORDER).toContain('0')
    expect(AMERICAN_WHEEL_ORDER).toContain('00')
  })

  it('wheelOrderFor resolves the correct wheel', () => {
    expect(wheelOrderFor('european')).toBe(EUROPEAN_WHEEL_ORDER)
    expect(wheelOrderFor('american')).toBe(AMERICAN_WHEEL_ORDER)
  })

  it('colorFor: zero pockets are green, and every 1-36 number is red XOR black (never green)', () => {
    expect(colorFor('0')).toBe('green')
    expect(colorFor('00')).toBe('green')

    let redCount = 0
    let blackCount = 0
    for (let n = 1; n <= 36; n++) {
      const color = colorFor(String(n))
      expect(color === 'red' || color === 'black').toBe(true)
      if (color === 'red') redCount++
      else blackCount++
    }
    expect(redCount).toBe(18)
    expect(blackCount).toBe(18)
  })

  it('rtpFor matches the real, well-known European (36/37) and American (36/38) figures', () => {
    expect(rtpFor('european')).toBeCloseTo(36 / 37, 10)
    expect(rtpFor('american')).toBeCloseTo(36 / 38, 10)
    expect(rtpFor('american')).toBeLessThan(rtpFor('european'))
  })

  it('straightBet matches only its own pocket and pays 36x', () => {
    const bet = straightBet('17')
    expect(bet.multiplier).toBe(36)
    expect(bet.matches('17')).toBe(true)
    expect(bet.matches('18')).toBe(false)
    expect(bet.matches('0')).toBe(false)
  })

  describe('outside bets', () => {
    it('red/black/odd/even/low/high each match exactly 18 of the 36 numbers, never a zero', () => {
      const evenMoneyIds = ['red', 'black', 'odd', 'even', 'low', 'high']
      const bets = outsideBets().filter((b) => evenMoneyIds.includes(b.id))
      for (const bet of bets) {
        expect(bet.multiplier).toBe(2)
        expect(bet.matches('0')).toBe(false)
        expect(bet.matches('00')).toBe(false)
        let matchCount = 0
        for (let n = 1; n <= 36; n++) {
          if (bet.matches(String(n))) matchCount++
        }
        expect(matchCount).toBe(18)
      }
    })

    it('each dozen matches exactly 12 numbers and pays 3x', () => {
      const dozens = outsideBets().filter((b) => b.id.startsWith('dozen'))
      expect(dozens).toHaveLength(3)
      for (const bet of dozens) {
        expect(bet.multiplier).toBe(3)
        let matchCount = 0
        for (let n = 1; n <= 36; n++) {
          if (bet.matches(String(n))) matchCount++
        }
        expect(matchCount).toBe(12)
      }
    })

    it('every outside bet type has the exact same EV on the European wheel — no bet is better than another', () => {
      const totalPockets = 37 // European
      for (const bet of outsideBets()) {
        let matchCount = 0
        for (let n = 1; n <= 36; n++) {
          if (bet.matches(String(n))) matchCount++
        }
        const p = matchCount / totalPockets
        const ev = p * bet.multiplier
        expect(ev).toBeCloseTo(36 / 37, 10)
      }
    })
  })
})

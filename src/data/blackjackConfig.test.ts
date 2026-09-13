import { describe, expect, it } from 'vitest'
import { BLACKJACK_RTP, handValue, isBlackjack } from './blackjackConfig'
import type { Card } from '../types/cards'

function card(rank: Card['rank'], suit: Card['suit'] = '♠'): Card {
  return { rank, suit }
}

describe('blackjackConfig', () => {
  it('RTP is a plausible, well-documented blackjack figure', () => {
    expect(BLACKJACK_RTP).toBeGreaterThan(0.9)
    expect(BLACKJACK_RTP).toBeLessThanOrEqual(1)
  })

  describe('handValue', () => {
    it('sums plain number cards', () => {
      expect(handValue([card('4'), card('5')]).total).toBe(9)
    })

    it('face cards are worth 10', () => {
      expect(handValue([card('K'), card('Q')]).total).toBe(20)
    })

    it('a single Ace counts as 11 (soft) when it does not bust', () => {
      const { total, soft } = handValue([card('A'), card('6')])
      expect(total).toBe(17)
      expect(soft).toBe(true)
    })

    it('an Ace drops to 1 automatically when 11 would bust', () => {
      const { total, soft } = handValue([card('A'), card('9'), card('5')])
      expect(total).toBe(15) // 11+9+5=25 busts, so Ace becomes 1: 1+9+5=15
      expect(soft).toBe(false)
    })

    it('two Aces: one stays soft (11), the other drops to 1 — never both at 11', () => {
      const { total, soft } = handValue([card('A'), card('A')])
      expect(total).toBe(12) // 11 + 1, not 22
      expect(soft).toBe(true)
    })

    it('a hard hand (no ace, or an ace already reduced to 1) is not soft', () => {
      expect(handValue([card('10'), card('9')]).soft).toBe(false)
    })

    it('a genuine bust stays a bust even after reducing every ace', () => {
      const { total } = handValue([card('K'), card('Q'), card('5')])
      expect(total).toBe(25)
    })
  })

  describe('isBlackjack', () => {
    it('is true for an Ace + a 10-value card in exactly 2 cards', () => {
      expect(isBlackjack([card('A'), card('K')])).toBe(true)
      expect(isBlackjack([card('10'), card('A')])).toBe(true)
    })

    it('is false for 21 made with more than 2 cards', () => {
      expect(isBlackjack([card('7'), card('7'), card('7')])).toBe(false)
    })

    it('is false for a 2-card hand that is not 21', () => {
      expect(isBlackjack([card('10'), card('9')])).toBe(false)
    })
  })
})

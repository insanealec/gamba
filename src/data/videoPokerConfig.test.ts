import { describe, expect, it } from 'vitest'
import { VIDEO_POKER_RTP, evaluateHand } from './videoPokerConfig'
import type { Card, Rank, Suit } from '../types/cards'

function card(rank: Rank, suit: Suit): Card {
  return { rank, suit }
}

describe('videoPokerConfig', () => {
  it('RTP is the well-documented "9/6 Jacks or Better" figure', () => {
    expect(VIDEO_POKER_RTP).toBeGreaterThan(0.99)
    expect(VIDEO_POKER_RTP).toBeLessThan(1)
  })

  it('Royal Flush: 10-J-Q-K-A same suit', () => {
    const hand = [card('10', '♠'), card('J', '♠'), card('Q', '♠'), card('K', '♠'), card('A', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'Royal Flush', multiplier: 800 })
  })

  it('Straight Flush: consecutive same suit, not ending in Ace-high', () => {
    const hand = [card('5', '♠'), card('6', '♠'), card('7', '♠'), card('8', '♠'), card('9', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'Straight Flush', multiplier: 50 })
  })

  it('Four of a Kind', () => {
    const hand = [card('7', '♠'), card('7', '♥'), card('7', '♦'), card('7', '♣'), card('2', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'Four of a Kind', multiplier: 25 })
  })

  it('Full House', () => {
    const hand = [card('7', '♠'), card('7', '♥'), card('7', '♦'), card('3', '♣'), card('3', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'Full House', multiplier: 9 })
  })

  it('Flush: same suit, not a straight', () => {
    const hand = [card('2', '♠'), card('5', '♠'), card('7', '♠'), card('9', '♠'), card('K', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'Flush', multiplier: 6 })
  })

  it('Straight: consecutive ranks, mixed suits', () => {
    const hand = [card('5', '♠'), card('6', '♥'), card('7', '♦'), card('8', '♣'), card('9', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'Straight', multiplier: 4 })
  })

  it('Straight: the Ace-low "wheel" (A-2-3-4-5) counts as a straight', () => {
    const hand = [card('A', '♠'), card('2', '♥'), card('3', '♦'), card('4', '♣'), card('5', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'Straight', multiplier: 4 })
  })

  it('Three of a Kind', () => {
    const hand = [card('9', '♠'), card('9', '♥'), card('9', '♦'), card('2', '♣'), card('5', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'Three of a Kind', multiplier: 3 })
  })

  it('Two Pair', () => {
    const hand = [card('9', '♠'), card('9', '♥'), card('4', '♦'), card('4', '♣'), card('2', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'Two Pair', multiplier: 2 })
  })

  it('Jacks or Better: a pair of J, Q, K, or A pays', () => {
    for (const rank of ['J', 'Q', 'K', 'A'] as Rank[]) {
      const hand = [card(rank, '♠'), card(rank, '♥'), card('3', '♦'), card('5', '♣'), card('8', '♠')]
      expect(evaluateHand(hand)).toEqual({ label: 'Jacks or Better', multiplier: 1 })
    }
  })

  it('a pair below Jacks does not pay (this is the whole point of "Jacks or Better")', () => {
    const hand = [card('10', '♠'), card('10', '♥'), card('3', '♦'), card('5', '♣'), card('8', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'No Win', multiplier: 0 })
  })

  it('a hand with no pair, straight, or flush is No Win', () => {
    const hand = [card('2', '♠'), card('5', '♥'), card('9', '♦'), card('J', '♣'), card('K', '♠')]
    expect(evaluateHand(hand)).toEqual({ label: 'No Win', multiplier: 0 })
  })
})

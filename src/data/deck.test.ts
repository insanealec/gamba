import { describe, expect, it } from 'vitest'
import { RANKS, RANK_ORDER, SUITS, createShuffledDeck, isRed } from './deck'

describe('deck', () => {
  it('a fresh deck has exactly 52 unique cards', () => {
    const deck = createShuffledDeck()
    expect(deck).toHaveLength(52)
    const ids = new Set(deck.map((c) => `${c.rank}${c.suit}`))
    expect(ids.size).toBe(52)
  })

  it('every rank/suit combination appears exactly once', () => {
    const deck = createShuffledDeck()
    for (const rank of RANKS) {
      for (const suit of SUITS) {
        expect(deck.filter((c) => c.rank === rank && c.suit === suit)).toHaveLength(1)
      }
    }
  })

  it('shuffles are actually random (two decks are not in the same order)', () => {
    const a = createShuffledDeck()
    const b = createShuffledDeck()
    expect(a).not.toEqual(b)
  })

  it('RANK_ORDER is strictly increasing 2..K then Ace high', () => {
    expect(RANK_ORDER['2']).toBeLessThan(RANK_ORDER['3'])
    expect(RANK_ORDER['K']).toBe(13)
    expect(RANK_ORDER['A']).toBe(14)
    expect(RANK_ORDER['A']).toBeGreaterThan(RANK_ORDER['K'])
  })

  it('isRed is true for hearts/diamonds and false for clubs/spades', () => {
    expect(isRed('♥')).toBe(true)
    expect(isRed('♦')).toBe(true)
    expect(isRed('♠')).toBe(false)
    expect(isRed('♣')).toBe(false)
  })
})

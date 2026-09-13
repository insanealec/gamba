import type { Card, Rank, Suit } from '../types/cards'

export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
export const SUITS: Suit[] = ['♠', '♥', '♦', '♣']

/** High-card rank order (Ace high). Straight-checking handles the Ace-low
 * wheel (A-2-3-4-5) as a special case rather than here. */
export const RANK_ORDER: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  J: 11, Q: 12, K: 13, A: 14,
}

export function isRed(suit: Suit): boolean {
  return suit === '♥' || suit === '♦'
}

/** A fresh, honestly-shuffled 52-card deck (Fisher-Yates) — every game using
 * this deals from the top without replacement, same as a real shoe. */
export function createShuffledDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

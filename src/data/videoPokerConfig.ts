import { RANK_ORDER } from './deck'
import type { Card, Rank } from '../types/cards'

/**
 * This is the standard "9/6 Jacks or Better" paytable (named for its Full
 * House / Flush payouts) — one of the best-known real video poker paytables,
 * published at ~99.54% RTP under perfect strategy. Same honesty caveat as
 * Blackjack: this is a cited real-world figure, not something derived here,
 * because the true RTP depends on how well the player chooses which cards
 * to hold.
 */
export const VIDEO_POKER_RTP = 0.9954
export const VIDEO_POKER_HOUSE_EDGE = 1 - VIDEO_POKER_RTP

export interface HandResult {
  label: string
  multiplier: number
}

export const PAYTABLE: HandResult[] = [
  { label: 'Royal Flush', multiplier: 800 },
  { label: 'Straight Flush', multiplier: 50 },
  { label: 'Four of a Kind', multiplier: 25 },
  { label: 'Full House', multiplier: 9 },
  { label: 'Flush', multiplier: 6 },
  { label: 'Straight', multiplier: 4 },
  { label: 'Three of a Kind', multiplier: 3 },
  { label: 'Two Pair', multiplier: 2 },
  { label: 'Jacks or Better', multiplier: 1 },
]

const JACKS_OR_BETTER: Rank[] = ['J', 'Q', 'K', 'A']

function isFlush(cards: Card[]): boolean {
  return cards.every((c) => c.suit === cards[0].suit)
}

function isStraight(cards: Card[]): boolean {
  const values = [...new Set(cards.map((c) => RANK_ORDER[c.rank]))].sort((a, b) => a - b)
  if (values.length !== 5) return false
  if (values[4] - values[0] === 4) return true
  // Ace-low wheel: A-2-3-4-5 sorts to [2,3,4,5,14] with Ace-high rank values.
  return values.join(',') === '2,3,4,5,14'
}

export function evaluateHand(cards: Card[]): HandResult {
  const rankCounts = new Map<Rank, number>()
  for (const card of cards) {
    rankCounts.set(card.rank, (rankCounts.get(card.rank) ?? 0) + 1)
  }
  const counts = [...rankCounts.values()].sort((a, b) => b - a)
  const flush = isFlush(cards)
  const straight = isStraight(cards)
  const values = cards.map((c) => RANK_ORDER[c.rank]).sort((a, b) => a - b)
  const isRoyal = straight && flush && values[0] === 10

  if (isRoyal) return { label: 'Royal Flush', multiplier: 800 }
  if (straight && flush) return { label: 'Straight Flush', multiplier: 50 }
  if (counts[0] === 4) return { label: 'Four of a Kind', multiplier: 25 }
  if (counts[0] === 3 && counts[1] === 2) return { label: 'Full House', multiplier: 9 }
  if (flush) return { label: 'Flush', multiplier: 6 }
  if (straight) return { label: 'Straight', multiplier: 4 }
  if (counts[0] === 3) return { label: 'Three of a Kind', multiplier: 3 }
  if (counts[0] === 2 && counts[1] === 2) return { label: 'Two Pair', multiplier: 2 }
  if (counts[0] === 2) {
    const pairRank = [...rankCounts.entries()].find(([, count]) => count === 2)?.[0]
    if (pairRank && JACKS_OR_BETTER.includes(pairRank)) {
      return { label: 'Jacks or Better', multiplier: 1 }
    }
  }
  return { label: 'No Win', multiplier: 0 }
}

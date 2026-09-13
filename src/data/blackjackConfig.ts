import type { Card } from '../types/cards'

/**
 * Unlike every other game here, Blackjack's RTP genuinely depends on how
 * well the player plays — it isn't something we can derive from a formula
 * the way crash-point or horse odds are. 99.5% is the well-documented,
 * published house edge for these exact rules (dealer stands on all 17s,
 * blackjack pays 3:2, no surrender, single-round reshuffled deck) under
 * *perfect basic strategy* — a real, cited figure, not something this app
 * computed itself. Play worse than perfect strategy and the real edge
 * against you is larger; that gap is the point of including this game.
 */
export const BLACKJACK_RTP = 0.995
export const BLACKJACK_HOUSE_EDGE = 1 - BLACKJACK_RTP

export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0
  let aces = 0
  for (const card of cards) {
    if (card.rank === 'A') {
      total += 11
      aces += 1
    } else if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') {
      total += 10
    } else {
      total += Number(card.rank)
    }
  }

  let softAces = aces
  while (total > 21 && softAces > 0) {
    total -= 10
    softAces -= 1
  }

  return { total, soft: softAces > 0 }
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21
}

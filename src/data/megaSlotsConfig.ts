import type { MegaSlotSymbol, Payline } from '../types/megaSlots'

export const REEL_COUNT = 5
export const ROW_COUNT = 3

// Same weighted-independent-draw approach as the simple slot machine, just
// with a 5x3 grid instead of 3x1 and payouts for 3/4/5 consecutive matches
// (starting from reel 1) instead of only exact-3.
export const MEGA_SYMBOLS: MegaSlotSymbol[] = [
  { id: 'grape', weight: 28, icon: '🍇', label: 'Grape' },
  { id: 'bell', weight: 22, icon: '🔔', label: 'Bell' },
  { id: 'star', weight: 17, icon: '⭐', label: 'Star' },
  { id: 'moneybag', weight: 13, icon: '💰', label: 'Money Bag' },
  { id: 'seven', weight: 10, icon: '7️⃣', label: 'Seven' },
  { id: 'diamond', weight: 7, icon: '💎', label: 'Diamond' },
  { id: 'crown', weight: 3, icon: '👑', label: 'Crown' },
]

/** Multiplier by consecutive-match count, keyed by symbol id. */
export const MEGA_PAYTABLE: Record<string, { 3: number; 4: number; 5: number }> = {
  grape: { 3: 10, 4: 25, 5: 63 },
  bell: { 3: 13, 4: 38, 5: 100 },
  star: { 3: 20, 4: 63, 5: 175 },
  moneybag: { 3: 30, 4: 100, 5: 300 },
  seven: { 3: 50, 4: 175, 5: 500 },
  diamond: { 3: 88, 4: 300, 5: 1000 },
  crown: { 3: 150, 4: 625, 5: 2500 },
}

export function multiplierFor(symbolId: string, count: number): number {
  const row = MEGA_PAYTABLE[symbolId]
  if (!row || count < 3) return 0
  const key = Math.min(count, 5) as 3 | 4 | 5
  return row[key]
}

// Row index per reel (0=top, 1=mid, 2=bottom) — a mix of straight, V-shaped,
// diagonal, and zigzag paths across the grid.
export const PAYLINES: Payline[] = [
  [1, 1, 1, 1, 1], // middle straight
  [0, 0, 0, 0, 0], // top straight
  [2, 2, 2, 2, 2], // bottom straight
  [0, 1, 2, 1, 0], // V
  [2, 1, 0, 1, 2], // inverted V
  [0, 0, 1, 2, 2], // diagonal descending
  [2, 2, 1, 0, 0], // diagonal ascending
  [1, 0, 0, 0, 1], // zigzag (top W)
  [1, 2, 2, 2, 1], // zigzag (bottom W)
]

const TOTAL_WEIGHT = MEGA_SYMBOLS.reduce((sum, s) => sum + s.weight, 0)

/**
 * Every grid cell is an independent draw from the same distribution, so any
 * payline's sequence of 5 cells is statistically identical regardless of its
 * shape (straight, diagonal, zigzag) — a diagonal doesn't pay differently
 * than a straight line for the same symbols. RTP is computed once, per line,
 * analytically: for each symbol, P(exactly k consecutive matches from reel 1)
 * for k=3,4,5, weighted by that tier's payout. Because every player's total
 * bet is split evenly across all active paylines, this per-line RTP is also
 * the overall RTP of the game — verified by computeMegaSlotsRtp() rather
 * than assumed, same "computed, not hardcoded" principle as the other games.
 */
export function computeMegaSlotsRtp(): number {
  return MEGA_SYMBOLS.reduce((rtp, symbol) => {
    const p = symbol.weight / TOTAL_WEIGHT
    const q = 1 - p
    const exactly3 = p ** 3 * q
    const exactly4 = p ** 4 * q
    const exactly5 = p ** 5
    const table = MEGA_PAYTABLE[symbol.id]
    return rtp + exactly3 * table[3] + exactly4 * table[4] + exactly5 * table[5]
  }, 0)
}

export const MEGASLOTS_RTP = computeMegaSlotsRtp()
export const MEGASLOTS_HOUSE_EDGE = 1 - MEGASLOTS_RTP

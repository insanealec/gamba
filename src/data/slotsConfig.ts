import type { PaytableEntry, SlotSymbol } from '../types/slots'

// Weighted virtual reel strip: every reel independently draws from this same
// distribution. Only 3-of-a-kind on the single center payline pays anything —
// no partial-match payouts — which keeps the math simple and legible.
export const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'cherry', weight: 30, icon: '🍒', label: 'Cherry' },
  { id: 'lemon', weight: 25, icon: '🍋', label: 'Lemon' },
  { id: 'bell', weight: 20, icon: '🔔', label: 'Bell' },
  { id: 'bar', weight: 14, icon: '📊', label: 'Bar' },
  { id: 'seven', weight: 8, icon: '7️⃣', label: 'Seven' },
  { id: 'diamond', weight: 3, icon: '💎', label: 'Diamond' },
]

export const SLOT_PAYTABLE: PaytableEntry[] = [
  { symbolId: 'cherry', multiplier: 13 },
  { symbolId: 'lemon', multiplier: 16 },
  { symbolId: 'bell', multiplier: 25 },
  { symbolId: 'bar', multiplier: 40 },
  { symbolId: 'seven', multiplier: 90 },
  { symbolId: 'diamond', multiplier: 300 },
]

export function multiplierFor(symbolId: string): number {
  return SLOT_PAYTABLE.find((entry) => entry.symbolId === symbolId)?.multiplier ?? 0
}

/**
 * Exact analytic RTP: each reel independently draws the same distribution,
 * so P(three-of-a-kind on symbol i) = (weight_i / totalWeight)^3.
 * RTP = sum over symbols of P(win_i) * payout multiplier_i.
 * This is computed from the live config, not hardcoded, so the displayed
 * odds can never drift from the actual payout math.
 */
export function computeSlotsRtp(): number {
  const totalWeight = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0)
  return SLOT_SYMBOLS.reduce((rtp, symbol) => {
    const p = (symbol.weight / totalWeight) ** 3
    return rtp + p * multiplierFor(symbol.id)
  }, 0)
}

export const SLOTS_RTP = computeSlotsRtp()
export const SLOTS_HOUSE_EDGE = 1 - SLOTS_RTP

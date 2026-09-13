export const DICE_RTP = 0.96
export const DICE_HOUSE_EDGE = 1 - DICE_RTP

export const MIN_THRESHOLD = 2
export const MAX_THRESHOLD = 98

/**
 * The player picks their own win chance (via the threshold slider) — the
 * payout multiplier is derived directly from it so that EVERY choice has
 * the exact same expected value (DICE_RTP), same idea as the crash-point
 * formula and horse odds. Nothing about "which odds you pick" changes the
 * house edge; it only changes your variance.
 */
export function multiplierFor(winChancePercent: number): number {
  if (winChancePercent <= 0) return 0
  return (DICE_RTP * 100) / winChancePercent
}

export function winChancePercent(threshold: number, mode: 'under' | 'over'): number {
  return mode === 'under' ? threshold : 100 - threshold
}

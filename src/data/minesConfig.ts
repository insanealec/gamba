export const GRID_SIZE = 25 // 5x5
export const MINE_COUNT_OPTIONS = [3, 5, 10]
export const DEFAULT_MINE_COUNT = 5

const TARGET_RTP = 0.96
export const MINES_RTP = TARGET_RTP
export const MINES_HOUSE_EDGE = 1 - TARGET_RTP

/**
 * After revealing k safe tiles with no mine hit yet, the "fair" (0-edge)
 * multiplier is the reciprocal of the probability of surviving k reveals in
 * a row — multiplying by TARGET_RTP bakes in the house edge uniformly, so
 * cashing out after 1 tile or 15 tiles has the exact same expected value.
 * Same closed-form principle as the crash-point formula, just for a
 * without-replacement draw instead of a continuous one.
 */
export function multiplierAfter(safeReveals: number, mineCount: number): number {
  const safeTiles = GRID_SIZE - mineCount
  let product = 1
  for (let i = 0; i < safeReveals; i++) {
    product *= (GRID_SIZE - i) / (safeTiles - i)
  }
  return TARGET_RTP * product
}

export type BounceDirection = 'L' | 'R'

export interface PlinkoRoundResult {
  /** One fair (honest, unbiased) coin-flip bounce per peg row. */
  path: BounceDirection[]
  /** Final bin index (0..ROWS), equal to how many 'R' bounces occurred. */
  bin: number
  multiplier: number
}

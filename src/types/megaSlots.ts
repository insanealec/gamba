export interface MegaSlotSymbol {
  id: string
  weight: number
  icon: string
  label: string
}

/** A payline is one row-index (0=top, 1=mid, 2=bottom) per reel, tracing a
 * path across the grid — straight, V-shaped, diagonal, zigzag, etc. */
export type Payline = number[]

export interface MegaSlotsWinningLine {
  lineIndex: number
  symbolId: string
  count: number
  multiplier: number
  payout: number
}

export interface MegaSlotsResult {
  /** grid[reel][row] — the full independently-drawn grid, reel-major. */
  grid: string[][]
  winningLines: MegaSlotsWinningLine[]
  totalPayout: number
}

export interface MinesRoundResult {
  /** Tile indices (0..24) that are mines — decided honestly before the
   * player reveals anything, the same "decide, then reveal" pattern as
   * every other game here. */
  minePositions: number[]
}

export type MinesOutcome = 'idle' | 'active' | 'busted' | 'cashed-out'

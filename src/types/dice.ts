export type DiceMode = 'under' | 'over'

export interface DiceRoundResult {
  /** Continuous roll in [0, 100). The player's threshold/mode choice — which
   * determines win/lose and payout — is applied afterward by the view, the
   * same way Horses applies the player's pick to an already-honest result. */
  roll: number
}

export interface HorseDef {
  id: string
  name: string
  icon: string
  weight: number
}

export interface HorseRaceResult {
  /** Horse ids in finish order — index 0 is the winner. Computed honestly via
   * weighted sampling without replacement before any animation plays. */
  finishOrder: string[]
  winnerId: string
}

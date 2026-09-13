export interface SlotSymbol {
  id: string
  weight: number
  icon: string
  label: string
}

export interface PaytableEntry {
  symbolId: string
  multiplier: number
}

export interface SlotRoundResult {
  reels: [string, string, string]
  win: boolean
  multiplier: number
}

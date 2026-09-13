export type WheelType = 'european' | 'american'
export type PocketColor = 'red' | 'black' | 'green'

export interface RouletteRoundResult {
  pocket: string
}

export interface RouletteBet {
  id: string
  label: string
  multiplier: number
  matches: (pocket: string) => boolean
}

export type GameId =
  | 'slots'
  | 'crash'
  | 'horses'
  | 'megaslots'
  | 'mines'
  | 'plinko'
  | 'dice'
  | 'roulette'
  | 'blackjack'
  | 'videopoker'
  | 'casinowar'

/** Single source of truth for "every game id that exists" — used to build
 * roundsByGame records generically instead of one hardcoded line per game. */
export const ALL_GAME_IDS: GameId[] = [
  'slots',
  'crash',
  'horses',
  'megaslots',
  'mines',
  'plinko',
  'dice',
  'roulette',
  'blackjack',
  'videopoker',
  'casinowar',
]

export function emptyRoundsByGame(): Record<GameId, number> {
  return Object.fromEntries(ALL_GAME_IDS.map((id) => [id, 0])) as Record<GameId, number>
}

export interface GameEngine<TRoundResult> {
  id: GameId
  targetRtp: number
  resolveRound(bet: number): TRoundResult
  payoutFor(result: TRoundResult, bet: number): number
}

export interface RunStats {
  totalWagered: number
  totalPaidOut: number
  roundsPlayed: number
  roundsByGame: Record<GameId, number>
}

export type RunEndReason = 'bust' | 'cash-out'

export interface RunSummary {
  totalWagered: number
  totalPaidOut: number
  net: number
  realizedHouseEdge: number
  roundsPlayed: number
  roundsByGame: Record<GameId, number>
  /** Highest balance reached at any point during the run — shows how much
   * you won before giving it back, independent of how the run ended. */
  peakBalance: number
  /** Balance at the moment the run ended — always 0 for a bust, whatever you
   * banked for a voluntary cash-out. */
  finalBalance: number
  endedBy: RunEndReason
}

export interface LifetimeStats {
  runsCompleted: number
  totalWagered: number
  totalPaidOut: number
  roundsPlayed: number
  roundsByGame: Record<GameId, number>
  totalPeakBalance: number
  bestPeakBalance: number
  cashedOutRuns: number
}

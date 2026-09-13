export interface CrashRoundResult {
  crashPoint: number
}

export type CrashRoundOutcome =
  | { status: 'idle' }
  | { status: 'running'; multiplier: number }
  | { status: 'cashed-out'; multiplier: number; payout: number }
  | { status: 'busted'; crashPoint: number }

export type BlackjackPhase = 'betting' | 'player-turn' | 'dealer-turn' | 'settled'

export type BlackjackOutcome =
  | 'player-blackjack'
  | 'dealer-blackjack'
  | 'push'
  | 'player-bust'
  | 'dealer-bust'
  | 'player-win'
  | 'dealer-win'

import type { GameId } from '../types/game'
import { ALL_GAME_IDS } from '../types/game'

export const GAME_LABELS: Record<GameId, string> = {
  slots: 'Slots',
  crash: 'Crash',
  horses: 'Horses',
  megaslots: 'Mega',
  mines: 'Mines',
  plinko: 'Plinko',
  dice: 'Dice',
  roulette: 'Roulette',
  blackjack: 'Blackjack',
  videopoker: 'Poker',
  casinowar: 'War',
}

/** Only lists games actually played this run/lifetime — with 11 games,
 * showing every zero-count entry every time would be unreadable clutter. */
export function roundsByGameSummary(roundsByGame: Record<GameId, number>): string {
  const played = ALL_GAME_IDS.filter((id) => roundsByGame[id] > 0)
  if (played.length === 0) return 'No rounds yet'
  return played.map((id) => `${GAME_LABELS[id]} ${roundsByGame[id]}`).join(' · ')
}

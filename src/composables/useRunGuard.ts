import type { NavigationGuardWithThis } from 'vue-router'
import { useRunStore } from '../stores/runStore'

const GUARDED_ROUTES = new Set([
  'slots',
  'crash',
  'horses',
  'mega-slots',
  'mines',
  'plinko',
  'dice',
  'roulette',
  'blackjack',
  'video-poker',
  'casino-war',
])

/** Redirects to the lobby if there's no active run (games), or if there's no
 * summary to show yet (game-over). */
export const runGuard: NavigationGuardWithThis<undefined> = (to) => {
  const runStore = useRunStore()

  if (GUARDED_ROUTES.has(String(to.name)) && !runStore.isActive) {
    return { name: 'lobby' }
  }

  if (to.name === 'game-over' && !runStore.lastRunSummary) {
    return { name: 'lobby' }
  }

  return true
}

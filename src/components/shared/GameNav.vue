<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

export type GameNavId =
  | 'slots'
  | 'crash'
  | 'horses'
  | 'mega-slots'
  | 'mines'
  | 'plinko'
  | 'dice'
  | 'roulette'
  | 'blackjack'
  | 'video-poker'
  | 'casino-war'

const props = defineProps<{
  current: GameNavId
}>()

const router = useRouter()

const GAMES: { id: GameNavId; to: string; label: string }[] = [
  { id: 'slots', to: '/slots', label: '🎰 Slots' },
  { id: 'crash', to: '/crash', label: '📈 Crash' },
  { id: 'horses', to: '/horses', label: '🏇 Horses' },
  { id: 'mega-slots', to: '/mega-slots', label: '💎 Mega Slots' },
  { id: 'mines', to: '/mines', label: '💣 Mines' },
  { id: 'plinko', to: '/plinko', label: '🔴 Plinko' },
  { id: 'dice', to: '/dice', label: '🎲 Dice' },
  { id: 'roulette', to: '/roulette', label: '🎡 Roulette' },
  { id: 'blackjack', to: '/blackjack', label: '🃏 Blackjack' },
  { id: 'video-poker', to: '/video-poker', label: '🂡 Video Poker' },
  { id: 'casino-war', to: '/casino-war', label: '⚔️ Casino War' },
]

// 11 games no longer fit as a row of pills without becoming unusable — a
// dropdown scales regardless of how many games this app ends up with.
const otherGames = computed(() => GAMES.filter((g) => g.id !== props.current))

function onSelect(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value) {
    router.push(value)
    ;(event.target as HTMLSelectElement).value = ''
  }
}
</script>

<template>
  <div class="game-nav">
    <RouterLink to="/" class="nav-link back">← Lobby</RouterLink>
    <select class="game-select" value="" @change="onSelect">
      <option value="" disabled>Switch game…</option>
      <option v-for="game in otherGames" :key="game.id" :value="game.to">{{ game.label }}</option>
    </select>
  </div>
</template>

<style scoped>
.game-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--text);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.nav-link:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

.game-select {
  cursor: pointer;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 0.85rem;
  font-weight: 600;
}

.game-select:hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}
</style>

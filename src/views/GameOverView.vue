<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../stores/runStore'
import { useSound } from '../composables/useSound'
import { roundsByGameSummary } from '../data/gameLabels'

const runStore = useRunStore()
const router = useRouter()
const sound = useSound()

const summary = runStore.lastRunSummary!
const isCashOut = computed(() => summary.endedBy === 'cash-out')

onMounted(() => {
  if (isCashOut.value) {
    sound.playRunCashOut()
  } else {
    sound.playGameOver()
  }
})

function playAgain() {
  runStore.startRun()
  router.push({ name: 'lobby' })
}

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}
</script>

<template>
  <div class="game-over">
    <h1 class="glow-text" :class="{ 'cash-out-heading': isCashOut }">
      {{ isCashOut ? 'Cashed Out' : 'Run Over' }}
    </h1>
    <p class="subhead">
      <template v-if="isCashOut">You walked away with {{ fmt(summary.finalBalance) }} credits.</template>
      <template v-else>Here's what actually happened.</template>
    </p>

    <div class="stat-grid">
      <div class="stat card">
        <span class="stat-label">Total Wagered</span>
        <span class="stat-value">{{ fmt(summary.totalWagered) }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">Total Paid Out</span>
        <span class="stat-value">{{ fmt(summary.totalPaidOut) }}</span>
      </div>
      <div class="stat card highlight">
        <span class="stat-label">Peak Balance</span>
        <span class="stat-value">{{ fmt(summary.peakBalance) }}</span>
        <span class="stat-sub">The highest you got, whether or not you kept it.</span>
      </div>
      <div class="stat card">
        <span class="stat-label">Net Result</span>
        <span class="stat-value" :style="{ color: summary.net >= 0 ? 'var(--neon-green)' : 'var(--neon-red)' }">
          {{ summary.net >= 0 ? '+' : '' }}{{ fmt(summary.net) }}
        </span>
        <span class="stat-sub">
          <template v-if="isCashOut">You chose to walk away — this is the real result of that choice.</template>
          <template v-else>Every run that busts ends at 0, so this is always -starting balance.</template>
        </span>
      </div>
      <div class="stat card">
        <span class="stat-label">Rounds Played</span>
        <span class="stat-value">{{ summary.roundsPlayed }}</span>
        <span class="stat-sub">{{ roundsByGameSummary(summary.roundsByGame) }}</span>
      </div>
      <div class="stat card edge">
        <span class="stat-label">Realized House Edge</span>
        <span class="stat-value">{{ pct(summary.realizedHouseEdge) }}</span>
        <span class="stat-sub">A single run wobbles around the true edge — that's expected variance, not a bug.</span>
      </div>
    </div>

    <div class="actions">
      <button class="btn btn-primary" @click="playAgain">Start New Run</button>
      <RouterLink to="/stats" class="help-link">Lifetime Stats</RouterLink>
      <RouterLink to="/help" class="help-link">Help &amp; Resources</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.game-over {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.game-over h1 {
  margin: 0;
  color: var(--neon-red);
}

.game-over h1.cash-out-heading {
  color: var(--neon-green);
}

.subhead {
  margin: 0;
  color: var(--text-dim);
}

.stat-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.stat.highlight .stat-value {
  color: var(--neon-gold);
}

.stat-sub {
  font-size: 0.78rem;
  color: var(--text-dim);
}

.actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.help-link {
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 600;
}
</style>

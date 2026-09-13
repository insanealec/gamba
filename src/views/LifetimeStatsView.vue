<script setup lang="ts">
import { useLifetimeStore } from '../stores/lifetimeStore'
import { roundsByGameSummary } from '../data/gameLabels'

const lifetime = useLifetimeStore()

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
}

function pct(n: number) {
  return `${(n * 100).toFixed(1)}%`
}
</script>

<template>
  <div class="lifetime-view">
    <h1>Lifetime Stats</h1>
    <p class="subhead">Every run you've completed, added up. This is the real number.</p>

    <div v-if="lifetime.runsCompleted === 0" class="empty card">
      No completed runs yet — finish a run and this page fills in.
    </div>

    <div v-else class="stat-grid">
      <div class="stat card">
        <span class="stat-label">Runs Completed</span>
        <span class="stat-value">{{ lifetime.runsCompleted }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">Total Wagered</span>
        <span class="stat-value">{{ fmt(lifetime.totalWagered) }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">Total Paid Out</span>
        <span class="stat-value">{{ fmt(lifetime.totalPaidOut) }}</span>
      </div>
      <div class="stat card">
        <span class="stat-label">Net Result</span>
        <span class="stat-value" :style="{ color: lifetime.net >= 0 ? 'var(--neon-green)' : 'var(--neon-red)' }">
          {{ lifetime.net >= 0 ? '+' : '' }}{{ fmt(lifetime.net) }}
        </span>
        <span class="stat-sub">Total across every run — cashing out early is what keeps this from being a fixed multiple of -1,000.</span>
      </div>
      <div class="stat card">
        <span class="stat-label">Average Net Per Run</span>
        <span class="stat-value" :style="{ color: lifetime.averageNetPerRun >= 0 ? 'var(--neon-green)' : 'var(--neon-red)' }">
          {{ lifetime.averageNetPerRun >= 0 ? '+' : '' }}{{ fmt(lifetime.averageNetPerRun) }}
        </span>
      </div>
      <div class="stat card edge">
        <span class="stat-label">Realized House Edge</span>
        <span class="stat-value">{{ pct(lifetime.realizedHouseEdge) }}</span>
        <span class="stat-sub">Averaged across every run — the more runs, the closer this tracks the configured odds.</span>
      </div>
      <div class="stat card">
        <span class="stat-label">Rounds Played</span>
        <span class="stat-value">{{ lifetime.roundsPlayed }}</span>
        <span class="stat-sub">{{ roundsByGameSummary(lifetime.roundsByGame) }}</span>
      </div>
      <div class="stat card highlight">
        <span class="stat-label">Average Peak Balance</span>
        <span class="stat-value">{{ fmt(lifetime.averagePeakBalance) }}</span>
        <span class="stat-sub">How high a typical run got before it ended.</span>
      </div>
      <div class="stat card highlight">
        <span class="stat-label">Best Peak Balance Ever</span>
        <span class="stat-value">{{ fmt(lifetime.bestPeakBalance) }}</span>
        <span class="stat-sub">Your best run, at its highest point.</span>
      </div>
      <div class="stat card highlight">
        <span class="stat-label">Cash-Out Rate</span>
        <span class="stat-value">{{ lifetime.cashedOutRuns }} / {{ lifetime.runsCompleted }} ({{ pct(lifetime.cashOutRate) }})</span>
        <span class="stat-sub">Runs you ended by choice vs. {{ lifetime.bustedRuns }} that busted to 0. This is the number that actually matters.</span>
      </div>
    </div>

    <RouterLink to="/help" class="help-link">Help &amp; Resources</RouterLink>
  </div>
</template>

<style scoped>
.lifetime-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.lifetime-view h1 {
  margin: 0;
}

.subhead {
  margin: 0;
  color: var(--text-dim);
  max-width: 480px;
}

.empty {
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

.help-link {
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 600;
}
</style>

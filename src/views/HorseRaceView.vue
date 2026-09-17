<script setup lang="ts">
import { computed } from 'vue'
import { HORSES, HORSES_RTP, fractionalOddsFor, multiplierFor, winProbability } from '../data/horsesConfig'
import HorseRaceBoard from '../components/horses/HorseRaceBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

const rows = computed(() =>
  HORSES.map((horse) => {
    const probability = winProbability(horse.id)
    const multiplier = multiplierFor(horse.id)
    return { ...horse, probability, multiplier, fractional: fractionalOddsFor(horse.id) }
  }),
)

const favorite = computed(() => rows.value[0])

function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`
}
</script>

<template>
  <div class="horses-view">
    <GameNav current="horses" />
    <div class="header-row">
      <h1>🏇 Horse Racing</h1>
      <OddsDisplay label="Horses" :rtp="HORSES_RTP" />
    </div>

    <p class="instructions">
      Pick a horse, place a bet, and watch the race. Longshots pay more if they win, favorites pay
      less — every horse has the exact same expected value either way.
    </p>

    <HorseRaceBoard />

    <MathWalkthrough :title="`How the ${pct(HORSES_RTP)} RTP is calculated`">
      <p>
        Each horse's win probability comes straight from its weight (weight ÷ total weight). The
        multiplier is then set to {{ pct(HORSES_RTP) }} ÷ that probability — so however likely a horse
        is to win, betting on it always has the exact same expected value.
      </p>

      <div class="math-table-wrap">
        <table class="math-table">
          <thead>
            <tr>
              <th>Horse</th>
              <th>Weight</th>
              <th>Win chance</th>
              <th>Multiplier</th>
              <th>Odds</th>
              <th>Expected value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in rows" :key="h.id">
              <td class="highlight-cell">{{ h.icon }} {{ h.name }}</td>
              <td>{{ h.weight }}</td>
              <td>{{ pct(h.probability) }}</td>
              <td>{{ h.multiplier.toFixed(2) }}x</td>
              <td>{{ h.fractional }}</td>
              <td class="contribution">{{ pct(h.probability * h.multiplier) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="math-formula">
        Take {{ favorite.icon }} {{ favorite.name }}, the favorite: weight {{ favorite.weight }} of
        {{ HORSES.reduce((s, h) => s + h.weight, 0) }} total = {{ pct(favorite.probability) }} win chance.
        Multiplier = {{ pct(HORSES_RTP) }} ÷ {{ pct(favorite.probability) }} = {{ favorite.multiplier.toFixed(2) }}x.
        Expected value = {{ pct(favorite.probability) }} × {{ favorite.multiplier.toFixed(2) }}x =
        {{ pct(favorite.probability * favorite.multiplier) }} — same as every longshot on the board, just
        arrived at with a much higher chance and a much smaller payout instead of the reverse.
      </p>
    </MathWalkthrough>
  </div>
</template>

<style scoped>
.horses-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.header-row h1 {
  margin: 0;
}

.instructions {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.9rem;
  max-width: 620px;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { ROULETTE_RTP, outsideBets, rtpFor, straightBet, wheelOrderFor } from '../data/rouletteConfig'
import RouletteBoard from '../components/roulette/RouletteBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

const wheel = wheelOrderFor('european')
const straight = straightBet(wheel[1])
const evenMoney = outsideBets().find((b) => b.multiplier === 2)!
const dozen = outsideBets().find((b) => b.multiplier === 3)!

const rows = computed(() => {
  return [
    { label: 'Straight (a single number)', bet: straight },
    { label: 'Even-money (red/black, odd/even, 1–18/19–36)', bet: evenMoney },
    { label: 'Dozen (1st 12 / 2nd 12 / 3rd 12)', bet: dozen },
  ].map(({ label, bet }) => {
    const covered = wheel.filter(bet.matches).length
    const chance = covered / wheel.length
    return { label, covered, multiplier: bet.multiplier, chance, ev: chance * bet.multiplier }
  })
})

function pct(n: number, digits = 2) {
  return `${(n * 100).toFixed(digits)}%`
}
</script>

<template>
  <div class="roulette-view">
    <GameNav current="roulette" />
    <div class="header-row">
      <h1>🎡 Roulette</h1>
      <OddsDisplay label="Roulette" :rtp="ROULETTE_RTP" />
    </div>

    <p class="instructions">
      Pick a number, a color, odd/even, or a dozen — every bet type pays exactly the same expected
      value, because the edge comes entirely from the green zero(s), not the bet you choose. Switch
      to the American wheel below to see what one more zero does to the odds.
    </p>

    <RouletteBoard />

    <MathWalkthrough :title="`How the ${pct(ROULETTE_RTP)} RTP is calculated`">
      <p>
        Every bet type's payout was set around a wheel with no zero at all — 36:1, 2:1, 1:1 — so they'd
        all break exactly even without it. The zero pocket is the only thing that creates any edge, and
        it does it identically for every bet, no matter how many numbers it covers.
      </p>

      <div class="math-table-wrap">
        <table class="math-table">
          <thead>
            <tr>
              <th>Bet type</th>
              <th>Numbers covered</th>
              <th>Payout</th>
              <th>Chance to win</th>
              <th>Expected value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.label">
              <td class="highlight-cell">{{ row.label }}</td>
              <td>{{ row.covered }} of {{ wheel.length }}</td>
              <td>{{ row.multiplier }}x</td>
              <td>{{ pct(row.chance) }}</td>
              <td class="contribution">{{ pct(row.ev) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="math-formula">
        Take Red: 18 of the wheel's 37 pockets are red, paying 2x — {{ pct(18 / 37) }} × 2 =
        {{ pct((18 / 37) * 2) }}, same as every other bet type. Switch to the American wheel and the payout
        numbers don't change at all — Red still pays 2x — but there's a second zero pocket (00) added, so
        it's now only 18 of 38 pockets: {{ pct(18 / 38) }} × 2 = {{ pct(rtpFor('american')) }}. That extra
        pocket is the entire difference, and it drags every bet type down by the same amount.
      </p>
    </MathWalkthrough>
  </div>
</template>

<style scoped>
.roulette-view {
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
  max-width: 640px;
}
</style>

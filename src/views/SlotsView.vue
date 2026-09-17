<script setup lang="ts">
import { computed } from 'vue'
import { SLOTS_RTP, SLOT_SYMBOLS, multiplierFor } from '../data/slotsConfig'
import SlotMachine from '../components/slots/SlotMachine.vue'
import Paytable from '../components/slots/Paytable.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

const totalWeight = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0)

const rows = computed(() =>
  SLOT_SYMBOLS.map((symbol) => {
    const probability = symbol.weight / totalWeight
    const multiplier = multiplierFor(symbol.id)
    const chanceOfThree = probability ** 3
    return { ...symbol, probability, multiplier, chanceOfThree, contribution: chanceOfThree * multiplier }
  }),
)

const exampleSymbol = computed(() => rows.value[0])

function pct(n: number, digits = 2) {
  return `${(n * 100).toFixed(digits)}%`
}
</script>

<template>
  <div class="slots-view">
    <GameNav current="slots" />
    <div class="header-row">
      <h1>🎰 Slots</h1>
      <OddsDisplay label="Slots" :rtp="SLOTS_RTP" />
    </div>
    <div class="layout">
      <SlotMachine />
      <Paytable />
    </div>

    <MathWalkthrough :title="`How the ${pct(SLOTS_RTP)} RTP is calculated`">
      <p>
        Only three-of-a-kind on the single center payline pays anything — no partial matches. Each
        reel is an independent draw from this table, so the chance of hitting three of the same symbol
        is just that symbol's chance, cubed.
      </p>

      <div class="math-table-wrap">
        <table class="math-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Weight</th>
              <th>Chance per reel</th>
              <th>Chance of 3-in-a-row</th>
              <th>Payout</th>
              <th>Adds to RTP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td class="highlight-cell">{{ row.icon }} {{ row.label }}</td>
              <td>{{ row.weight }}</td>
              <td>{{ pct(row.probability) }}</td>
              <td>{{ pct(row.chanceOfThree, 4) }}</td>
              <td>{{ row.multiplier }}x</td>
              <td class="contribution">{{ pct(row.contribution) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="math-formula">
        Take {{ exampleSymbol.icon }} {{ exampleSymbol.label }} ({{ pct(exampleSymbol.probability) }} chance per
        reel). All three reels need to land on it independently: {{ pct(exampleSymbol.probability) }} ×
        {{ pct(exampleSymbol.probability) }} × {{ pct(exampleSymbol.probability) }} =
        {{ pct(exampleSymbol.chanceOfThree, 4) }}. Times the {{ exampleSymbol.multiplier }}x payout, that's a
        {{ pct(exampleSymbol.contribution) }} contribution to the RTP. Add up all six symbols the same way and
        you get the full RTP: {{ pct(SLOTS_RTP) }}.
      </p>
    </MathWalkthrough>
  </div>
</template>

<style scoped>
.slots-view {
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

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 720px) {
  .layout {
    grid-template-columns: 2fr 1fr;
  }
}
</style>

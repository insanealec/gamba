<script setup lang="ts">
import { computed } from 'vue'
import { DICE_RTP, multiplierFor } from '../data/diceConfig'
import DiceBoard from '../components/dice/DiceBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

const exampleChances = [10, 25, 50, 75, 90]
const rows = computed(() => exampleChances.map((chance) => ({ chance, multiplier: multiplierFor(chance) })))

function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`
}
</script>

<template>
  <div class="dice-view">
    <GameNav current="dice" />
    <div class="header-row">
      <h1>🎲 Dice</h1>
      <OddsDisplay label="Dice" :rtp="DICE_RTP" />
    </div>

    <p class="instructions">
      Drag the slider to set your own win chance — the payout multiplier updates live to keep the
      same expected value no matter where you put it. A safer bet just means a smaller multiplier;
      the house edge never moves.
    </p>

    <DiceBoard />

    <MathWalkthrough :title="`How the ${pct(DICE_RTP)} RTP is calculated`">
      <p>
        The multiplier is set by a single formula: <strong>multiplier = {{ pct(DICE_RTP) }} ÷ win chance</strong>.
        Whatever chance you drag to, expected value (chance × multiplier) always comes out the same.
      </p>

      <div class="math-table-wrap">
        <table class="math-table">
          <thead>
            <tr>
              <th>Win chance</th>
              <th>Multiplier</th>
              <th>Expected value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.chance">
              <td class="highlight-cell">{{ row.chance }}%</td>
              <td>{{ row.multiplier.toFixed(2) }}x</td>
              <td class="contribution">{{ pct((row.chance / 100) * row.multiplier) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="math-formula">
        Take a 50% win chance: multiplier = {{ pct(DICE_RTP) }} ÷ 50% = {{ multiplierFor(50).toFixed(2) }}x. Win
        half the time, get {{ multiplierFor(50).toFixed(2) }}x your bet back — expected value = 50% ×
        {{ multiplierFor(50).toFixed(2) }}x = {{ pct(DICE_RTP) }}, exactly the same as every other setting on the
        slider. A safer bet just spreads that same {{ pct(DICE_RTP) }} across more frequent, smaller wins instead
        of rarer, bigger ones — the edge itself never moves.
      </p>
    </MathWalkthrough>
  </div>
</template>

<style scoped>
.dice-view {
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

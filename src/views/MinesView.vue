<script setup lang="ts">
import { computed } from 'vue'
import { DEFAULT_MINE_COUNT, GRID_SIZE, MINES_RTP, multiplierAfter } from '../data/minesConfig'
import MinesBoard from '../components/mines/MinesBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

const safeTiles = GRID_SIZE - DEFAULT_MINE_COUNT
const exampleReveals = [1, 3, 5, 10, 15]
const rows = computed(() =>
  exampleReveals
    .filter((k) => k <= safeTiles)
    .map((k) => ({ k, multiplier: multiplierAfter(k, DEFAULT_MINE_COUNT) })),
)

const secondTileSafe = (safeTiles - 1) / (GRID_SIZE - 1)

function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`
}
</script>

<template>
  <div class="mines-view">
    <GameNav current="mines" />
    <div class="header-row">
      <h1>💣 Mines</h1>
      <OddsDisplay label="Mines" :rtp="MINES_RTP" />
    </div>

    <p class="instructions">
      Pick how many mines are hidden in the grid, place your bet, then reveal tiles one at a time.
      Each safe tile raises your multiplier — cash out any time, or keep going and risk it all.
    </p>

    <div class="board-column">
      <MinesBoard />

      <MathWalkthrough :title="`How the ${pct(MINES_RTP)} RTP is calculated`">
        <p>
          The multiplier after revealing k safe tiles is {{ pct(MINES_RTP) }} ÷ (the chance of surviving k
          reveals in a row, without replacement). Table below is for the default {{ DEFAULT_MINE_COUNT }}-mine
          setting ({{ safeTiles }} safe tiles of {{ GRID_SIZE }}).
        </p>

        <div class="math-table-wrap">
          <table class="math-table">
            <thead>
              <tr>
                <th>Safe reveals</th>
                <th>Multiplier</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in rows" :key="row.k">
                <td class="highlight-cell">{{ row.k }}</td>
                <td class="contribution">{{ row.multiplier.toFixed(3) }}x</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="math-formula">
          With {{ DEFAULT_MINE_COUNT }} mines hidden, {{ safeTiles }} of the {{ GRID_SIZE }} tiles are safe.
          Your first reveal has a {{ pct(safeTiles / GRID_SIZE) }} chance of being safe ({{ safeTiles }}/{{ GRID_SIZE }})
          — multiplier = {{ pct(MINES_RTP) }} ÷ {{ pct(safeTiles / GRID_SIZE) }} = {{ multiplierAfter(1, DEFAULT_MINE_COUNT).toFixed(3) }}x.
          Reveal a second tile and the odds shrink further, now that one safe tile is already gone:
          {{ safeTiles - 1 }} of the remaining {{ GRID_SIZE - 1 }} tiles are safe, so surviving two reveals in a row is
          {{ pct(safeTiles / GRID_SIZE) }} × {{ pct(secondTileSafe) }} = {{ pct((safeTiles / GRID_SIZE) * secondTileSafe) }}
          — multiplier = {{ multiplierAfter(2, DEFAULT_MINE_COUNT).toFixed(3) }}x. Every further reveal multiplies
          in another shrinking fraction the same way, which is why the curve climbs fast the deeper you go.
        </p>
      </MathWalkthrough>
    </div>
  </div>
</template>

<style scoped>
.mines-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.header-row h1 {
  margin: 0;
}

.instructions {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.9rem;
  max-width: 620px;
  text-align: center;
}

.board-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: fit-content;
  max-width: 100%;
}
</style>

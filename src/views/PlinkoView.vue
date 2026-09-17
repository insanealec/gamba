<script setup lang="ts">
import { computed } from 'vue'
import { BINS, PLINKO_MULTIPLIERS, PLINKO_RTP, ROWS, binProbability } from '../data/plinkoConfig'
import PlinkoBoard from '../components/plinko/PlinkoBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

const totalPaths = 2 ** ROWS

const rows = computed(() =>
  Array.from({ length: BINS }, (_, bin) => {
    const probability = binProbability(bin)
    const multiplier = PLINKO_MULTIPLIERS[bin]
    return { bin, paths: Math.round(probability * totalPaths), probability, multiplier, contribution: probability * multiplier }
  }),
)

const centerBin = Math.floor(BINS / 2)
const centerPaths = Math.round(binProbability(centerBin) * totalPaths)

function pct(n: number, digits = 2) {
  return `${(n * 100).toFixed(digits)}%`
}
</script>

<template>
  <div class="plinko-view">
    <GameNav current="plinko" />
    <div class="header-row">
      <h1>🔴 Plinko</h1>
      <OddsDisplay label="Plinko" :rtp="PLINKO_RTP" />
    </div>

    <p class="instructions">
      Drop a ball through 12 rows of pegs. Every bounce is an honest coin flip — the edge comes
      entirely from how rare it is to land at the edges, where the big multipliers live.
    </p>

    <PlinkoBoard />

    <MathWalkthrough :title="`How the ${pct(PLINKO_RTP)} RTP is calculated`">
      <p>
        Every one of the {{ totalPaths.toLocaleString() }} possible left/right paths through
        {{ ROWS }} rows of pegs is equally likely — a bin's probability is just how many of those paths
        end there, out of the total. The multiplier table is then scaled so the whole thing lands on
        exactly {{ pct(PLINKO_RTP) }}.
      </p>

      <div class="math-table-wrap">
        <table class="math-table">
          <thead>
            <tr>
              <th>Bin</th>
              <th>Paths</th>
              <th>Chance</th>
              <th>Multiplier</th>
              <th>Adds to RTP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.bin">
              <td class="highlight-cell">{{ row.bin }}</td>
              <td>{{ row.paths.toLocaleString() }}</td>
              <td>{{ pct(row.probability) }}</td>
              <td>{{ row.multiplier.toFixed(1) }}x</td>
              <td class="contribution">{{ pct(row.contribution) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="math-formula">
        The leftmost bin (0) only has one way to happen — bounce left at all {{ ROWS }} pegs — so its
        chance is 1 in {{ totalPaths.toLocaleString() }}. The center bin ({{ centerBin }}) can happen
        {{ centerPaths.toLocaleString() }} different ways (any mix of lefts and rights that totals
        {{ centerBin }} of each), so it's {{ pct(binProbability(centerBin)) }} likely — that's why it's
        common and cheap to pay, while the edges are almost never hit and pay huge. Multiply every bin's
        chance by its multiplier and add them all up, and you get {{ pct(PLINKO_RTP) }}.
      </p>
    </MathWalkthrough>
  </div>
</template>

<style scoped>
.plinko-view {
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
</style>

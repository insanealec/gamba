<script setup lang="ts">
import { computed } from 'vue'
import { MEGASLOTS_RTP, MEGA_PAYTABLE, MEGA_SYMBOLS } from '../data/megaSlotsConfig'
import MegaSlotsBoard from '../components/megaslots/MegaSlotsBoard.vue'
import MegaPaylinesInfo from '../components/megaslots/MegaPaylinesInfo.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

const totalWeight = MEGA_SYMBOLS.reduce((sum, s) => sum + s.weight, 0)

// Same computation as computeMegaSlotsRtp(), broken out per symbol/tier so
// the page can show its work instead of just the final RTP number.
const breakdown = computed(() => {
  return MEGA_SYMBOLS.map((symbol) => {
    const p = symbol.weight / totalWeight
    const q = 1 - p
    const table = MEGA_PAYTABLE[symbol.id]
    const tiers = ([3, 4, 5] as const).map((count) => {
      const probability = count === 5 ? p ** 5 : p ** count * q
      const payout = table[count]
      return { count, probability, payout, contribution: probability * payout }
    })
    return {
      ...symbol,
      probability: p,
      tiers,
      contribution: tiers.reduce((sum, t) => sum + t.contribution, 0),
    }
  })
})

function pct(n: number, digits = 2) {
  return `${(n * 100).toFixed(digits)}%`
}

// The most common symbol makes the friendliest walkthrough example — small
// numbers, no near-1% edge cases to explain away.
const exampleSymbol = computed(() => breakdown.value[0])
const exampleTier = computed(() => exampleSymbol.value.tiers[0])
</script>

<template>
  <div class="mega-view">
    <GameNav current="mega-slots" />
    <div class="header-row">
      <h1>💎 Mega Slots</h1>
      <OddsDisplay label="Mega Slots" :rtp="MEGASLOTS_RTP" />
    </div>

    <p class="instructions">
      A 5×3 grid instead of one row — 9 paylines run straight, diagonal, and zigzag across it, and
      any of them can win on the same spin. Your bet splits evenly across all 9. Same odds either
      way, no matter which line pays.
    </p>

    <div class="layout">
      <MegaSlotsBoard />
      <MegaPaylinesInfo />
    </div>

    <MathWalkthrough :title="`How the ${pct(MEGASLOTS_RTP, 1)} RTP is calculated`">
      <p>
        Every one of the 15 grid cells (5 reels × 3 rows) is an independent draw from this table —
        same distribution no matter which payline runs through it. So the RTP only needs working
        out once per symbol, then summed.
      </p>

      <div class="math-table-wrap">
        <table class="math-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Weight</th>
              <th>Chance per cell</th>
              <th>3 in a row</th>
              <th>4 in a row</th>
              <th>5 in a row</th>
              <th>Adds to RTP</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in breakdown" :key="s.id">
              <td class="highlight-cell">{{ s.icon }} {{ s.label }}</td>
              <td>{{ s.weight }}</td>
              <td>{{ pct(s.probability) }}</td>
              <td v-for="t in s.tiers" :key="t.count">{{ pct(t.probability, 3) }} × {{ t.payout }}x</td>
              <td class="contribution">+{{ pct(s.contribution) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="math-formula">
        Take {{ exampleSymbol.icon }} {{ exampleSymbol.label }} ({{ pct(exampleSymbol.probability) }} chance per
        cell). Landing exactly 3 in a row means the first three reels all match —
        {{ pct(exampleSymbol.probability) }} × {{ pct(exampleSymbol.probability) }} ×
        {{ pct(exampleSymbol.probability) }} — <em>and</em> the fourth reel has to land on something else, or
        it'd count as a 4-match instead. That works out to {{ pct(exampleTier.probability, 3) }}, times the
        {{ exampleTier.payout }}x payout, for a {{ pct(exampleTier.contribution) }} contribution to the RTP.
        Every symbol works the same way across all three tiers — add them all up and you get the full RTP:
        {{ pct(MEGASLOTS_RTP) }}.
      </p>
    </MathWalkthrough>
  </div>
</template>

<style scoped>
.mega-view {
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

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 800px) {
  .layout {
    grid-template-columns: 2fr 1fr;
  }
}

</style>

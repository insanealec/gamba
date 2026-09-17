<script setup lang="ts">
import { CASINO_WAR_RTP } from '../data/casinoWarConfig'
import CasinoWarBoard from '../components/casinowar/CasinoWarBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

function pct(n: number, digits = 2) {
  return `${(n * 100).toFixed(digits)}%`
}
</script>

<template>
  <div class="war-view">
    <GameNav current="casino-war" />
    <div class="header-row">
      <h1>⚔️ Casino War</h1>
      <OddsDisplay label="Casino War" :rtp="CASINO_WAR_RTP" />
    </div>

    <p class="instructions">
      One card each. Higher card wins, even money. Tie? Surrender for half your bet back, or go to
      war — match your bet, draw again, and the original bet pays 1:1 if you win (the raise just
      pushes). Going to war is mathematically the better of the two options.
    </p>

    <div class="board-column">
      <CasinoWarBoard />

      <MathWalkthrough :title="`Why ${pct(CASINO_WAR_RTP)} isn't a computed number`">
        <p>
          Every other game's percentage is worked out live from a fixed formula. Casino War has one real
          decision point — surrender a tie for half your bet back, or go to war — and the two choices
          don't have the same expected value, so there's no single formula that covers both.
        </p>
        <p>
          {{ pct(CASINO_WAR_RTP) }} is the published RTP for always going to war on a tie, which is also
          the mathematically better of the two choices — surrendering every tie is worse, historically
          documented around 96.3%. Both are cited real-world figures, not derived from this app's own
          config.
        </p>
      </MathWalkthrough>
    </div>
  </div>
</template>

<style scoped>
.war-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.board-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: fit-content;
  max-width: 100%;
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

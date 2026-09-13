<script setup lang="ts">
import { PLINKO_RTP } from '../data/plinkoConfig'
import PlinkoBoard from '../components/plinko/PlinkoBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
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

<script setup lang="ts">
import { ROULETTE_RTP } from '../data/rouletteConfig'
import RouletteBoard from '../components/roulette/RouletteBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
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

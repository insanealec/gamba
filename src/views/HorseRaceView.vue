<script setup lang="ts">
import { HORSES_RTP } from '../data/horsesConfig'
import HorseRaceBoard from '../components/horses/HorseRaceBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
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

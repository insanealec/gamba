<script setup lang="ts">
import { MINES_RTP } from '../data/minesConfig'
import MinesBoard from '../components/mines/MinesBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
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

    <MinesBoard />
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
</style>

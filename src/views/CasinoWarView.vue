<script setup lang="ts">
import { CASINO_WAR_RTP } from '../data/casinoWarConfig'
import CasinoWarBoard from '../components/casinowar/CasinoWarBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
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

    <CasinoWarBoard />
  </div>
</template>

<style scoped>
.war-view {
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

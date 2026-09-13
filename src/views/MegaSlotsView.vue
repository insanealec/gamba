<script setup lang="ts">
import { MEGASLOTS_RTP } from '../data/megaSlotsConfig'
import MegaSlotsBoard from '../components/megaslots/MegaSlotsBoard.vue'
import MegaPaylinesInfo from '../components/megaslots/MegaPaylinesInfo.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
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

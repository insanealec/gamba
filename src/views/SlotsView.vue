<script setup lang="ts">
import { SLOTS_RTP } from '../data/slotsConfig'
import SlotMachine from '../components/slots/SlotMachine.vue'
import Paytable from '../components/slots/Paytable.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
</script>

<template>
  <div class="slots-view">
    <GameNav current="slots" />
    <div class="header-row">
      <h1>🎰 Slots</h1>
      <OddsDisplay label="Slots" :rtp="SLOTS_RTP" />
    </div>
    <div class="layout">
      <SlotMachine />
      <Paytable />
    </div>
  </div>
</template>

<style scoped>
.slots-view {
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

.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 720px) {
  .layout {
    grid-template-columns: 2fr 1fr;
  }
}
</style>

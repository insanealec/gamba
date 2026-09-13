<script setup lang="ts">
import { DICE_RTP } from '../data/diceConfig'
import DiceBoard from '../components/dice/DiceBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
</script>

<template>
  <div class="dice-view">
    <GameNav current="dice" />
    <div class="header-row">
      <h1>🎲 Dice</h1>
      <OddsDisplay label="Dice" :rtp="DICE_RTP" />
    </div>

    <p class="instructions">
      Drag the slider to set your own win chance — the payout multiplier updates live to keep the
      same expected value no matter where you put it. A safer bet just means a smaller multiplier;
      the house edge never moves.
    </p>

    <DiceBoard />
  </div>
</template>

<style scoped>
.dice-view {
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

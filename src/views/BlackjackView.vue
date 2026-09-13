<script setup lang="ts">
import { BLACKJACK_RTP } from '../data/blackjackConfig'
import BlackjackBoard from '../components/blackjack/BlackjackBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
</script>

<template>
  <div class="blackjack-view">
    <GameNav current="blackjack" />
    <div class="header-row">
      <h1>🃏 Blackjack</h1>
      <OddsDisplay label="Blackjack" :rtp="BLACKJACK_RTP" />
    </div>

    <p class="instructions">
      Get closer to 21 than the dealer without going over. Blackjack (a natural 21) pays 3:2.
      Dealer stands on all 17s. The RTP shown is the well-documented figure for
      <strong>perfect basic strategy</strong> — this is the one game here where playing worse than
      optimal genuinely costs you more.
    </p>

    <BlackjackBoard />
  </div>
</template>

<style scoped>
.blackjack-view {
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
  max-width: 640px;
  text-align: center;
}

.instructions strong {
  color: var(--neon-gold);
}
</style>

<script setup lang="ts">
import { VIDEO_POKER_RTP } from '../data/videoPokerConfig'
import VideoPokerBoard from '../components/videopoker/VideoPokerBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
</script>

<template>
  <div class="video-poker-view">
    <GameNav current="video-poker" />
    <div class="header-row">
      <h1>🂡 Video Poker</h1>
      <OddsDisplay label="Video Poker" :rtp="VIDEO_POKER_RTP" />
    </div>

    <p class="instructions">
      Deal 5 cards, hold the ones you want to keep, then draw once to replace the rest. Get paid by
      your final hand rank. Like Blackjack, the RTP shown is the published figure for
      <strong>optimal holds</strong> — which cards you keep genuinely changes your odds.
    </p>

    <VideoPokerBoard />
  </div>
</template>

<style scoped>
.video-poker-view {
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

.instructions strong {
  color: var(--neon-gold);
}
</style>

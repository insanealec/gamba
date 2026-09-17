<script setup lang="ts">
import { VIDEO_POKER_RTP } from '../data/videoPokerConfig'
import VideoPokerBoard from '../components/videopoker/VideoPokerBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

function pct(n: number, digits = 2) {
  return `${(n * 100).toFixed(digits)}%`
}
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

    <MathWalkthrough :title="`Why ${pct(VIDEO_POKER_RTP)} isn't a computed number`">
      <p>
        Every other game's percentage is worked out live from a fixed formula — the odds are the same
        no matter what you do. Video Poker isn't: which 5 cards you hold changes your odds of landing
        every hand rank on the paytable, so the true RTP depends on the choice, not just the deal.
      </p>
      <p>
        {{ pct(VIDEO_POKER_RTP) }} is the published RTP for the standard "9/6 Jacks or Better"
        paytable (named for its Full House / Flush payouts) under perfect hold strategy — one of the
        best-documented paytables in real video poker, worked out by exhaustively analyzing every
        possible hold, not derived from this app's own config. Hold differently and your real return
        is lower.
      </p>
    </MathWalkthrough>
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

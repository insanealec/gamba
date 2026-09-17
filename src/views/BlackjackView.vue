<script setup lang="ts">
import { BLACKJACK_RTP } from '../data/blackjackConfig'
import BlackjackBoard from '../components/blackjack/BlackjackBoard.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'

function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`
}
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

    <MathWalkthrough :title="`Why ${pct(BLACKJACK_RTP)} isn't a computed number`">
      <p>
        Every other game's percentage is worked out live from a fixed formula — a bet faces exactly
        the same odds no matter what you do, so the math only needs computing once. Blackjack can't
        work that way: your actual return depends on thousands of hit/stand/double/split decisions
        across every possible hand and dealer upcard, and there's no single formula that captures
        that the way "chance × payout" does for a slot symbol or a dice roll.
      </p>
      <p>
        {{ pct(BLACKJACK_RTP) }} is the well-documented, published RTP for playing perfect basic
        strategy against this exact rule set — dealer stands on all 17s, blackjack pays 3:2 — worked
        out by simulating millions of hands, not derived from this app's own config. Play worse than
        basic strategy and your real return is lower, with no floor on how much lower.
      </p>
    </MathWalkthrough>
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

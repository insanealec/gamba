<script setup lang="ts">
import { useRunStore } from '../stores/runStore'
import { useSound } from '../composables/useSound'
import { SLOTS_RTP } from '../data/slotsConfig'
import { CRASH_RTP } from '../data/crashConfig'
import { HORSES_RTP } from '../data/horsesConfig'
import { MEGASLOTS_RTP } from '../data/megaSlotsConfig'
import { MINES_RTP } from '../data/minesConfig'
import { PLINKO_RTP } from '../data/plinkoConfig'
import { DICE_RTP } from '../data/diceConfig'
import { ROULETTE_RTP } from '../data/rouletteConfig'
import { BLACKJACK_RTP } from '../data/blackjackConfig'
import { VIDEO_POKER_RTP } from '../data/videoPokerConfig'
import { CASINO_WAR_RTP } from '../data/casinoWarConfig'
import OddsDisplay from '../components/shared/OddsDisplay.vue'

const runStore = useRunStore()
const sound = useSound()

function startRun() {
  sound.playStartRun()
  runStore.startRun()
}
</script>

<template>
  <div class="lobby">
    <div v-if="!runStore.isActive" class="intro card">
      <h1>Welcome to <span class="glow-text">GambaRun</span></h1>
      <p>
        Every run starts with 1,000 fake credits. Play any game below with that shared balance.
        When you hit zero, the run ends for good and you'll see exactly how the math played out.
        No real money, ever.
      </p>
      <button class="btn btn-primary" @click="startRun">Start Run — 1,000 Credits</button>
    </div>

    <div v-else class="games">
      <RouterLink to="/slots" class="game-card card">
        <h2>🎰 Slots</h2>
        <p>Match three symbols on the payline.</p>
        <OddsDisplay label="Slots" :rtp="SLOTS_RTP" />
      </RouterLink>

      <RouterLink to="/mega-slots" class="game-card card">
        <h2>💎 Mega Slots</h2>
        <p>5×3 grid, 9 paylines — straight, diagonal, zigzag.</p>
        <OddsDisplay label="Mega Slots" :rtp="MEGASLOTS_RTP" />
      </RouterLink>

      <RouterLink to="/crash" class="game-card card">
        <h2>📈 Crash</h2>
        <p>Cash out before the multiplier busts.</p>
        <OddsDisplay label="Crash" :rtp="CRASH_RTP" />
      </RouterLink>

      <RouterLink to="/plinko" class="game-card card">
        <h2>🔴 Plinko</h2>
        <p>Drop a ball through the pegs. Edges pay big.</p>
        <OddsDisplay label="Plinko" :rtp="PLINKO_RTP" />
      </RouterLink>

      <RouterLink to="/mines" class="game-card card">
        <h2>💣 Mines</h2>
        <p>Reveal tiles, avoid mines, cash out any time.</p>
        <OddsDisplay label="Mines" :rtp="MINES_RTP" />
      </RouterLink>

      <RouterLink to="/horses" class="game-card card">
        <h2>🏇 Horse Racing</h2>
        <p>Pick a horse. Longshots pay more.</p>
        <OddsDisplay label="Horses" :rtp="HORSES_RTP" />
      </RouterLink>

      <RouterLink to="/dice" class="game-card card">
        <h2>🎲 Dice</h2>
        <p>Set your own odds. The edge stays the same.</p>
        <OddsDisplay label="Dice" :rtp="DICE_RTP" />
      </RouterLink>

      <RouterLink to="/roulette" class="game-card card">
        <h2>🎡 Roulette</h2>
        <p>Numbers, colors, dozens. One little green zero.</p>
        <OddsDisplay label="Roulette" :rtp="ROULETTE_RTP" />
      </RouterLink>

      <RouterLink to="/casino-war" class="game-card card">
        <h2>⚔️ Casino War</h2>
        <p>One card each. Higher wins. That's the whole game.</p>
        <OddsDisplay label="Casino War" :rtp="CASINO_WAR_RTP" />
      </RouterLink>

      <RouterLink to="/blackjack" class="game-card card">
        <h2>🃏 Blackjack</h2>
        <p>The one game where your decisions actually matter.</p>
        <OddsDisplay label="Blackjack" :rtp="BLACKJACK_RTP" />
      </RouterLink>

      <RouterLink to="/video-poker" class="game-card card">
        <h2>🂡 Video Poker</h2>
        <p>Hold your cards, draw once, get paid by hand rank.</p>
        <OddsDisplay label="Video Poker" :rtp="VIDEO_POKER_RTP" />
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.lobby {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.intro {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.intro h1 {
  margin: 0;
  font-size: 2rem;
}

.intro p {
  max-width: 480px;
  color: var(--text-dim);
  line-height: 1.5;
}

.games {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.game-card {
  text-decoration: none;
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.game-card:hover {
  transform: translateY(-2px);
  border-color: var(--neon-cyan);
}

.game-card h2 {
  margin: 0;
}

.game-card p {
  margin: 0;
  color: var(--text-dim);
}
</style>

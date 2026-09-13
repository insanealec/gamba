<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../../stores/runStore'
import { useSound } from '../../composables/useSound'
import { createShuffledDeck } from '../../data/deck'
import { PAYTABLE, evaluateHand } from '../../data/videoPokerConfig'
import type { Card } from '../../types/cards'
import PlayingCard from '../shared/PlayingCard.vue'
import BetControls from '../shared/BetControls.vue'
import BigWinOverlay from '../shared/BigWinOverlay.vue'

const runStore = useRunStore()
const sound = useSound()
const router = useRouter()

type Phase = 'betting' | 'holding' | 'settled'

const bet = ref(10)
const phase = ref<Phase>('betting')
const deck = ref<Card[]>([])
const hand = ref<Card[]>([])
const held = ref<boolean[]>([false, false, false, false, false])
const lastMessage = ref('')
const lastMessageWasWin = ref(false)
const bigWinKey = ref(0)
const bigWinText = ref('')

function deal() {
  if (phase.value !== 'betting') return
  if (!runStore.placeBet(bet.value, 'videopoker')) return

  deck.value = createShuffledDeck()
  hand.value = Array.from({ length: 5 }, () => deck.value.pop()!)
  held.value = [false, false, false, false, false]
  lastMessage.value = ''
  phase.value = 'holding'
  sound.playBetPlaced()
}

function toggleHold(i: number) {
  if (phase.value !== 'holding') return
  held.value[i] = !held.value[i]
}

function draw() {
  if (phase.value !== 'holding') return
  hand.value = hand.value.map((card, i) => (held.value[i] ? card : deck.value.pop()!))
  sound.playReelLand()

  const result = evaluateHand(hand.value)
  const payout = result.multiplier > 0 ? bet.value * result.multiplier : 0
  runStore.settleRound(payout, 'videopoker')
  phase.value = 'settled'

  if (result.multiplier > 0) {
    lastMessageWasWin.value = true
    lastMessage.value = `${result.label}! +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits (×${result.multiplier})`
    sound.playWin(result.multiplier)
    if (result.multiplier >= 25) {
      bigWinText.value = `${result.label.toUpperCase()}!`
      bigWinKey.value += 1
      sound.playBigWin()
    }
  } else {
    lastMessageWasWin.value = false
    lastMessage.value = `${result.label}. Lost ${bet.value.toLocaleString()} credits.`
    sound.playNoWin()
  }

  if (!runStore.isActive) {
    router.push({ name: 'game-over' })
  }
}

function newHand() {
  phase.value = 'betting'
  hand.value = []
}

onUnmounted(() => {
  // Navigating away mid-hold would otherwise leave the bet's stake deducted
  // but never resolved — forfeit it as a loss so runStore.roundInFlight
  // reliably clears (it gates voluntary run cash-out).
  if (phase.value === 'holding') {
    runStore.settleRound(0, 'videopoker')
  }
})
</script>

<template>
  <div class="video-poker-layout">
    <div class="video-poker-board card">
      <div class="cards">
        <div v-for="(card, i) in hand" :key="i" class="card-slot">
          <PlayingCard :card="card" :highlighted="held[i]" />
          <button
            type="button"
            class="hold-btn"
            :class="{ active: held[i] }"
            :disabled="phase !== 'holding'"
            @click="toggleHold(i)"
          >
            {{ held[i] ? 'HELD' : 'Hold' }}
          </button>
        </div>
      </div>

      <p class="message" :class="{ win: lastMessageWasWin }">{{ lastMessage || ' ' }}</p>

      <div class="controls">
        <BetControls v-model="bet" :balance="runStore.balance" :disabled="phase !== 'betting'" />
        <button v-if="phase === 'betting'" class="btn btn-primary" :disabled="bet > runStore.balance" @click="deal">
          Deal
        </button>
        <button v-else-if="phase === 'holding'" class="btn btn-primary" @click="draw">Draw</button>
        <button v-else class="btn btn-primary" @click="newHand">Deal Again</button>
      </div>

      <BigWinOverlay :trigger-key="bigWinKey" :text="bigWinText" />
    </div>

    <div class="paytable card">
      <h3>Paytable (9/6 Jacks or Better)</h3>
      <ul>
        <li v-for="entry in PAYTABLE" :key="entry.label">
          <span class="label">{{ entry.label }}</span>
          <span class="mult">×{{ entry.multiplier }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.video-poker-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
}

@media (min-width: 800px) {
  .video-poker-layout {
    grid-template-columns: 2fr 1fr;
  }
}

.video-poker-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.cards {
  display: flex;
  gap: 12px;
}

.card-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.hold-btn {
  cursor: pointer;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 0.72rem;
  font-weight: 700;
}

.hold-btn.active {
  border-color: var(--neon-gold);
  color: var(--neon-gold);
}

.hold-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message {
  min-height: 1.2em;
  font-size: 0.95rem;
  color: var(--text-dim);
  text-align: center;
}

.message.win {
  color: var(--neon-green);
  font-weight: 700;
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.paytable h3 {
  margin: 0 0 12px;
  font-size: 0.9rem;
  color: var(--text-dim);
}

.paytable ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.paytable li {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--text-dim);
}

.paytable .mult {
  color: var(--neon-gold);
  font-weight: 700;
}
</style>

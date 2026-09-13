<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../../stores/runStore'
import { useSound } from '../../composables/useSound'
import { createShuffledDeck, RANK_ORDER } from '../../data/deck'
import type { Card } from '../../types/cards'
import PlayingCard from '../shared/PlayingCard.vue'
import BetControls from '../shared/BetControls.vue'

const runStore = useRunStore()
const sound = useSound()
const router = useRouter()

type Phase = 'betting' | 'tie-decision' | 'settled'

const bet = ref(10)
const phase = ref<Phase>('betting')
const deck = ref<Card[]>([])
const playerCard = ref<Card | null>(null)
const dealerCard = ref<Card | null>(null)
const playerWarCard = ref<Card | null>(null)
const dealerWarCard = ref<Card | null>(null)
const originalBet = ref(0)
const totalBet = ref(0)
const lastMessage = ref('')
const lastMessageWasWin = ref(false)

function draw(): Card {
  return deck.value.pop()!
}

function settle(payout: number, isWin: boolean, message: string) {
  phase.value = 'settled'
  runStore.settleRound(payout, 'casinowar')
  lastMessageWasWin.value = isWin
  lastMessage.value = message

  if (isWin) sound.playWin(payout / totalBet.value)
  else if (payout === 0) sound.playNoWin()
  else sound.playCashout(payout / totalBet.value)

  if (!runStore.isActive) {
    router.push({ name: 'game-over' })
  }
}

function deal() {
  if (phase.value !== 'betting') return
  if (!runStore.placeBet(bet.value, 'casinowar')) return

  originalBet.value = bet.value
  totalBet.value = bet.value
  deck.value = createShuffledDeck()
  playerCard.value = draw()
  dealerCard.value = draw()
  playerWarCard.value = null
  dealerWarCard.value = null
  lastMessage.value = ''
  sound.playBetPlaced()

  const playerRank = RANK_ORDER[playerCard.value.rank]
  const dealerRank = RANK_ORDER[dealerCard.value.rank]

  if (playerRank === dealerRank) {
    phase.value = 'tie-decision'
  } else if (playerRank > dealerRank) {
    settle(totalBet.value * 2, true, `${playerCard.value.rank} beats ${dealerCard.value.rank} — you win!`)
  } else {
    settle(0, false, `${dealerCard.value.rank} beats ${playerCard.value.rank}. Lost ${totalBet.value.toLocaleString()} credits.`)
  }
}

function surrender() {
  if (phase.value !== 'tie-decision') return
  const payout = originalBet.value * 0.5
  settle(payout, false, `Surrendered on a tied ${playerCard.value!.rank} — half your bet back.`)
}

function goToWar() {
  if (phase.value !== 'tie-decision') return
  if (!runStore.placeBet(originalBet.value, 'casinowar')) return
  totalBet.value += originalBet.value

  playerWarCard.value = draw()
  dealerWarCard.value = draw()
  sound.playReelLand()

  const playerRank = RANK_ORDER[playerWarCard.value.rank]
  const dealerRank = RANK_ORDER[dealerWarCard.value.rank]

  if (playerRank > dealerRank) {
    // Real Casino War rule: the original bet pays 1:1, the raise pushes.
    const payout = originalBet.value * 2 + originalBet.value
    settle(payout, true, `You win the war! ${playerWarCard.value.rank} beats ${dealerWarCard.value.rank}.`)
  } else if (playerRank < dealerRank) {
    settle(0, false, `Dealer wins the war. Lost ${totalBet.value.toLocaleString()} credits.`)
  } else {
    settle(totalBet.value, false, 'Tied again — everything pushes.')
  }
}

function newHand() {
  phase.value = 'betting'
  playerCard.value = null
  dealerCard.value = null
  playerWarCard.value = null
  dealerWarCard.value = null
  lastMessage.value = ''
}

onUnmounted(() => {
  // Navigating away mid-tie-decision would otherwise leave the bet's stake
  // deducted but never resolved — forfeit it as a loss so
  // runStore.roundInFlight reliably clears (it gates voluntary run cash-out).
  if (phase.value === 'tie-decision') {
    runStore.settleRound(0, 'casinowar')
  }
})
</script>

<template>
  <div class="war-board card">
    <div class="cards-row">
      <div class="card-col">
        <span class="hand-label">Dealer</span>
        <PlayingCard :card="dealerCard" />
        <PlayingCard v-if="dealerWarCard" :card="dealerWarCard" />
      </div>
      <div class="vs">VS</div>
      <div class="card-col">
        <span class="hand-label">You</span>
        <PlayingCard :card="playerCard" />
        <PlayingCard v-if="playerWarCard" :card="playerWarCard" />
      </div>
    </div>

    <p class="message" :class="{ win: lastMessageWasWin }">{{ lastMessage || ' ' }}</p>

    <div v-if="phase === 'tie-decision'" class="actions">
      <button class="btn btn-secondary" @click="surrender">Surrender (half back)</button>
      <button class="btn btn-danger" :disabled="originalBet > runStore.balance" @click="goToWar">
        Go to War (match bet)
      </button>
    </div>

    <div class="controls">
      <BetControls v-model="bet" :balance="runStore.balance" :disabled="phase !== 'betting'" />
      <button v-if="phase === 'betting'" class="btn btn-primary" :disabled="bet > runStore.balance" @click="deal">
        Deal
      </button>
      <button v-else-if="phase === 'settled'" class="btn btn-primary" @click="newHand">Deal Again</button>
    </div>
  </div>
</template>

<style scoped>
.war-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.cards-row {
  display: flex;
  align-items: center;
  gap: 24px;
}

.card-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.hand-label {
  font-size: 0.85rem;
  color: var(--text-dim);
  font-weight: 700;
}

.vs {
  font-weight: 800;
  color: var(--text-dim);
  font-size: 0.9rem;
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

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>

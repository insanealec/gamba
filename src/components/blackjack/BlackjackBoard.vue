<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../../stores/runStore'
import { useSound } from '../../composables/useSound'
import { createShuffledDeck } from '../../data/deck'
import { handValue, isBlackjack } from '../../data/blackjackConfig'
import type { Card } from '../../types/cards'
import type { BlackjackOutcome, BlackjackPhase } from '../../types/blackjack'
import PlayingCard from '../shared/PlayingCard.vue'
import BetControls from '../shared/BetControls.vue'
import BigWinOverlay from '../shared/BigWinOverlay.vue'

const runStore = useRunStore()
const sound = useSound()
const router = useRouter()

const bet = ref(10)
const phase = ref<BlackjackPhase>('betting')
const deck = ref<Card[]>([])
const playerHand = ref<Card[]>([])
const dealerHand = ref<Card[]>([])
const dealerHoleHidden = ref(true)
const initialBet = ref(0)
const totalBet = ref(0)
const lastMessage = ref('')
const lastMessageWasWin = ref(false)
const bigWinKey = ref(0)
const bigWinText = ref('')

const playerValue = computed(() => handValue(playerHand.value))
const dealerVisibleValue = computed(() =>
  dealerHoleHidden.value ? handValue(dealerHand.value.slice(0, 1)) : handValue(dealerHand.value),
)
const canDouble = computed(
  () => phase.value === 'player-turn' && playerHand.value.length === 2 && runStore.balance >= initialBet.value,
)

function draw(): Card {
  return deck.value.pop()!
}

function deal() {
  if (phase.value !== 'betting') return
  if (!runStore.placeBet(bet.value, 'blackjack')) return

  initialBet.value = bet.value
  totalBet.value = bet.value
  deck.value = createShuffledDeck()
  playerHand.value = [draw(), draw()]
  dealerHand.value = [draw(), draw()]
  dealerHoleHidden.value = true
  lastMessage.value = ''
  sound.playBetPlaced()

  const playerBJ = isBlackjack(playerHand.value)
  const dealerBJ = isBlackjack(dealerHand.value)

  if (playerBJ || dealerBJ) {
    dealerHoleHidden.value = false
    if (playerBJ && dealerBJ) settle('push')
    else if (playerBJ) settle('player-blackjack')
    else settle('dealer-blackjack')
    return
  }

  phase.value = 'player-turn'
}

function hit() {
  if (phase.value !== 'player-turn') return
  playerHand.value.push(draw())
  sound.playReelLand()
  if (handValue(playerHand.value).total > 21) {
    dealerHoleHidden.value = false
    settle('player-bust')
  }
}

function stand() {
  if (phase.value !== 'player-turn') return
  playDealerTurn()
}

function doubleDown() {
  if (!canDouble.value) return
  if (!runStore.placeBet(initialBet.value, 'blackjack')) return
  totalBet.value += initialBet.value
  playerHand.value.push(draw())
  sound.playReelLand()
  if (handValue(playerHand.value).total > 21) {
    dealerHoleHidden.value = false
    settle('player-bust')
  } else {
    playDealerTurn()
  }
}

async function playDealerTurn() {
  phase.value = 'dealer-turn'
  dealerHoleHidden.value = false
  await new Promise((r) => setTimeout(r, 500))

  // Dealer stands on all 17s (including soft 17) — a common, slightly
  // player-favorable simplification of the real-casino rule variants.
  while (handValue(dealerHand.value).total < 17) {
    await new Promise((r) => setTimeout(r, 500))
    dealerHand.value.push(draw())
    sound.playReelLand()
  }

  const dealerTotal = handValue(dealerHand.value).total
  const playerTotal = handValue(playerHand.value).total

  if (dealerTotal > 21) settle('dealer-bust')
  else if (dealerTotal > playerTotal) settle('dealer-win')
  else if (dealerTotal < playerTotal) settle('player-win')
  else settle('push')
}

function settle(outcome: BlackjackOutcome) {
  phase.value = 'settled'
  let payout = 0
  let isWin = false

  switch (outcome) {
    case 'player-blackjack':
      payout = totalBet.value * 2.5
      lastMessage.value = `Blackjack! +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits`
      isWin = true
      break
    case 'dealer-blackjack':
      lastMessage.value = `Dealer has blackjack. Lost ${totalBet.value.toLocaleString()} credits.`
      break
    case 'push':
      payout = totalBet.value
      lastMessage.value = 'Push — bet returned.'
      break
    case 'player-bust':
      lastMessage.value = `Bust! Lost ${totalBet.value.toLocaleString()} credits.`
      break
    case 'dealer-bust':
      payout = totalBet.value * 2
      lastMessage.value = `Dealer busts! +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits`
      isWin = true
      break
    case 'player-win':
      payout = totalBet.value * 2
      lastMessage.value = `You win! +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits`
      isWin = true
      break
    case 'dealer-win':
      lastMessage.value = `Dealer wins. Lost ${totalBet.value.toLocaleString()} credits.`
      break
  }

  runStore.settleRound(payout, 'blackjack')
  lastMessageWasWin.value = isWin

  if (isWin) {
    sound.playWin(payout / totalBet.value)
    if (outcome === 'player-blackjack') {
      bigWinText.value = 'BLACKJACK!'
      bigWinKey.value += 1
      sound.playBigWin()
    }
  } else if (outcome !== 'push') {
    sound.playNoWin()
  }

  if (!runStore.isActive) {
    router.push({ name: 'game-over' })
  }
}

function newHand() {
  phase.value = 'betting'
  playerHand.value = []
  dealerHand.value = []
  lastMessage.value = ''
}

onUnmounted(() => {
  // Navigating away mid-hand would otherwise leave the bet's stake deducted
  // but never resolved — forfeit it as a loss so runStore.roundInFlight
  // reliably clears (it gates voluntary run cash-out).
  if (phase.value === 'player-turn' || phase.value === 'dealer-turn') {
    runStore.settleRound(0, 'blackjack')
  }
})
</script>

<template>
  <div class="blackjack-board card">
    <div class="hand-area">
      <div class="hand-label">
        Dealer
        <span v-if="!dealerHoleHidden">— {{ dealerVisibleValue.total }}{{ dealerVisibleValue.soft ? ' (soft)' : '' }}</span>
      </div>
      <div class="cards">
        <PlayingCard v-for="(card, i) in dealerHand" :key="i" :card="card" :face-down="i === 1 && dealerHoleHidden" />
      </div>
    </div>

    <p class="message" :class="{ win: lastMessageWasWin }">{{ lastMessage || ' ' }}</p>

    <div class="hand-area">
      <div class="hand-label">
        You
        <span v-if="playerHand.length">— {{ playerValue.total }}{{ playerValue.soft ? ' (soft)' : '' }}</span>
      </div>
      <div class="cards">
        <PlayingCard v-for="(card, i) in playerHand" :key="i" :card="card" />
      </div>
    </div>

    <div v-if="phase === 'player-turn'" class="actions">
      <button class="btn btn-primary" @click="hit">Hit</button>
      <button class="btn btn-secondary" @click="stand">Stand</button>
      <button class="btn btn-secondary" :disabled="!canDouble" @click="doubleDown">Double</button>
    </div>

    <div class="controls">
      <BetControls v-model="bet" :balance="runStore.balance" :disabled="phase !== 'betting'" />
      <button v-if="phase === 'betting'" class="btn btn-primary" :disabled="bet > runStore.balance" @click="deal">
        Deal
      </button>
      <button v-else-if="phase === 'settled'" class="btn btn-primary" @click="newHand">New Hand</button>
    </div>

    <BigWinOverlay :trigger-key="bigWinKey" :text="bigWinText" />
  </div>
</template>

<style scoped>
.blackjack-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.hand-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-height: 100px;
}

.hand-label {
  font-size: 0.85rem;
  color: var(--text-dim);
  font-weight: 700;
}

.cards {
  display: flex;
  gap: 8px;
  min-height: 78px;
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
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>

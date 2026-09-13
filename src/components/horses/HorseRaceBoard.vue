<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../../stores/runStore'
import { useHorseRacingEngine } from '../../composables/useHorseRacingEngine'
import { useSound } from '../../composables/useSound'
import { HORSES, multiplierFor, nameFor } from '../../data/horsesConfig'
import type { HorseRaceResult } from '../../types/horses'
import HorseTrack from './HorseTrack.vue'
import HorseSelector from './HorseSelector.vue'
import BetControls from '../shared/BetControls.vue'
import BigWinOverlay from '../shared/BigWinOverlay.vue'

const runStore = useRunStore()
const engine = useHorseRacingEngine()
const sound = useSound()
const router = useRouter()

const bet = ref(10)
const selectedHorseId = ref(HORSES[0].id)
const racing = ref(false)
const raceKey = ref(0)
const result = ref<HorseRaceResult | null>(null)
const lastMessage = ref('')
const lastMessageWasWin = ref(false)
const bigWinKey = ref(0)
const bigWinText = ref('')

function placeBet() {
  if (racing.value) return
  if (!runStore.placeBet(bet.value, 'horses')) return

  racing.value = true
  lastMessage.value = ''
  sound.playBetPlaced()
  sound.playRaceStart()

  result.value = engine.resolveRound(bet.value)
  raceKey.value += 1
}

function onRaceFinished() {
  const raceResult = result.value
  racing.value = false
  if (!raceResult) return

  const won = raceResult.winnerId === selectedHorseId.value
  const odds = multiplierFor(selectedHorseId.value)
  const payout = won ? bet.value * odds : 0

  runStore.settleRound(payout, 'horses')

  if (won) {
    lastMessageWasWin.value = true
    lastMessage.value = `${nameFor(selectedHorseId.value)} wins! +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits (×${odds.toFixed(2)})`
    sound.playWin(odds)
    if (odds >= 8) {
      bigWinText.value = `WINNER ×${odds.toFixed(1)}`
      bigWinKey.value += 1
      sound.playBigWin()
    }
  } else {
    lastMessageWasWin.value = false
    lastMessage.value = `${nameFor(raceResult.winnerId)} won. Lost ${bet.value.toLocaleString()} credits.`
    sound.playNoWin()
  }

  if (!runStore.isActive) {
    router.push({ name: 'game-over' })
  }
}

onUnmounted(() => {
  // Navigating away mid-race would otherwise leave the bet's stake deducted
  // but never resolved — forfeit it as a loss so runStore.roundInFlight
  // reliably clears (it gates voluntary cash-out) and the summary stays accurate.
  if (racing.value) {
    runStore.settleRound(0, 'horses')
  }
})
</script>

<template>
  <div class="horse-board card">
    <HorseTrack :horses="HORSES" :race-key="raceKey" :result="result" @finished="onRaceFinished" />

    <p class="message" :class="{ win: lastMessageWasWin }">{{ lastMessage || ' ' }}</p>

    <HorseSelector v-model="selectedHorseId" :disabled="racing" />

    <div class="controls">
      <BetControls v-model="bet" :balance="runStore.balance" :disabled="racing" />
      <button class="btn btn-primary" :disabled="racing || bet > runStore.balance" @click="placeBet">
        {{ racing ? 'Racing…' : 'Place Bet' }}
      </button>
    </div>

    <BigWinOverlay :trigger-key="bigWinKey" :text="bigWinText" />
  </div>
</template>

<style scoped>
.horse-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
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
</style>

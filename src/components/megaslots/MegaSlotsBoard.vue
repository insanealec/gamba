<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../../stores/runStore'
import { useMegaSlotsEngine } from '../../composables/useMegaSlotsEngine'
import { useSound } from '../../composables/useSound'
import MegaSlotsGrid from './MegaSlotsGrid.vue'
import BetControls from '../shared/BetControls.vue'
import BigWinOverlay from '../shared/BigWinOverlay.vue'
import type { MegaSlotsResult } from '../../types/megaSlots'

const runStore = useRunStore()
const engine = useMegaSlotsEngine()
const sound = useSound()
const router = useRouter()

const bet = ref(18)
const spinning = ref(false)
const spinKey = ref(0)
const result = ref<MegaSlotsResult | null>(null)
const lastMessage = ref('')
const lastMessageWasWin = ref(false)
const bigWinKey = ref(0)
const bigWinText = ref('')

function spin() {
  if (spinning.value) return
  if (!runStore.placeBet(bet.value, 'megaslots')) return

  spinning.value = true
  lastMessage.value = ''
  sound.playSpinStart()

  result.value = engine.resolveRound(bet.value)
  spinKey.value += 1
}

function onSpinFinished() {
  const spinResult = result.value
  spinning.value = false
  if (!spinResult) return

  const payout = spinResult.totalPayout
  runStore.settleRound(payout, 'megaslots')

  if (spinResult.winningLines.length > 0) {
    lastMessageWasWin.value = true
    const lineWord = spinResult.winningLines.length === 1 ? 'line' : 'lines'
    lastMessage.value = `${spinResult.winningLines.length} winning ${lineWord}! +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits`
    sound.playWin(payout / bet.value)

    const bestMultiplier = Math.max(...spinResult.winningLines.map((w) => w.multiplier))
    if (bestMultiplier >= 150) {
      bigWinText.value = `BIG WIN ×${bestMultiplier}`
      bigWinKey.value += 1
      sound.playBigWin()
    }
  } else {
    lastMessageWasWin.value = false
    lastMessage.value = 'No winning lines this spin.'
    sound.playNoWin()
  }

  if (!runStore.isActive) {
    router.push({ name: 'game-over' })
  }
}
</script>

<template>
  <div class="mega-board card">
    <MegaSlotsGrid :result="result" :spin-key="spinKey" @finished="onSpinFinished" />

    <p class="message" :class="{ win: lastMessageWasWin }">{{ lastMessage || ' ' }}</p>

    <div class="controls">
      <BetControls v-model="bet" :balance="runStore.balance" :disabled="spinning" />
      <button class="btn btn-primary" :disabled="spinning || bet > runStore.balance" @click="spin">
        {{ spinning ? 'Spinning…' : 'Spin' }}
      </button>
    </div>

    <BigWinOverlay :trigger-key="bigWinKey" :text="bigWinText" />
  </div>
</template>

<style scoped>
.mega-board {
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

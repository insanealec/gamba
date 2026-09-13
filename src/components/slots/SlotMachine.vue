<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../../stores/runStore'
import { useSlotsEngine } from '../../composables/useSlotsEngine'
import { useSound } from '../../composables/useSound'
import SlotReel from './SlotReel.vue'
import BetControls from '../shared/BetControls.vue'
import BigWinOverlay from '../shared/BigWinOverlay.vue'

const runStore = useRunStore()
const engine = useSlotsEngine()
const sound = useSound()
const router = useRouter()

const bet = ref(10)
const spinning = ref(false)
const spinKey = ref(0)
const reelResults = ref<[string, string, string]>(['cherry', 'lemon', 'bell'])
const lastMessage = ref('')
const bigWinKey = ref(0)
const bigWinText = ref('')

const REEL_DELAYS = [0, 0.15, 0.3]
const SPIN_SETTLE_MS = 1750

function spin() {
  if (spinning.value) return
  if (!runStore.placeBet(bet.value, 'slots')) return

  spinning.value = true
  lastMessage.value = ''
  sound.playSpinStart()

  const result = engine.resolveRound(bet.value)
  reelResults.value = result.reels
  spinKey.value += 1

  const payout = engine.payoutFor(result, bet.value)

  REEL_DELAYS.forEach((delay) => {
    setTimeout(() => sound.playReelLand(), (delay + 1.4) * 1000)
  })

  setTimeout(() => {
    runStore.settleRound(payout, 'slots')
    spinning.value = false

    if (result.win) {
      lastMessage.value = `Winner! +${payout.toLocaleString()} credits (×${result.multiplier})`
      if (result.multiplier >= 25) {
        bigWinText.value = `BIG WIN ×${result.multiplier}`
        bigWinKey.value += 1
        sound.playBigWin()
      } else {
        sound.playWin(result.multiplier)
      }
    } else {
      lastMessage.value = 'No match this spin.'
      sound.playNoWin()
    }

    if (!runStore.isActive) {
      router.push({ name: 'game-over' })
    }
  }, SPIN_SETTLE_MS)
}
</script>

<template>
  <div class="slot-machine card">
    <div class="reels">
      <SlotReel
        v-for="(id, i) in reelResults"
        :key="i"
        :result-symbol-id="id"
        :spin-key="spinKey"
        :delay="REEL_DELAYS[i]"
      />
    </div>

    <p class="message" :class="{ win: lastMessage.startsWith('Winner') }">{{ lastMessage || ' ' }}</p>

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
.slot-machine {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.reels {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--bg);
  border-radius: 16px;
  border: 1px solid var(--border);
}

.message {
  min-height: 1.2em;
  font-size: 0.95rem;
  color: var(--text-dim);
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

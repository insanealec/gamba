<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../../stores/runStore'
import { useRouletteEngine } from '../../composables/useRouletteEngine'
import { useSound } from '../../composables/useSound'
import { outsideBets, rtpFor, straightBet, wheelOrderFor } from '../../data/rouletteConfig'
import type { RouletteBet, RouletteRoundResult, WheelType } from '../../types/roulette'
import RouletteWheelStrip from './RouletteWheelStrip.vue'
import RouletteTable from './RouletteTable.vue'
import BetControls from '../shared/BetControls.vue'
import BigWinOverlay from '../shared/BigWinOverlay.vue'

const runStore = useRunStore()
const sound = useSound()
const router = useRouter()

const wheelType = ref<WheelType>('european')
const bet = ref(10)
const selectedBetId = ref('red')
const spinning = ref(false)
const spinKey = ref(0)
const result = ref<RouletteRoundResult | null>(null)
const lastMessage = ref('')
const lastMessageWasWin = ref(false)
const bigWinKey = ref(0)
const bigWinText = ref('')

function findBet(id: string): RouletteBet | undefined {
  if (id.startsWith('straight-')) return straightBet(id.slice('straight-'.length))
  return outsideBets().find((b) => b.id === id)
}

function setWheelType(next: WheelType) {
  if (spinning.value) return
  wheelType.value = next
}

function spin() {
  if (spinning.value) return
  if (!runStore.placeBet(bet.value, 'roulette')) return

  spinning.value = true
  lastMessage.value = ''
  sound.playSpinStart()

  const engine = useRouletteEngine(wheelType.value)
  result.value = engine.resolveRound(bet.value)
  spinKey.value += 1
}

function onWheelLanded() {
  const roundResult = result.value
  spinning.value = false
  if (!roundResult) return

  const chosenBet = findBet(selectedBetId.value)
  const won = chosenBet ? chosenBet.matches(roundResult.pocket) : false
  const payout = won && chosenBet ? bet.value * chosenBet.multiplier : 0

  runStore.settleRound(payout, 'roulette')

  if (won && chosenBet) {
    lastMessageWasWin.value = true
    lastMessage.value = `${roundResult.pocket} — ${chosenBet.label} wins! +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits (×${chosenBet.multiplier})`
    sound.playWin(chosenBet.multiplier)
    if (chosenBet.multiplier >= 36) {
      bigWinText.value = `STRAIGHT UP ×${chosenBet.multiplier}`
      bigWinKey.value += 1
      sound.playBigWin()
    }
  } else {
    lastMessageWasWin.value = false
    lastMessage.value = `${roundResult.pocket} — lost ${bet.value.toLocaleString()} credits.`
    sound.playNoWin()
  }

  if (!runStore.isActive) {
    router.push({ name: 'game-over' })
  }
}
</script>

<template>
  <div class="roulette-board card">
    <div class="wheel-row">
      <RouletteWheelStrip :wheel-order="wheelOrderFor(wheelType)" :result-pocket="result?.pocket ?? null" :spin-key="spinKey" @landed="onWheelLanded" />

      <div class="wheel-toggle">
        <button type="button" :class="{ active: wheelType === 'european' }" :disabled="spinning" @click="setWheelType('european')">
          European ({{ (rtpFor('european') * 100).toFixed(1) }}%)
        </button>
        <button type="button" :class="{ active: wheelType === 'american' }" :disabled="spinning" @click="setWheelType('american')">
          American ({{ (rtpFor('american') * 100).toFixed(1) }}%)
        </button>
      </div>
    </div>

    <p class="message" :class="{ win: lastMessageWasWin }">{{ lastMessage || ' ' }}</p>

    <RouletteTable v-model="selectedBetId" :wheel-type="wheelType" :disabled="spinning" />

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
.roulette-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
}

.wheel-row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.wheel-toggle {
  display: flex;
  gap: 8px;
}

.wheel-toggle button {
  cursor: pointer;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.78rem;
  font-weight: 700;
}

.wheel-toggle button.active {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

.wheel-toggle button:disabled {
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
</style>

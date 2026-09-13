<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useRunStore } from '../../stores/runStore'
import { useDiceEngine } from '../../composables/useDiceEngine'
import { useSound } from '../../composables/useSound'
import { MAX_THRESHOLD, MIN_THRESHOLD, multiplierFor, winChancePercent } from '../../data/diceConfig'
import type { DiceMode } from '../../types/dice'
import BetControls from '../shared/BetControls.vue'
import BigWinOverlay from '../shared/BigWinOverlay.vue'

const runStore = useRunStore()
const engine = useDiceEngine()
const sound = useSound()
const router = useRouter()

const bet = ref(10)
const threshold = ref(50)
const mode = ref<DiceMode>('under')
const rolling = ref(false)
const displayRoll = ref(0)
const lastRoll = ref<number | null>(null)
const lastWasWin = ref(false)
const lastMessage = ref('')
const bigWinKey = ref(0)
const bigWinText = ref('')

const winChance = computed(() => winChancePercent(threshold.value, mode.value))
const payoutMultiplier = computed(() => multiplierFor(winChance.value))

function setMode(next: DiceMode) {
  if (rolling.value) return
  mode.value = next
}

function roll() {
  if (rolling.value) return
  if (!runStore.placeBet(bet.value, 'dice')) return

  rolling.value = true
  lastMessage.value = ''
  sound.playSpinStart()

  const result = engine.resolveRound(bet.value)
  const win = mode.value === 'under' ? result.roll < threshold.value : result.roll > threshold.value
  const multiplier = payoutMultiplier.value
  const payout = win ? bet.value * multiplier : 0

  const proxy = { value: 0 }
  gsap.to(proxy, {
    value: 1,
    duration: 0.9,
    ease: 'power2.out',
    onUpdate: () => {
      // Cosmetic cycling — the real roll is already decided above; this is
      // just a suspense effect, not a value the outcome depends on.
      displayRoll.value = Math.random() * 100
    },
    onComplete: () => {
      displayRoll.value = result.roll
      lastRoll.value = result.roll
      rolling.value = false

      runStore.settleRound(payout, 'dice')

      if (win) {
        lastWasWin.value = true
        lastMessage.value = `${result.roll.toFixed(2)} — win! +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits (×${multiplier.toFixed(2)})`
        sound.playWin(multiplier)
        if (multiplier >= 10) {
          bigWinText.value = `WINNER ×${multiplier.toFixed(1)}`
          bigWinKey.value += 1
          sound.playBigWin()
        }
      } else {
        lastWasWin.value = false
        lastMessage.value = `${result.roll.toFixed(2)} — lost ${bet.value.toLocaleString()} credits.`
        sound.playNoWin()
      }

      if (!runStore.isActive) {
        router.push({ name: 'game-over' })
      }
    },
  })
}

const winZoneStyle = computed(() => {
  if (mode.value === 'under') {
    return { left: '0%', width: `${threshold.value}%` }
  }
  return { left: `${threshold.value}%`, width: `${100 - threshold.value}%` }
})

const markerPosition = computed(() => `${Math.min(100, Math.max(0, displayRoll.value))}%`)
</script>

<template>
  <div class="dice-board card">
    <div class="track">
      <div class="lose-zone" />
      <div class="win-zone" :style="winZoneStyle" />
      <div class="threshold-line" :style="{ left: `${threshold}%` }" />
      <div
        v-if="rolling || lastRoll !== null"
        class="roll-marker"
        :class="{ win: !rolling && lastWasWin, lose: !rolling && !lastWasWin }"
        :style="{ left: markerPosition }"
      >
        {{ displayRoll.toFixed(2) }}
      </div>
    </div>

    <p class="message" :class="{ win: lastWasWin && lastRoll !== null }">{{ lastMessage || ' ' }}</p>

    <div class="mode-row">
      <button type="button" class="mode-btn" :class="{ active: mode === 'under' }" :disabled="rolling" @click="setMode('under')">
        Roll Under
      </button>
      <button type="button" class="mode-btn" :class="{ active: mode === 'over' }" :disabled="rolling" @click="setMode('over')">
        Roll Over
      </button>
    </div>

    <input
      v-model.number="threshold"
      type="range"
      :min="MIN_THRESHOLD"
      :max="MAX_THRESHOLD"
      step="1"
      class="threshold-slider"
      :disabled="rolling"
    />

    <div class="stats-row">
      <span>Threshold: <strong>{{ threshold }}</strong></span>
      <span>Win Chance: <strong>{{ winChance.toFixed(0) }}%</strong></span>
      <span>Payout: <strong>×{{ payoutMultiplier.toFixed(2) }}</strong></span>
    </div>

    <div class="controls">
      <BetControls v-model="bet" :balance="runStore.balance" :disabled="rolling" />
      <button class="btn btn-primary" :disabled="rolling || bet > runStore.balance" @click="roll">
        {{ rolling ? 'Rolling…' : 'Roll' }}
      </button>
    </div>

    <BigWinOverlay :trigger-key="bigWinKey" :text="bigWinText" />
  </div>
</template>

<style scoped>
.dice-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
}

.track {
  position: relative;
  width: 100%;
  max-width: 520px;
  height: 40px;
  border-radius: 999px;
  overflow: visible;
  background: var(--bg);
  border: 1px solid var(--border);
}

.lose-zone {
  position: absolute;
  inset: 0;
  background: rgba(255, 77, 109, 0.25);
  border-radius: 999px;
}

.win-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgba(77, 255, 158, 0.35);
}

.threshold-line {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  background: var(--text);
  transform: translateX(-1px);
}

.roll-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg-elevated);
  border: 2px solid var(--text-dim);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 0.78rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.roll-marker.win {
  border-color: var(--neon-green);
  color: var(--neon-green);
}

.roll-marker.lose {
  border-color: var(--neon-red);
  color: var(--neon-red);
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

.mode-row {
  display: flex;
  gap: 10px;
}

.mode-btn {
  cursor: pointer;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 8px 18px;
  font-size: 0.85rem;
  font-weight: 700;
}

.mode-btn.active {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
  box-shadow: var(--shadow-glow-cyan);
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.threshold-slider {
  width: 100%;
  max-width: 520px;
  accent-color: var(--neon-cyan);
}

.stats-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--text-dim);
}

.stats-row strong {
  color: var(--neon-gold);
}

.controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>

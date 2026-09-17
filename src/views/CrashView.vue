<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useRunStore } from '../stores/runStore'
import { useCrashEngine } from '../composables/useCrashEngine'
import { useSound } from '../composables/useSound'
import { CRASH_RTP } from '../data/crashConfig'
import CrashGraph from '../components/crash/CrashGraph.vue'
import CrashControls from '../components/crash/CrashControls.vue'
import OddsDisplay from '../components/shared/OddsDisplay.vue'
import BigWinOverlay from '../components/shared/BigWinOverlay.vue'
import GameNav from '../components/shared/GameNav.vue'
import MathWalkthrough from '../components/shared/MathWalkthrough.vue'
import type { CrashRoundOutcome } from '../types/crash'

const exampleTargets = [1.5, 2, 5, 10, 20]
const targetRows = exampleTargets.map((target) => ({
  target,
  chance: CRASH_RTP / target,
  ev: (CRASH_RTP / target) * target,
}))

function pct(n: number, digits = 1) {
  return `${(n * 100).toFixed(digits)}%`
}

const runStore = useRunStore()
const engine = useCrashEngine()
const sound = useSound()
const router = useRouter()

const GROWTH_RATE = 0.15 // continuous-compounding rate; multiplier(t) = e^(GROWTH_RATE * t)
const BUST_ANIMATION_MS = 700 // gives the drop animation (see CrashGraph.vue) time to play before navigating away on run-end

const bet = ref(10)
const outcome = ref<CrashRoundOutcome>({ status: 'idle' })
const roundKey = ref(0)
const bigWinKey = ref(0)
const bigWinText = ref('')
const lastMessage = ref('')
const lastMessageWasWin = ref(false)

let crashPoint = 0
let roundBet = 0
let startTime = 0

function tick() {
  const elapsed = (performance.now() - startTime) / 1000
  const multiplier = Math.exp(GROWTH_RATE * elapsed)

  if (multiplier >= crashPoint) {
    outcome.value = { status: 'busted', crashPoint }
    gsap.ticker.remove(tick)
    sound.stopRisingTone()
    sound.playBust()
    runStore.settleRound(0, 'crash')
    lastMessageWasWin.value = false
    lastMessage.value = `Busted at ×${crashPoint.toFixed(2)} — lost ${roundBet.toLocaleString()} credits`
    // Delay navigation so the bust "drop" animation is visible before the run-over screen replaces it.
    setTimeout(afterSettle, BUST_ANIMATION_MS)
    return
  }

  outcome.value = { status: 'running', multiplier }
  sound.updateRisingTone(multiplier)
}

function placeBet() {
  if (outcome.value.status === 'running') return
  if (!runStore.placeBet(bet.value, 'crash')) return

  roundBet = bet.value
  crashPoint = engine.resolveRound(roundBet).crashPoint
  startTime = performance.now()
  roundKey.value += 1
  outcome.value = { status: 'running', multiplier: 1 }
  lastMessage.value = ''
  sound.playBetPlaced()
  sound.startRisingTone()
  gsap.ticker.add(tick)
}

function cashOut() {
  if (outcome.value.status !== 'running') return
  const multiplier = outcome.value.multiplier
  gsap.ticker.remove(tick)
  sound.stopRisingTone()
  sound.playCashout(multiplier)

  const payout = roundBet * multiplier
  outcome.value = { status: 'cashed-out', multiplier, payout }
  runStore.settleRound(payout, 'crash')

  lastMessageWasWin.value = true
  lastMessage.value = `Cashed out! +${payout.toFixed(2)} credits (×${multiplier.toFixed(2)})`

  if (multiplier >= 5) {
    bigWinText.value = `CASHED OUT ×${multiplier.toFixed(2)}`
    bigWinKey.value += 1
  }

  afterSettle()
}

function afterSettle() {
  if (!runStore.isActive) {
    router.push({ name: 'game-over' })
  }
}

onUnmounted(() => {
  gsap.ticker.remove(tick)
  sound.stopRisingTone(true)
  // Navigating away mid-round would otherwise leave the bet's stake deducted
  // but never resolved — forfeit it as a bust so runStore.roundInFlight
  // reliably clears (it gates voluntary cash-out) and the summary stays accurate.
  if (outcome.value.status === 'running') {
    runStore.settleRound(0, 'crash')
  }
})
</script>

<template>
  <div class="crash-view">
    <GameNav current="crash" />
    <div class="header-row">
      <h1>📈 Crash</h1>
      <OddsDisplay label="Crash" :rtp="CRASH_RTP" />
    </div>

    <p class="instructions">
      Place a bet, then hit <strong>Cash Out</strong> before the multiplier crashes to lock in
      your bet × the current multiplier. Wait too long and it crashes to zero — you lose the bet.
    </p>

    <div class="layout card">
      <CrashGraph :outcome="outcome" :round-key="roundKey" />
      <p class="message" :class="{ win: lastMessageWasWin }">{{ lastMessage || ' ' }}</p>
      <CrashControls
        v-model:bet="bet"
        :balance="runStore.balance"
        :outcome="outcome"
        @place-bet="placeBet"
        @cash-out="cashOut"
      />
    </div>

    <BigWinOverlay :trigger-key="bigWinKey" :text="bigWinText" />

    <MathWalkthrough :title="`How the ${pct(CRASH_RTP)} RTP is calculated`">
      <p>
        For any cash-out target m, the chance the multiplier reaches at least m before crashing is
        {{ pct(CRASH_RTP) }} ÷ m. Whatever target you pick, that exactly cancels out the payout, so the
        expected value never changes — only how often you win and how big the win is.
      </p>

      <div class="math-table-wrap">
        <table class="math-table">
          <thead>
            <tr>
              <th>Cash-out target</th>
              <th>Chance to reach it</th>
              <th>Expected value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in targetRows" :key="row.target">
              <td class="highlight-cell">{{ row.target }}x</td>
              <td>{{ pct(row.chance) }}</td>
              <td class="contribution">{{ pct(row.ev) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="math-formula">
        Take a 2x target: the multiplier needs to climb past 2x before it busts, which happens
        {{ pct(CRASH_RTP / 2) }} of the time ({{ pct(CRASH_RTP) }} ÷ 2). Get there and you cash out 2x your
        bet; bust before it and you lose the bet entirely. Expected value = {{ pct(CRASH_RTP / 2) }} × 2x =
        {{ pct(CRASH_RTP) }} — same constant as a 1.5x target, a 20x target, or anywhere in between.
      </p>
    </MathWalkthrough>
  </div>
</template>

<style scoped>
.crash-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.header-row h1 {
  margin: 0;
}

.instructions {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.9rem;
  max-width: 560px;
}

.instructions strong {
  color: var(--neon-green);
}

.layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.message {
  margin: -12px 0 0;
  min-height: 1.2em;
  font-size: 0.95rem;
  color: var(--text-dim);
}

.message.win {
  color: var(--neon-green);
  font-weight: 700;
}
</style>

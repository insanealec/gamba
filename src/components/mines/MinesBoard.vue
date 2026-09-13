<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../../stores/runStore'
import { useMinesEngine } from '../../composables/useMinesEngine'
import { useSound } from '../../composables/useSound'
import { DEFAULT_MINE_COUNT, GRID_SIZE, MINE_COUNT_OPTIONS, multiplierAfter } from '../../data/minesConfig'
import MinesGrid from './MinesGrid.vue'
import BetControls from '../shared/BetControls.vue'
import BigWinOverlay from '../shared/BigWinOverlay.vue'

const runStore = useRunStore()
const sound = useSound()
const router = useRouter()

const bet = ref(10)
const mineCount = ref(DEFAULT_MINE_COUNT)
const lockedMineCount = ref(DEFAULT_MINE_COUNT)
const roundActive = ref(false)
const roundEnded = ref(false)
const minePositions = ref<number[]>([])
const revealedTiles = ref<boolean[]>(Array(GRID_SIZE).fill(false))
const safeRevealCount = ref(0)
const roundBet = ref(0)
const lastMessage = ref('')
const lastMessageWasWin = ref(false)
const bigWinKey = ref(0)
const bigWinText = ref('')

const safeTilesTotal = computed(() => GRID_SIZE - lockedMineCount.value)
const currentMultiplier = computed(() => multiplierAfter(safeRevealCount.value, lockedMineCount.value))
const potentialPayout = computed(() => roundBet.value * currentMultiplier.value)
const canCashOut = computed(() => roundActive.value && safeRevealCount.value >= 1)

function setMineCount(n: number) {
  if (roundActive.value) return
  mineCount.value = n
}

function startRound() {
  if (roundActive.value) return
  if (!runStore.placeBet(bet.value, 'mines')) return

  const engine = useMinesEngine(mineCount.value)
  const result = engine.resolveRound(bet.value)

  minePositions.value = result.minePositions
  lockedMineCount.value = mineCount.value
  roundBet.value = bet.value
  revealedTiles.value = Array(GRID_SIZE).fill(false)
  safeRevealCount.value = 0
  roundActive.value = true
  roundEnded.value = false
  lastMessage.value = ''
  sound.playBetPlaced()
}

function endRound(payout: number, outcome: 'busted' | 'cashed-out') {
  roundActive.value = false
  roundEnded.value = true
  const multiplier = currentMultiplier.value
  runStore.settleRound(payout, 'mines')

  if (outcome === 'cashed-out') {
    lastMessageWasWin.value = true
    lastMessage.value = `Cashed out! +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits (×${multiplier.toFixed(2)})`
    sound.playCashout(multiplier)
    if (multiplier >= 5) {
      bigWinText.value = `CASHED OUT ×${multiplier.toFixed(2)}`
      bigWinKey.value += 1
      sound.playBigWin()
    }
  } else {
    lastMessageWasWin.value = false
    lastMessage.value = `Boom! Lost ${roundBet.value.toLocaleString()} credits.`
    sound.playBust()
  }

  if (!runStore.isActive) {
    router.push({ name: 'game-over' })
  }
}

function revealTile(index: number) {
  if (!roundActive.value) return
  revealedTiles.value[index] = true

  if (minePositions.value.includes(index)) {
    endRound(0, 'busted')
    return
  }

  safeRevealCount.value += 1
  sound.playReelLand()

  if (safeRevealCount.value === safeTilesTotal.value) {
    endRound(roundBet.value * currentMultiplier.value, 'cashed-out')
  }
}

function cashOut() {
  if (!canCashOut.value) return
  endRound(roundBet.value * currentMultiplier.value, 'cashed-out')
}

onUnmounted(() => {
  // Navigating away mid-round would otherwise leave the bet's stake deducted
  // but never resolved — forfeit it as a loss so runStore.roundInFlight
  // reliably clears (it gates voluntary run cash-out).
  if (roundActive.value) {
    runStore.settleRound(0, 'mines')
  }
})
</script>

<template>
  <div class="mines-board card">
    <div class="mine-count-row">
      <span class="label">Mines:</span>
      <button
        v-for="n in MINE_COUNT_OPTIONS"
        :key="n"
        type="button"
        class="mine-count-btn"
        :class="{ active: mineCount === n }"
        :disabled="roundActive"
        @click="setMineCount(n)"
      >
        {{ n }}
      </button>
    </div>

    <MinesGrid
      :mine-positions="minePositions"
      :revealed-tiles="revealedTiles"
      :round-ended="roundEnded"
      :disabled="!roundActive"
      @reveal="revealTile"
    />

    <p class="message" :class="{ win: lastMessageWasWin }">{{ lastMessage || ' ' }}</p>

    <div v-if="roundActive" class="live-stats">
      <span>Safe tiles found: <strong>{{ safeRevealCount }} / {{ safeTilesTotal }}</strong></span>
      <span>Current multiplier: <strong>×{{ currentMultiplier.toFixed(2) }}</strong></span>
    </div>

    <div class="controls">
      <BetControls v-model="bet" :balance="runStore.balance" :disabled="roundActive" />
      <button v-if="!roundActive" class="btn btn-primary" :disabled="bet > runStore.balance" @click="startRound">
        Place Bet
      </button>
      <button v-else class="btn btn-danger" :disabled="!canCashOut" @click="cashOut">
        Cash Out — {{ potentialPayout.toFixed(2) }} credits
      </button>
    </div>

    <BigWinOverlay :trigger-key="bigWinKey" :text="bigWinText" />
  </div>
</template>

<style scoped>
.mines-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.mine-count-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  color: var(--text-dim);
  font-size: 0.85rem;
}

.mine-count-btn {
  cursor: pointer;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 6px 16px;
  font-weight: 700;
  font-size: 0.85rem;
}

.mine-count-btn.active {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
  box-shadow: var(--shadow-glow-cyan);
}

.mine-count-btn:disabled {
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

.live-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
  font-size: 0.85rem;
  color: var(--text-dim);
}

.live-stats strong {
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

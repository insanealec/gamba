<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import gsap from 'gsap'
import { useRunStore } from '../../stores/runStore'
import { usePlinkoEngine } from '../../composables/usePlinkoEngine'
import { useSound } from '../../composables/useSound'
import { BINS, PLINKO_MULTIPLIERS, ROWS } from '../../data/plinkoConfig'
import BetControls from '../shared/BetControls.vue'
import BigWinOverlay from '../shared/BigWinOverlay.vue'

const runStore = useRunStore()
const engine = usePlinkoEngine()
const sound = useSound()
const router = useRouter()

const PEG_DX = 28
const ROW_DY = 26
const TOP_MARGIN = 16
const CENTER_X = (ROWS * PEG_DX) / 2 + 20
const BOARD_WIDTH = ROWS * PEG_DX + 40
const BOARD_HEIGHT = (ROWS + 1) * ROW_DY + TOP_MARGIN + 16

const pegs: { x: number; y: number }[] = []
for (let row = 0; row < ROWS; row++) {
  for (let slot = 0; slot <= row; slot++) {
    pegs.push({
      x: CENTER_X + (slot - row / 2) * PEG_DX,
      y: (row + 1) * ROW_DY + TOP_MARGIN,
    })
  }
}

function binX(bin: number) {
  return CENTER_X + (bin - ROWS / 2) * PEG_DX
}

const bet = ref(10)
const dropping = ref(false)
const ballPos = ref({ x: CENTER_X, y: TOP_MARGIN - 12, visible: false })
const landedBin = ref<number | null>(null)
const lastMessage = ref('')
const lastWasWin = ref(false)
const bigWinKey = ref(0)
const bigWinText = ref('')

function drop() {
  if (dropping.value) return
  if (!runStore.placeBet(bet.value, 'plinko')) return

  dropping.value = true
  landedBin.value = null
  lastMessage.value = ''
  sound.playBetPlaced()

  const result = engine.resolveRound(bet.value)
  const payout = engine.payoutFor(result, bet.value)

  ballPos.value = { x: CENTER_X, y: TOP_MARGIN - 12, visible: true }

  const timeline = gsap.timeline({
    onComplete: () => {
      dropping.value = false
      landedBin.value = result.bin
      runStore.settleRound(payout, 'plinko')

      if (payout > bet.value) {
        lastWasWin.value = true
        lastMessage.value = `Landed ×${result.multiplier.toFixed(2)} — +${payout.toLocaleString(undefined, { maximumFractionDigits: 2 })} credits`
        sound.playWin(result.multiplier)
        if (result.multiplier >= 20) {
          bigWinText.value = `BIG DROP ×${result.multiplier.toFixed(0)}`
          bigWinKey.value += 1
          sound.playBigWin()
        }
      } else {
        lastWasWin.value = false
        const delta = payout - bet.value
        lastMessage.value = `Landed ×${result.multiplier.toFixed(2)} — ${delta >= 0 ? '+' : ''}${delta.toFixed(2)} credits`
        sound.playNoWin()
      }

      if (!runStore.isActive) {
        router.push({ name: 'game-over' })
      }
    },
  })

  let rightCount = 0
  result.path.forEach((direction, i) => {
    if (direction === 'R') rightCount++
    const x = CENTER_X + (rightCount - (i + 1) / 2) * PEG_DX
    const y = (i + 1) * ROW_DY + TOP_MARGIN
    timeline.to(ballPos.value, { x, y, duration: 0.12, ease: 'power1.in' })
  })
}
</script>

<template>
  <div class="plinko-board card">
    <svg class="board" :viewBox="`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`" :width="BOARD_WIDTH" :height="BOARD_HEIGHT">
      <circle v-for="(peg, i) in pegs" :key="i" :cx="peg.x" :cy="peg.y" r="2.5" class="peg" />
      <circle v-if="ballPos.visible" :cx="ballPos.x" :cy="ballPos.y" r="6" class="ball" />
    </svg>

    <div class="bins-row" :style="{ width: `${BOARD_WIDTH}px` }">
      <div
        v-for="bin in BINS"
        :key="bin - 1"
        class="bin"
        :class="{ landed: landedBin === bin - 1 }"
        :style="{ left: `${binX(bin - 1)}px` }"
      >
        {{ PLINKO_MULTIPLIERS[bin - 1].toFixed(1) }}×
      </div>
    </div>

    <p class="message" :class="{ win: lastWasWin }">{{ lastMessage || ' ' }}</p>

    <div class="controls">
      <BetControls v-model="bet" :balance="runStore.balance" :disabled="dropping" />
      <button class="btn btn-primary" :disabled="dropping || bet > runStore.balance" @click="drop">
        {{ dropping ? 'Dropping…' : 'Drop Ball' }}
      </button>
    </div>

    <BigWinOverlay :trigger-key="bigWinKey" :text="bigWinText" />
  </div>
</template>

<style scoped>
.plinko-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.board {
  background: var(--bg);
  border-radius: 12px;
}

.peg {
  fill: var(--border);
}

.ball {
  fill: var(--neon-gold);
  filter: drop-shadow(0 0 6px var(--neon-gold));
}

.bins-row {
  position: relative;
  height: 30px;
}

.bin {
  position: absolute;
  transform: translateX(-50%);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-dim);
  white-space: nowrap;
}

.bin.landed {
  border-color: var(--neon-gold);
  color: var(--neon-gold);
  box-shadow: var(--shadow-glow-gold);
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

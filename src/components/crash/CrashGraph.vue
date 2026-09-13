<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import gsap from 'gsap'
import type { CrashRoundOutcome } from '../../types/crash'

const props = defineProps<{
  outcome: CrashRoundOutcome
  roundKey: number
}>()

const GRAPH_WIDTH = 480
const GRAPH_HEIGHT = 220
const MIN_WINDOW_SECONDS = 4 // keeps early motion from feeling too jumpy before the curve has real duration to scale against
const MIN_CEILING = 2 // multiplier floor for the y-axis, so small early moves aren't visually huge
const SAMPLE_INTERVAL = 0.04 // seconds between recorded points, keeps history bounded on long rounds
const DROP_DURATION = 0.4 // seconds the "fall" animation takes before the BUSTED badge appears

interface Point {
  t: number
  m: number
}

const history = ref<Point[]>([{ t: 0, m: 1 }])
let roundStart = performance.now()
let lastSampleT = 0

const graphEl = ref<HTMLElement | null>(null)
const readoutEl = ref<HTMLElement | null>(null)
const dropLine = ref<{ x: number; y0: number; y1: number } | null>(null)
const showBustBadge = ref(false)

function resetForNewRound() {
  history.value = [{ t: 0, m: 1 }]
  roundStart = performance.now()
  lastSampleT = 0
  dropLine.value = null
  showBustBadge.value = false
}

watch(() => props.roundKey, () => {
  if (props.roundKey > 0) resetForNewRound()
})

watch(
  () => props.outcome,
  (outcome) => {
    if (outcome.status === 'idle') {
      resetForNewRound()
      return
    }

    if (outcome.status === 'running') {
      const t = (performance.now() - roundStart) / 1000
      if (t - lastSampleT >= SAMPLE_INTERVAL) {
        history.value.push({ t, m: outcome.multiplier })
        lastSampleT = t
      }
      return
    }

    if (outcome.status === 'busted') {
      playBustAnimation()
      return
    }

    // cashed-out: append one final point so the curve reaches the true end value
    const t = (performance.now() - roundStart) / 1000
    history.value.push({ t, m: outcome.multiplier })
  },
  { deep: true },
)

const currentElapsed = computed(() => history.value[history.value.length - 1]?.t ?? 0)
const xScale = computed(() => GRAPH_WIDTH / Math.max(currentElapsed.value, MIN_WINDOW_SECONDS))
const currentCeiling = computed(() =>
  Math.max(history.value.reduce((max, p) => Math.max(max, p.m), MIN_CEILING) * 1.15, MIN_CEILING),
)

function xFor(t: number) {
  return t * xScale.value
}

function yFor(m: number) {
  const t = Math.min((m - 1) / (currentCeiling.value - 1), 1)
  return GRAPH_HEIGHT - t * GRAPH_HEIGHT
}

function playBustAnimation() {
  showBustBadge.value = false
  const last = history.value[history.value.length - 1]
  const startX = xFor(last?.t ?? 0)
  const startY = yFor(last?.m ?? 1)
  const dropProxy = { y: startY }
  dropLine.value = { x: startX, y0: startY, y1: startY }

  gsap.to(dropProxy, {
    y: GRAPH_HEIGHT + 30,
    duration: DROP_DURATION,
    ease: 'power3.in',
    onUpdate: () => {
      if (dropLine.value) dropLine.value.y1 = dropProxy.y
    },
    onComplete: () => {
      showBustBadge.value = true
    },
  })

  if (graphEl.value) {
    gsap.fromTo(
      graphEl.value,
      { x: -6 },
      { x: 6, duration: 0.06, repeat: 6, yoyo: true, ease: 'power1.inOut', clearProps: 'x' },
    )
  }

  if (readoutEl.value) {
    gsap.fromTo(readoutEl.value, { scale: 1.4 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' })
  }
}

const pathD = computed(() => {
  if (history.value.length < 2) return ''
  return history.value.map((p, i) => `${i === 0 ? 'M' : 'L'}${xFor(p.t)},${yFor(p.m)}`).join(' ')
})

const readout = computed(() => {
  if (props.outcome.status === 'running') return `${props.outcome.multiplier.toFixed(2)}x`
  if (props.outcome.status === 'cashed-out') return `${props.outcome.multiplier.toFixed(2)}x`
  if (props.outcome.status === 'busted') return `${props.outcome.crashPoint.toFixed(2)}x`
  return '1.00x'
})
</script>

<template>
  <div ref="graphEl" class="crash-graph card" :class="outcome.status">
    <svg :viewBox="`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`" preserveAspectRatio="none">
      <path :d="pathD" class="curve" fill="none" />
      <line
        v-if="dropLine"
        :x1="dropLine.x"
        :y1="dropLine.y0"
        :x2="dropLine.x"
        :y2="dropLine.y1"
        class="drop-line"
      />
    </svg>
    <div ref="readoutEl" class="readout glow-text">{{ readout }}</div>
    <div v-if="outcome.status === 'busted' && showBustBadge" class="badge busted">BUSTED</div>
    <div v-if="outcome.status === 'cashed-out'" class="badge cashed">CASHED OUT</div>
  </div>
</template>

<style scoped>
.crash-graph {
  position: relative;
  width: 100%;
  max-width: 520px;
  height: 240px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.curve {
  stroke: var(--neon-cyan);
  stroke-width: 3;
  filter: drop-shadow(0 0 6px var(--neon-cyan));
}

.drop-line {
  stroke: var(--neon-red);
  stroke-width: 3;
  filter: drop-shadow(0 0 8px var(--neon-red));
}

.crash-graph.busted .curve {
  stroke: var(--neon-red);
  filter: drop-shadow(0 0 6px var(--neon-red));
}

.crash-graph.cashed-out .curve {
  stroke: var(--neon-green);
  filter: drop-shadow(0 0 6px var(--neon-green));
}

.readout {
  font-size: 2.6rem;
  font-weight: 800;
  color: var(--neon-cyan);
  z-index: 1;
}

.crash-graph.busted .readout {
  color: var(--neon-red);
}

.crash-graph.cashed-out .readout {
  color: var(--neon-green);
}

.badge {
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.badge.busted {
  background: var(--neon-red);
  color: #1a0006;
}

.badge.cashed {
  background: var(--neon-green);
  color: #002b12;
}
</style>

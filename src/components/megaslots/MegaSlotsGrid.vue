<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MegaSlotsResult } from '../../types/megaSlots'
import { PAYLINES, REEL_COUNT, ROW_COUNT } from '../../data/megaSlotsConfig'
import MegaSlotsReel from './MegaSlotsReel.vue'

const props = defineProps<{
  result: MegaSlotsResult | null
  spinKey: number
}>()

const emit = defineEmits<{
  finished: []
}>()

const REEL_W = 64
const ROW_H = 64
const GAP = 4

const landedCount = ref(0)
const showLines = ref(false)

const gridWidth = REEL_COUNT * REEL_W + (REEL_COUNT - 1) * GAP
const gridHeight = ROW_COUNT * ROW_H

function cellX(reel: number) {
  return reel * (REEL_W + GAP) + REEL_W / 2
}
function cellY(row: number) {
  return row * ROW_H + ROW_H / 2
}

watch(
  () => props.spinKey,
  () => {
    if (props.spinKey <= 0) return
    landedCount.value = 0
    showLines.value = false
  },
)

function onReelLanded() {
  landedCount.value += 1
  if (landedCount.value === REEL_COUNT) {
    showLines.value = true
    emit('finished')
  }
}

const columns = computed(() => {
  if (!props.result) return Array.from({ length: REEL_COUNT }, () => Array(ROW_COUNT).fill(''))
  return props.result.grid
})

const LINE_COLORS = ['#29f5e0', '#ff3dd8', '#ffcc4d', '#4dff9e', '#ff4d6d', '#8a7dff', '#ff9e4d', '#4dc9ff', '#c94dff']

const winningPaths = computed(() => {
  if (!showLines.value || !props.result) return []
  return props.result.winningLines.map((win) => {
    const line = PAYLINES[win.lineIndex]
    const points = Array.from({ length: win.count }, (_, reel) => `${cellX(reel)},${cellY(line[reel])}`).join(' ')
    return { key: win.lineIndex, points, color: LINE_COLORS[win.lineIndex % LINE_COLORS.length] }
  })
})
</script>

<template>
  <div class="grid-wrap" :style="{ width: gridWidth + 'px' }">
    <div class="reels-row" :style="{ gap: `${GAP}px` }">
      <MegaSlotsReel
        v-for="(column, i) in columns"
        :key="i"
        :result-column="column"
        :spin-key="spinKey"
        :delay="i * 0.12"
        @landed="onReelLanded"
      />
    </div>
    <svg class="lines-overlay" :viewBox="`0 0 ${gridWidth} ${gridHeight}`" :width="gridWidth" :height="gridHeight">
      <polyline
        v-for="path in winningPaths"
        :key="path.key"
        :points="path.points"
        :stroke="path.color"
        fill="none"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="win-line"
        :style="{ color: path.color }"
      />
    </svg>
  </div>
</template>

<style scoped>
.grid-wrap {
  position: relative;
}

.reels-row {
  display: flex;
}

.lines-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.win-line {
  opacity: 0;
  animation: line-in 0.3s ease forwards;
  filter: drop-shadow(0 0 4px currentColor);
}

@keyframes line-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 0.9;
  }
}
</style>

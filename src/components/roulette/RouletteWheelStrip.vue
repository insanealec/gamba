<script setup lang="ts">
import { ref, watch } from 'vue'
import gsap from 'gsap'
import { colorFor } from '../../data/rouletteConfig'

const props = defineProps<{
  wheelOrder: string[]
  resultPocket: string | null
  spinKey: number
}>()

const emit = defineEmits<{
  landed: []
}>()

const ITEM_WIDTH = 52
const VISIBLE_COUNT = 5
const VIEWPORT_WIDTH = ITEM_WIDTH * VISIBLE_COUNT
const FILLER = 44

const stripEl = ref<HTMLElement | null>(null)
const strip = ref(buildStrip(props.resultPocket))

function buildStrip(resultPocket: string | null) {
  const filler = Array.from(
    { length: FILLER },
    () => props.wheelOrder[Math.floor(Math.random() * props.wheelOrder.length)],
  )
  return [...filler, resultPocket ?? props.wheelOrder[0]]
}

watch(
  () => props.spinKey,
  async () => {
    if (props.spinKey <= 0 || !props.resultPocket) return
    strip.value = buildStrip(props.resultPocket)
    const el = stripEl.value
    if (!el) return

    await new Promise((r) => setTimeout(r, 0))
    const finalX = (VIEWPORT_WIDTH - ITEM_WIDTH) / 2 - (strip.value.length - 1) * ITEM_WIDTH
    gsap.set(el, { x: 0 })
    gsap.to(el, {
      x: finalX,
      duration: 2.4,
      ease: 'power3.out',
      onComplete: () => emit('landed'),
    })
  },
)
</script>

<template>
  <div class="wheel-viewport" :style="{ width: `${VIEWPORT_WIDTH}px` }">
    <div ref="stripEl" class="wheel-strip">
      <div v-for="(pocket, i) in strip" :key="i" class="pocket-item" :class="colorFor(pocket)">
        {{ pocket }}
      </div>
    </div>
    <div class="center-marker" />
  </div>
</template>

<style scoped>
.wheel-viewport {
  position: relative;
  height: 52px;
  overflow: hidden;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.wheel-strip {
  display: flex;
}

.pocket-item {
  flex: 0 0 52px;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  color: #fff;
  border-right: 1px solid rgba(0, 0, 0, 0.3);
}

.pocket-item.red {
  background: #b3122a;
}

.pocket-item.black {
  background: #1a1a1a;
}

.pocket-item.green {
  background: #0f7a3d;
}

.center-marker {
  position: absolute;
  top: -4px;
  bottom: -4px;
  left: 50%;
  width: 2px;
  background: var(--neon-gold);
  box-shadow: var(--shadow-glow-gold);
  transform: translateX(-1px);
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import gsap from 'gsap'
import { SLOT_SYMBOLS } from '../../data/slotsConfig'
import { pickWeighted } from '../../composables/useRng'

const props = defineProps<{
  resultSymbolId: string
  spinKey: number
  delay: number
}>()

const ITEM_HEIGHT = 96
const STRIP_LENGTH = 24

const stripEl = ref<HTMLElement | null>(null)
const strip = ref(buildStrip(props.resultSymbolId))
const settled = ref(true)

function buildStrip(resultId: string) {
  const filler = Array.from({ length: STRIP_LENGTH - 1 }, () => pickWeighted(SLOT_SYMBOLS))
  const result = SLOT_SYMBOLS.find((s) => s.id === resultId) ?? SLOT_SYMBOLS[0]
  return [...filler, result]
}

watch(
  () => props.spinKey,
  async () => {
    if (props.spinKey <= 0) return
    settled.value = false
    strip.value = buildStrip(props.resultSymbolId)
    const el = stripEl.value
    if (!el) return

    await new Promise((r) => setTimeout(r, 0))
    gsap.set(el, { y: 0 })
    gsap.to(el, {
      y: -(STRIP_LENGTH - 1) * ITEM_HEIGHT,
      duration: 1.4,
      delay: props.delay,
      ease: 'power2.out',
      onComplete: () => {
        settled.value = true
      },
    })
  },
)
</script>

<template>
  <div class="reel-viewport">
    <div ref="stripEl" class="reel-strip">
      <div v-for="(symbol, i) in strip" :key="i" class="reel-item">
        {{ symbol.icon }}
      </div>
    </div>
    <div class="payline" :class="{ active: settled }" />
  </div>
</template>

<style scoped>
.reel-viewport {
  position: relative;
  width: 96px;
  height: 96px;
  overflow: hidden;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.reel-strip {
  display: flex;
  flex-direction: column;
}

.reel-item {
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.6rem;
}

.payline {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-1px);
  background: transparent;
}

.payline.active {
  background: var(--neon-magenta);
  box-shadow: var(--shadow-glow-magenta);
}
</style>

<script setup lang="ts">
import { ref, watch } from 'vue'
import gsap from 'gsap'
import { MEGA_SYMBOLS } from '../../data/megaSlotsConfig'
import { pickWeighted } from '../../composables/useRng'

const props = defineProps<{
  resultColumn: string[] // [top, mid, bottom]
  spinKey: number
  delay: number
}>()

const emit = defineEmits<{
  landed: []
}>()

const ITEM_HEIGHT = 64
const STRIP_FILLER = 22

const stripEl = ref<HTMLElement | null>(null)
const strip = ref(buildStrip(props.resultColumn))

function buildStrip(resultColumn: string[]) {
  const filler = Array.from({ length: STRIP_FILLER }, () => pickWeighted(MEGA_SYMBOLS))
  const result = resultColumn.map((id) => MEGA_SYMBOLS.find((s) => s.id === id) ?? MEGA_SYMBOLS[0])
  return [...filler, ...result]
}

function iconFor(symbol: (typeof MEGA_SYMBOLS)[number]) {
  return symbol.icon
}

watch(
  () => props.spinKey,
  async () => {
    if (props.spinKey <= 0) return
    strip.value = buildStrip(props.resultColumn)
    const el = stripEl.value
    if (!el) return

    await new Promise((r) => setTimeout(r, 0))
    gsap.set(el, { y: 0 })
    gsap.to(el, {
      y: -(strip.value.length - 3) * ITEM_HEIGHT,
      duration: 1.3,
      delay: props.delay,
      ease: 'power2.out',
      onComplete: () => emit('landed'),
    })
  },
)
</script>

<template>
  <div class="reel-viewport">
    <div ref="stripEl" class="reel-strip">
      <div v-for="(symbol, i) in strip" :key="i" class="reel-item">
        {{ iconFor(symbol) }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.reel-viewport {
  position: relative;
  width: 64px;
  height: 192px;
  overflow: hidden;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
}

.reel-strip {
  display: flex;
  flex-direction: column;
}

.reel-item {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}
</style>

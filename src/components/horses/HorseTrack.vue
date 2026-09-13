<script setup lang="ts">
import { ref, watch } from 'vue'
import gsap from 'gsap'
import type { HorseDef, HorseRaceResult } from '../../types/horses'

const props = defineProps<{
  horses: HorseDef[]
  raceKey: number
  result: HorseRaceResult | null
}>()

const emit = defineEmits<{
  finished: []
}>()

const BASE_DURATION = 3 // seconds for the 1st-place finisher
const RANK_GAP = 0.25 // seconds added per finish position further back
const JITTER = 0.08 // kept well under half of RANK_GAP so it can never flip the guaranteed finish order

// Linear motion only. Any easing that decelerates near the end (power*.out)
// makes a horse's icon visually creep asymptotically close to the finish
// flag well before its tween actually completes — so a slower horse can
// *look* done first while a different horse's tween is the one that
// actually reaches progress 1 first. Constant speed keeps "looks done" and
// "is done" the same thing.
const EASE = 'none'

const progress = ref<Record<string, number>>(Object.fromEntries(props.horses.map((h) => [h.id, 0])))
const finished = ref<Record<string, boolean>>(Object.fromEntries(props.horses.map((h) => [h.id, false])))

watch(
  () => props.raceKey,
  () => {
    const result = props.result
    if (props.raceKey <= 0 || !result) return

    props.horses.forEach((horse) => {
      progress.value[horse.id] = 0
      finished.value[horse.id] = false
    })

    // Completion is driven by GSAP's own onComplete callbacks rather than a
    // parallel setTimeout — requestAnimationFrame-based tweens can stall
    // while a tab is backgrounded/unfocused, and a wall-clock timer would
    // then fire and settle the bet before the animation visually catches up.
    let remaining = props.horses.length

    props.horses.forEach((horse) => {
      const rank = result.finishOrder.indexOf(horse.id)
      const jitter = (Math.random() * 2 - 1) * JITTER
      const duration = Math.max(0.6, BASE_DURATION + rank * RANK_GAP + jitter)

      const proxy = { value: 0 }
      gsap.to(proxy, {
        value: 1,
        duration,
        ease: EASE,
        onUpdate: () => {
          progress.value[horse.id] = proxy.value
        },
        onComplete: () => {
          finished.value[horse.id] = true
          remaining -= 1
          if (remaining === 0) emit('finished')
        },
      })
    })
  },
)
</script>

<template>
  <div class="track">
    <div
      v-for="horse in horses"
      :key="horse.id"
      class="lane"
      :class="{ winner: result && finished[horse.id] && result.winnerId === horse.id }"
    >
      <span class="lane-label">{{ horse.name }}</span>
      <div class="lane-rail">
        <span class="runner" :style="{ left: `calc(${progress[horse.id] * 100}% - ${progress[horse.id] * 26}px)` }">{{
          horse.icon
        }}</span>
        <span class="finish-flag">🏁</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.track {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lane {
  display: grid;
  grid-template-columns: 110px 1fr;
  align-items: center;
  gap: 10px;
}

.lane-label {
  font-size: 0.82rem;
  color: var(--text-dim);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lane.winner .lane-label {
  color: var(--neon-gold);
  font-weight: 700;
}

.lane-rail {
  position: relative;
  height: 34px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  background-image: repeating-linear-gradient(
    to right,
    var(--border) 0,
    var(--border) 2px,
    transparent 2px,
    transparent 24px
  );
}

.lane.winner .lane-rail {
  border-color: var(--neon-gold);
  box-shadow: var(--shadow-glow-gold);
}

.runner {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.4rem;
  line-height: 1;
}

.finish-flag {
  position: absolute;
  right: -4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
}
</style>

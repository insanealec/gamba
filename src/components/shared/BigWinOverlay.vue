<script setup lang="ts">
import { ref, watch } from 'vue'
import gsap from 'gsap'

const props = defineProps<{
  triggerKey: number
  text: string
}>()

const visible = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const particleCount = 16
const particles = Array.from({ length: particleCount }, (_, i) => i)

watch(
  () => props.triggerKey,
  async () => {
    if (props.triggerKey <= 0) return
    visible.value = true
    await new Promise((r) => setTimeout(r, 0))
    const root = rootEl.value
    if (!root) return

    const badge = root.querySelector('.big-win-badge')
    const dots = root.querySelectorAll<HTMLElement>('.particle')

    const tl = gsap.timeline({
      onComplete: () => {
        visible.value = false
      },
    })

    tl.fromTo(
      badge,
      { scale: 0.4, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' },
    )

    dots.forEach((dot, i) => {
      const angle = (i / particleCount) * Math.PI * 2
      const dist = 120 + Math.random() * 60
      tl.to(
        dot,
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          opacity: 0,
          duration: 0.9,
          ease: 'power2.out',
        },
        '<',
      )
    })

    tl.to(badge, { scale: 0.9, opacity: 0, duration: 0.4, ease: 'power1.in' }, '+=0.5')
  },
)
</script>

<template>
  <div v-if="visible" ref="rootEl" class="big-win-overlay">
    <div class="particle-field">
      <span v-for="p in particles" :key="p" class="particle">✦</span>
    </div>
    <div class="big-win-badge glow-text">{{ text }}</div>
  </div>
</template>

<style scoped>
.big-win-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 50;
}

.particle-field {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.particle {
  position: absolute;
  color: var(--neon-gold);
  font-size: 1.4rem;
}

.big-win-badge {
  background: linear-gradient(135deg, var(--neon-gold), var(--neon-magenta));
  color: #1a0d00;
  padding: 18px 40px;
  border-radius: 999px;
  font-size: 1.6rem;
  font-weight: 800;
  box-shadow: 0 0 40px rgba(255, 204, 77, 0.6);
}
</style>

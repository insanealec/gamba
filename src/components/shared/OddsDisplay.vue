<script setup lang="ts">
const props = defineProps<{
  label: string
  rtp: number
}>()

const rtpPct = () => (props.rtp * 100).toFixed(1)
const edgePct = () => ((1 - props.rtp) * 100).toFixed(1)
</script>

<template>
  <div class="odds-chip">
    <span class="odds-label">{{ label }}</span>
    <span class="odds-stat">RTP {{ rtpPct() }}%</span>
    <span class="odds-sep">·</span>
    <span class="odds-stat">House Edge {{ edgePct() }}%</span>
  </div>
</template>

<style scoped>
.odds-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 0.82rem;
  color: var(--text-dim);
}

.odds-label {
  font-weight: 700;
  color: var(--neon-cyan);
}

.odds-sep {
  opacity: 0.5;
}
</style>

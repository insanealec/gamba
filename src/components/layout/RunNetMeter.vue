<script setup lang="ts">
import { computed } from 'vue'
import { useRunStore } from '../../stores/runStore'

const runStore = useRunStore()

const net = computed(() => runStore.stats.totalPaidOut - runStore.stats.totalWagered)

function fmt(n: number) {
  const sign = n > 0 ? '+' : ''
  return `${sign}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}
</script>

<template>
  <div v-if="runStore.isActive" class="net-chip" :class="{ down: net < 0, up: net > 0 }">
    <span class="net-label">This Run</span>
    <span class="net-value">{{ fmt(net) }}</span>
  </div>
</template>

<style scoped>
.net-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.15;
  padding: 4px 14px;
  border-radius: 10px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
}

.net-label {
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-dim);
}

.net-value {
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--text-dim);
}

.net-chip.down .net-value {
  color: var(--neon-red);
}

.net-chip.up .net-value {
  color: var(--neon-green);
}
</style>

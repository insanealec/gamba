<script setup lang="ts">
import { useRunStore } from '../../stores/runStore'

const runStore = useRunStore()
</script>

<template>
  <div v-if="runStore.isActive" class="balance-chip">
    <span class="balance-icon">🪙</span>
    <span class="balance-value">{{ runStore.balance.toLocaleString() }}</span>
  </div>
</template>

<style scoped>
.balance-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--neon-gold);
  border-radius: 999px;
  padding: 8px 18px;
  box-shadow: var(--shadow-glow-gold);
}

.balance-icon {
  font-size: 1.1rem;
}

.balance-value {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--neon-gold);
}
</style>

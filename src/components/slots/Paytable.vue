<script setup lang="ts">
import { SLOT_SYMBOLS, multiplierFor } from '../../data/slotsConfig'
</script>

<template>
  <div class="paytable card">
    <h3>Paytable — 3 in a row pays</h3>
    <ul>
      <li v-for="symbol in SLOT_SYMBOLS" :key="symbol.id">
        <span class="icons">{{ symbol.icon }}{{ symbol.icon }}{{ symbol.icon }}</span>
        <span class="label">{{ symbol.label }}</span>
        <span class="mult">×{{ multiplierFor(symbol.id) }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.paytable h3 {
  margin: 0 0 14px;
  font-size: 0.95rem;
  color: var(--text-dim);
}

.paytable ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.paytable li {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icons {
  font-size: 1.2rem;
  min-width: 90px;
}

.label {
  flex: 1;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.mult {
  font-weight: 700;
  color: var(--neon-gold);
}
</style>

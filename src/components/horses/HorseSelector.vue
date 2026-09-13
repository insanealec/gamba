<script setup lang="ts">
import { HORSES, fractionalOddsFor } from '../../data/horsesConfig'

defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="horse-selector">
    <button
      v-for="horse in HORSES"
      :key="horse.id"
      type="button"
      class="horse-card"
      :class="{ selected: modelValue === horse.id }"
      :disabled="disabled"
      @click="emit('update:modelValue', horse.id)"
    >
      <span class="horse-icon">{{ horse.icon }}</span>
      <span class="horse-name">{{ horse.name }}</span>
      <span class="horse-odds">{{ fractionalOddsFor(horse.id) }}</span>
    </button>
  </div>
</template>

<style scoped>
.horse-selector {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  width: 100%;
}

.horse-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 8px;
  color: var(--text);
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.horse-card:not(:disabled):not(.selected):hover {
  border-color: var(--neon-cyan);
  transform: translateY(-1px);
}

.horse-card.selected {
  border-color: var(--neon-magenta);
  box-shadow: var(--shadow-glow-magenta);
}

.horse-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.horse-icon {
  font-size: 1.6rem;
}

.horse-name {
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.horse-odds {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--neon-gold);
}
</style>

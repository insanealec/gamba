<script setup lang="ts">
import { computed } from 'vue'
import { NUMBER_ROWS, colorFor, outsideBets } from '../../data/rouletteConfig'
import type { WheelType } from '../../types/roulette'

const props = defineProps<{
  modelValue: string
  wheelType: WheelType
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const zeroPockets = computed(() => (props.wheelType === 'american' ? ['0', '00'] : ['0']))
const outside = outsideBets()
// Flattened row-major so a plain 12-column CSS grid auto-places each row of
// NUMBER_ROWS on its own grid row, without needing a nested v-for.
const flatNumbers = NUMBER_ROWS.flat()

function select(id: string) {
  if (props.disabled) return
  emit('update:modelValue', id)
}
</script>

<template>
  <div class="roulette-table">
    <div class="grid-row">
      <button
        v-for="zero in zeroPockets"
        :key="zero"
        type="button"
        class="cell zero"
        :class="{ selected: modelValue === `straight-${zero}` }"
        :disabled="disabled"
        @click="select(`straight-${zero}`)"
      >
        {{ zero }}
      </button>
      <div class="numbers-grid">
        <button
          v-for="num in flatNumbers"
          :key="num"
          type="button"
          class="cell"
          :class="[colorFor(String(num)), { selected: modelValue === `straight-${num}` }]"
          :disabled="disabled"
          @click="select(`straight-${num}`)"
        >
          {{ num }}
        </button>
      </div>
    </div>

    <div class="outside-bets">
      <button
        v-for="bet in outside"
        :key="bet.id"
        type="button"
        class="outside-cell"
        :class="{ selected: modelValue === bet.id }"
        :disabled="disabled"
        @click="select(bet.id)"
      >
        {{ bet.label }} <span class="mult">×{{ bet.multiplier }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.roulette-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.grid-row {
  display: flex;
  gap: 6px;
  align-items: stretch;
}

.numbers-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: 1fr;
  gap: 4px;
}

.cell {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 8px 2px;
  min-width: 0;
}

.cell.red {
  background: #b3122a;
}

.cell.black {
  background: #1a1a1a;
}

.cell.green,
.cell.zero {
  background: #0f7a3d;
  width: 36px;
}

.cell.selected {
  border-color: var(--neon-gold);
  box-shadow: var(--shadow-glow-gold);
}

.cell:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.outside-bets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 6px;
}

.outside-cell {
  cursor: pointer;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-dim);
  font-weight: 600;
  font-size: 0.8rem;
  padding: 8px 6px;
}

.outside-cell .mult {
  color: var(--neon-gold);
  font-weight: 800;
}

.outside-cell.selected {
  border-color: var(--neon-gold);
  color: var(--text);
  box-shadow: var(--shadow-glow-gold);
}

.outside-cell:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

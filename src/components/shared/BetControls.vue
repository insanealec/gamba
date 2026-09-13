<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  balance: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const presets = [10, 25, 50, 100]

// Below a 1-credit balance (reachable now that fractional payouts exist —
// e.g. horse racing odds like x2.91), a bet of exactly the remaining
// fractional balance must stay biddable. Rounding up to a minimum bet of 1
// here would exceed the balance, making placeBet() reject every bet and
// permanently soft-lock the run at a few fractional credits with no way to
// ever reach zero.
const clamp = (value: number) => {
  if (props.balance <= 0) return 0
  if (props.balance < 1) return props.balance
  return Math.max(1, Math.min(Math.round(value), props.balance))
}

function setBet(value: number) {
  emit('update:modelValue', clamp(value))
}

function onInput(event: Event) {
  const raw = Number((event.target as HTMLInputElement).value)
  if (!Number.isNaN(raw)) setBet(raw)
}

const maxDisabled = computed(() => props.balance <= 0)
</script>

<template>
  <div class="bet-controls">
    <label class="bet-input-wrap">
      <span>Bet</span>
      <input
        type="number"
        :min="Math.min(1, Math.max(balance, 0))"
        :max="balance"
        :value="modelValue"
        :disabled="disabled"
        @input="onInput"
      />
    </label>
    <div class="presets">
      <button
        v-for="amount in presets"
        :key="amount"
        type="button"
        class="chip"
        :disabled="disabled || amount > balance"
        @click="setBet(amount)"
      >
        {{ amount }}
      </button>
      <button type="button" class="chip" :disabled="disabled || maxDisabled" @click="setBet(balance)">
        Max
      </button>
    </div>
  </div>
</template>

<style scoped>
.bet-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.bet-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.bet-input-wrap input {
  width: 100px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  padding: 8px 10px;
  font-size: 1rem;
  font-weight: 700;
}

.presets {
  display: flex;
  gap: 6px;
}

.chip {
  cursor: pointer;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-dim);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 600;
}

.chip:not(:disabled):hover {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}

.chip:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>

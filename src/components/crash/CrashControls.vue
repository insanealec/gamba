<script setup lang="ts">
import BetControls from '../shared/BetControls.vue'
import type { CrashRoundOutcome } from '../../types/crash'

const props = defineProps<{
  bet: number
  balance: number
  outcome: CrashRoundOutcome
}>()

const emit = defineEmits<{
  'update:bet': [value: number]
  'place-bet': []
  'cash-out': []
}>()

const isRunning = () => props.outcome.status === 'running'
const isIdle = () => props.outcome.status === 'idle' || props.outcome.status === 'cashed-out' || props.outcome.status === 'busted'

const potentialPayout = () => {
  const outcome = props.outcome
  if (outcome.status !== 'running') return null
  return (props.bet * outcome.multiplier).toFixed(2)
}
</script>

<template>
  <div class="crash-controls">
    <BetControls
      :model-value="bet"
      :balance="balance"
      :disabled="isRunning()"
      @update:model-value="emit('update:bet', $event)"
    />
    <button
      v-if="isIdle()"
      class="btn btn-primary"
      :disabled="bet > balance"
      @click="emit('place-bet')"
    >
      Place Bet
    </button>
    <button v-else class="btn btn-danger" @click="emit('cash-out')">
      Cash Out — {{ potentialPayout() }} credits
    </button>
  </div>
</template>

<style scoped>
.crash-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}
</style>

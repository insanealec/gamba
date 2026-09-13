<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRunStore } from '../../stores/runStore'
import { useSound } from '../../composables/useSound'

const runStore = useRunStore()
const router = useRouter()
const sound = useSound()

const armed = ref(false)
let disarmTimer: ReturnType<typeof setTimeout> | null = null

function disarm() {
  armed.value = false
  if (disarmTimer) {
    clearTimeout(disarmTimer)
    disarmTimer = null
  }
}

function onClick() {
  if (runStore.roundInFlight) return

  if (!armed.value) {
    armed.value = true
    disarmTimer = setTimeout(disarm, 4000)
    return
  }

  disarm()
  if (runStore.cashOutRun()) {
    sound.playRunCashOut()
    router.push({ name: 'game-over' })
  }
}

onBeforeUnmount(disarm)
</script>

<template>
  <button
    v-if="runStore.isActive"
    type="button"
    class="cash-out-btn"
    :class="{ armed }"
    :disabled="runStore.roundInFlight"
    :title="runStore.roundInFlight ? 'Wait for the current bet to resolve' : undefined"
    @click="onClick"
  >
    {{ armed ? `Bank ${runStore.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}?` : 'Cash Out' }}
  </button>
</template>

<style scoped>
.cash-out-btn {
  cursor: pointer;
  background: var(--bg-elevated);
  border: 1px solid var(--neon-red);
  color: var(--neon-red);
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.cash-out-btn:not(:disabled):hover {
  background: var(--neon-red);
  color: #1a0006;
}

.cash-out-btn.armed {
  background: var(--neon-red);
  color: #1a0006;
  box-shadow: 0 0 12px rgba(255, 77, 109, 0.5);
}

.cash-out-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

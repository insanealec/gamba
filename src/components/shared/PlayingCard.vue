<script setup lang="ts">
import { computed } from 'vue'
import { isRed } from '../../data/deck'
import type { Card } from '../../types/cards'

const props = defineProps<{
  card?: Card | null
  faceDown?: boolean
  highlighted?: boolean
}>()

const red = computed(() => (props.card ? isRed(props.card.suit) : false))
</script>

<template>
  <div class="playing-card" :class="{ 'face-down': faceDown || !card, highlighted, red }">
    <template v-if="card && !faceDown">
      <span class="rank">{{ card.rank }}</span>
      <span class="suit">{{ card.suit }}</span>
    </template>
    <span v-else class="back">🂠</span>
  </div>
</template>

<style scoped>
.playing-card {
  width: 56px;
  height: 78px;
  border-radius: 8px;
  background: #f2eefc;
  color: #1a1a1a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  border: 2px solid var(--border);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.playing-card.red {
  color: #c22;
}

.rank {
  font-size: 1.2rem;
  line-height: 1.1;
}

.suit {
  font-size: 1.1rem;
  line-height: 1.1;
}

.playing-card.face-down {
  background: var(--bg-elevated);
  border-color: var(--neon-magenta);
}

.back {
  font-size: 2rem;
  color: var(--neon-magenta);
}

.playing-card.highlighted {
  border-color: var(--neon-gold);
  box-shadow: var(--shadow-glow-gold);
}
</style>

<script setup lang="ts">
import { GRID_SIZE } from '../../data/minesConfig'

const props = defineProps<{
  minePositions: number[]
  revealedTiles: boolean[]
  roundEnded: boolean
  disabled: boolean
}>()

const emit = defineEmits<{
  reveal: [index: number]
}>()

function isMine(i: number) {
  return props.minePositions.includes(i)
}

function tileClass(i: number) {
  const clicked = props.revealedTiles[i]
  if (clicked) {
    return isMine(i) ? 'mine-clicked' : 'gem-clicked'
  }
  if (props.roundEnded) {
    return isMine(i) ? 'mine-reveal' : 'gem-reveal'
  }
  return 'hidden'
}

function onClickTile(i: number) {
  if (props.disabled || props.revealedTiles[i] || props.roundEnded) return
  emit('reveal', i)
}
</script>

<template>
  <div class="mines-grid">
    <button
      v-for="i in GRID_SIZE"
      :key="i - 1"
      type="button"
      class="tile"
      :class="tileClass(i - 1)"
      :disabled="disabled || revealedTiles[i - 1] || roundEnded"
      @click="onClickTile(i - 1)"
    >
      <span v-if="tileClass(i - 1) === 'hidden'">?</span>
      <span v-else-if="tileClass(i - 1).startsWith('mine')">💣</span>
      <span v-else>💎</span>
    </button>
  </div>
</template>

<style scoped>
.mines-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  width: 100%;
  max-width: 340px;
}

.tile {
  aspect-ratio: 1;
  cursor: pointer;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
  transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.tile.hidden:not(:disabled):hover {
  border-color: var(--neon-cyan);
  transform: translateY(-2px);
}

.tile:disabled {
  cursor: not-allowed;
}

.tile.gem-clicked {
  background: rgba(77, 255, 158, 0.18);
  border-color: var(--neon-green);
  animation: pop-in 0.25s ease;
}

.tile.mine-clicked {
  background: rgba(255, 77, 109, 0.25);
  border-color: var(--neon-red);
  animation: pop-in 0.25s ease;
}

.tile.gem-reveal,
.tile.mine-reveal {
  opacity: 0.45;
}

@keyframes pop-in {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>

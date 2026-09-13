<script setup lang="ts">
import { computed } from 'vue'
import { useAudioStore } from '../../stores/audioStore'

const audio = useAudioStore()

const displayVolume = computed<number>({
  get: () => (audio.muted ? 0 : Math.round(audio.volume * 100)),
  set: (value) => audio.setVolume(value / 100),
})

const icon = computed(() => {
  if (audio.muted || audio.volume === 0) return '🔇'
  if (audio.volume < 0.5) return '🔉'
  return '🔊'
})
</script>

<template>
  <div class="volume-control">
    <button
      type="button"
      class="mute-btn"
      :aria-label="audio.muted ? 'Unmute' : 'Mute'"
      @click="audio.toggleMute"
    >
      {{ icon }}
    </button>
    <input
      v-model.number="displayVolume"
      type="range"
      min="0"
      max="100"
      step="1"
      class="volume-slider"
      aria-label="Volume"
    />
  </div>
</template>

<style scoped>
.volume-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.mute-btn {
  cursor: pointer;
  background: none;
  border: none;
  font-size: 1.1rem;
  padding: 4px;
  line-height: 1;
}

.volume-slider {
  width: 80px;
  accent-color: var(--neon-cyan);
  cursor: pointer;
}
</style>

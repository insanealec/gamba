import { defineStore } from 'pinia'

const STORAGE_KEY = 'gamba-audio-settings'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { volume: 0.5, muted: false }
    const parsed = JSON.parse(raw)
    return {
      volume: typeof parsed.volume === 'number' ? Math.min(1, Math.max(0, parsed.volume)) : 0.5,
      muted: Boolean(parsed.muted),
    }
  } catch {
    return { volume: 0.5, muted: false }
  }
}

export const useAudioStore = defineStore('audio', {
  state: () => loadInitial(),
  actions: {
    /** Setting volume to 0 mutes; setting it above 0 un-mutes — matches standard OS volume slider behavior. */
    setVolume(value: number) {
      this.volume = Math.min(1, Math.max(0, value))
      this.muted = this.volume === 0
      this.persist()
    },
    toggleMute() {
      this.muted = !this.muted
      this.persist()
    },
    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: this.volume, muted: this.muted }))
      } catch {
        // private-browsing / storage-restricted environments — non-critical, just won't persist
      }
    },
  },
})

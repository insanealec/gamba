import { watch } from 'vue'
import { useAudioStore } from '../stores/audioStore'

// All sounds are synthesized with the Web Audio API rather than loaded from
// audio files — keeps the app fully self-contained with no external assets.
// A single AudioContext + master GainNode is shared across every call site
// (this module's top-level state acts as a singleton), so the volume/mute
// slider in the header controls every sound uniformly and in real time.

let ctx: AudioContext | null = null
let masterGain: GainNode | null = null
let volumeWatcherStarted = false

function ensureContext(): AudioContext {
  if (!ctx) {
    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AudioContextCtor()
    masterGain = ctx.createGain()
    masterGain.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  if (!volumeWatcherStarted) {
    volumeWatcherStarted = true
    const audioStore = useAudioStore()
    watch(
      () => [audioStore.volume, audioStore.muted] as const,
      ([volume, muted]) => {
        if (!masterGain || !ctx) return
        masterGain.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.01)
      },
      { immediate: true },
    )
  }
  return ctx
}

interface ToneOptions {
  type?: OscillatorType
  gain?: number
  attack?: number
  release?: number
  delay?: number
}

function tone(freq: number, duration: number, opts: ToneOptions = {}) {
  const context = ensureContext()
  const { type = 'sine', gain = 0.22, attack = 0.01, release = duration, delay = 0 } = opts

  const osc = context.createOscillator()
  const g = context.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.connect(g)
  g.connect(masterGain!)

  const start = context.currentTime + delay
  g.gain.setValueAtTime(0, start)
  g.gain.linearRampToValueAtTime(gain, start + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, start + attack + release)

  osc.start(start)
  osc.stop(start + attack + release + 0.02)
}

function sequence(notes: (ToneOptions & { freq: number; duration: number })[]) {
  notes.forEach(({ freq, duration, ...opts }) => tone(freq, duration, opts))
}

function noiseBurst(duration = 0.3, gain = 0.3) {
  const context = ensureContext()
  const bufferSize = Math.floor(context.sampleRate * duration)
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }

  const source = context.createBufferSource()
  source.buffer = buffer

  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 500

  const g = context.createGain()
  g.gain.value = gain

  source.connect(filter)
  filter.connect(g)
  g.connect(masterGain!)
  source.start()
}

// Crash's rising tone is continuous (starts on bet, pitch tracks the climbing
// multiplier, stops on bust/cashout), so it needs persistent oscillator state
// rather than the one-shot tone() helper above.
let risingOsc: OscillatorNode | null = null
let risingGain: GainNode | null = null

function startRisingTone() {
  const context = ensureContext()
  stopRisingTone(true)

  risingOsc = context.createOscillator()
  risingGain = context.createGain()
  risingOsc.type = 'sawtooth'
  risingOsc.frequency.value = 110
  risingGain.gain.value = 0
  risingOsc.connect(risingGain)
  risingGain.connect(masterGain!)
  risingOsc.start()
  risingGain.gain.linearRampToValueAtTime(0.05, context.currentTime + 0.2)
}

function updateRisingTone(multiplier: number) {
  if (!risingOsc || !ctx) return
  const freq = Math.min(110 + (multiplier - 1) * 90, 900)
  risingOsc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.05)
}

function stopRisingTone(immediate = false) {
  if (!risingOsc || !risingGain || !ctx) return
  const osc = risingOsc
  const g = risingGain
  risingOsc = null
  risingGain = null

  const now = ctx.currentTime
  const rampTime = immediate ? 0.02 : 0.15
  g.gain.cancelScheduledValues(now)
  g.gain.setValueAtTime(g.gain.value, now)
  g.gain.linearRampToValueAtTime(0.0001, now + rampTime)
  osc.stop(now + rampTime + 0.02)
}

export function useSound() {
  return {
    playSpinStart() {
      tone(180, 0.12, { type: 'square', gain: 0.07 })
    },
    playReelLand() {
      tone(320, 0.08, { type: 'triangle', gain: 0.16 })
    },
    playNoWin() {
      tone(140, 0.15, { type: 'sine', gain: 0.07 })
    },
    playWin(multiplier: number) {
      const boost = Math.min(multiplier / 90, 1)
      const notes = [523.25, 659.25, 783.99].map((freq) => freq * (1 + boost * 0.25))
      sequence(
        notes.map((freq, i) => ({
          freq,
          duration: 0.16 + boost * 0.05,
          delay: i * 0.07,
          type: 'triangle' as OscillatorType,
          gain: 0.2 + boost * 0.05,
        })),
      )
    },
    playBigWin() {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]
      sequence(
        notes.map((freq, i) => ({
          freq,
          duration: 0.22,
          delay: i * 0.09,
          type: 'sawtooth' as OscillatorType,
          gain: 0.22,
        })),
      )
    },
    playBetPlaced() {
      tone(440, 0.08, { type: 'square', gain: 0.12 })
    },
    playRaceStart() {
      tone(880, 0.08, { type: 'square', gain: 0.15 })
      tone(880, 0.08, { type: 'square', gain: 0.15, delay: 0.14 })
    },
    playCashout(multiplier: number) {
      const boost = Math.min(multiplier / 5, 2)
      sequence([
        { freq: 523.25, duration: 0.12, delay: 0, type: 'triangle', gain: 0.22 },
        { freq: 659.25 * (1 + boost * 0.15), duration: 0.18, delay: 0.1, type: 'triangle', gain: 0.24 },
      ])
    },
    playBust() {
      noiseBurst(0.35, 0.3)
      tone(140, 0.35, { type: 'sawtooth', gain: 0.18, release: 0.35 })
    },
    playGameOver() {
      sequence([
        { freq: 392, duration: 0.25, delay: 0, type: 'sine', gain: 0.2 },
        { freq: 329.63, duration: 0.25, delay: 0.22, type: 'sine', gain: 0.2 },
        { freq: 261.63, duration: 0.45, delay: 0.44, type: 'sine', gain: 0.22 },
      ])
    },
    playStartRun() {
      sequence([
        { freq: 392, duration: 0.12, delay: 0, type: 'triangle', gain: 0.18 },
        { freq: 523.25, duration: 0.18, delay: 0.1, type: 'triangle', gain: 0.2 },
      ])
    },
    playRunCashOut() {
      sequence([
        { freq: 392.0, duration: 0.2, delay: 0, type: 'triangle', gain: 0.2 },
        { freq: 493.88, duration: 0.2, delay: 0.15, type: 'triangle', gain: 0.22 },
        { freq: 587.33, duration: 0.25, delay: 0.3, type: 'triangle', gain: 0.24 },
        { freq: 783.99, duration: 0.4, delay: 0.48, type: 'triangle', gain: 0.26 },
      ])
    },
    startRisingTone,
    updateRisingTone,
    stopRisingTone,
  }
}

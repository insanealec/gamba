<script setup lang="ts">
const props = defineProps<{
  label: string
  rtp: number
}>()

const rtpPct = () => (props.rtp * 100).toFixed(1)
const edgePct = () => ((1 - props.rtp) * 100).toFixed(1)
</script>

<template>
  <div class="odds-chip">
    <span class="odds-label">{{ label }}</span>
    <span class="odds-stat">RTP {{ rtpPct() }}%</span>
    <span class="odds-sep">·</span>
    <span class="odds-stat">House Edge {{ edgePct() }}%</span>
    <details class="odds-info">
      <summary aria-label="What do RTP and House Edge mean?">ⓘ</summary>
      <div class="odds-tooltip">
        <strong>RTP</strong> (Return to Player) is the average share of every credit wagered that
        comes back to players over many, many rounds — this game's {{ rtpPct() }}% means about
        {{ rtpPct() }} credits come back for every 100 bet, in the long run.
        <strong>House Edge</strong> is just the rest ({{ edgePct() }}%), the house's average cut.
        Any single spin or run swings wildly from this — it only holds up over a lot of play.
      </div>
    </details>
  </div>
</template>

<style scoped>
.odds-chip {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 16px;
  font-size: 0.82rem;
  color: var(--text-dim);
}

.odds-label {
  font-weight: 700;
  color: var(--neon-cyan);
}

.odds-sep {
  opacity: 0.5;
}

.odds-info {
  display: inline-flex;
}

.odds-info summary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  list-style: none;
  color: var(--text-dim);
  font-size: 0.9rem;
}

.odds-info summary::-webkit-details-marker {
  display: none;
}

.odds-info summary:hover,
.odds-info[open] summary {
  color: var(--neon-cyan);
}

.odds-tooltip {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  padding: 12px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  font-size: 0.78rem;
  line-height: 1.55;
  color: var(--text-dim);
  z-index: 20;
}

.odds-tooltip strong {
  color: var(--text);
}
</style>

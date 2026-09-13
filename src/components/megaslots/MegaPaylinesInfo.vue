<script setup lang="ts">
import { MEGA_PAYTABLE, MEGA_SYMBOLS, PAYLINES, REEL_COUNT, ROW_COUNT } from '../../data/megaSlotsConfig'

const cells = Array.from({ length: REEL_COUNT }, (_, reel) =>
  Array.from({ length: ROW_COUNT }, (_, row) => ({ reel, row })),
).flat()

function cellX(reel: number) {
  return reel * 10 + 5
}
function cellY(row: number) {
  return row * 10 + 5
}
</script>

<template>
  <div class="mega-info">
    <div class="paytable card">
      <h3>Paytable — consecutive matches from reel 1</h3>
      <ul>
        <li v-for="symbol in MEGA_SYMBOLS" :key="symbol.id">
          <span class="icon">{{ symbol.icon }}</span>
          <span class="label">{{ symbol.label }}</span>
          <span class="mults">
            <span>3× {{ MEGA_PAYTABLE[symbol.id][3] }}</span>
            <span>4× {{ MEGA_PAYTABLE[symbol.id][4] }}</span>
            <span>5× {{ MEGA_PAYTABLE[symbol.id][5] }}</span>
          </span>
        </li>
      </ul>
    </div>

    <div class="paylines card">
      <h3>{{ PAYLINES.length }} Paylines</h3>
      <p class="hint">Your bet splits evenly across all of these every spin. Any of them can win at once.</p>
      <div class="lines-grid">
        <svg v-for="(line, i) in PAYLINES" :key="i" class="mini-line" viewBox="0 0 50 30">
          <polyline
            :points="line.map((row, reel) => `${cellX(reel)},${cellY(row)}`).join(' ')"
            fill="none"
            stroke="var(--neon-cyan)"
            stroke-width="1.5"
          />
          <circle
            v-for="cell in cells"
            :key="`${cell.reel}-${cell.row}`"
            :cx="cellX(cell.reel)"
            :cy="cellY(cell.row)"
            r="2.2"
            :class="{ active: line[cell.reel] === cell.row }"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mega-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.paytable h3,
.paylines h3 {
  margin: 0 0 12px;
  font-size: 0.95rem;
  color: var(--text-dim);
}

.paytable ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.paytable li {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.label {
  flex: 1;
  color: var(--text-dim);
  font-size: 0.82rem;
}

.mults {
  display: flex;
  gap: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--neon-gold);
}

.hint {
  margin: 0 0 12px;
  font-size: 0.78rem;
  color: var(--text-dim);
}

.lines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: 10px;
}

.mini-line {
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.mini-line circle {
  fill: var(--border);
}

.mini-line circle.active {
  fill: var(--neon-magenta);
}
</style>

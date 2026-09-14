<script setup lang="ts">
import BalanceDisplay from './BalanceDisplay.vue'
import VolumeControl from './VolumeControl.vue'
import RunNetMeter from './RunNetMeter.vue'
import CashOutButton from './CashOutButton.vue'
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="brand">GAMBARUN<span class="brand-dot">.</span></RouterLink>
    <nav class="nav">
      <RouterLink to="/stats">Lifetime Stats</RouterLink>
      <RouterLink to="/help">Help &amp; Resources</RouterLink>
    </nav>
    <VolumeControl />
    <RunNetMeter />
    <CashOutButton />
    <BalanceDisplay />
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 20px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
  background: rgba(11, 7, 20, 0.8);
  backdrop-filter: blur(6px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand {
  font-weight: 800;
  font-size: 1.3rem;
  letter-spacing: 0.05em;
  color: var(--neon-cyan);
  text-decoration: none;
}

.brand-dot {
  color: var(--neon-magenta);
}

.nav {
  flex: 1;
  display: flex;
  gap: 20px;
}

.nav a {
  color: var(--text-dim);
  text-decoration: none;
  font-size: 0.9rem;
}

.nav a:hover {
  color: var(--neon-cyan);
}
</style>

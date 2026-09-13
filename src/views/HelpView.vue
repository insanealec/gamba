<script setup lang="ts">
import { HELP_RESOURCES } from '../data/helpResources'
</script>

<template>
  <div class="help-view">
    <h1>Help &amp; Resources</h1>
    <p>
      Gamba is a free, fake-money simulator meant to make the math of gambling visible. If
      real-money gambling is affecting you or someone you know, these resources are free,
      confidential, and available any time.
    </p>

    <div class="resources">
      <div v-for="r in HELP_RESOURCES" :key="r.name" class="resource card">
        <h2>{{ r.name }}</h2>
        <p>{{ r.description }}</p>
        <p v-if="r.phone" class="phone">{{ r.phone }}</p>
        <a v-if="r.url" :href="r.url" target="_blank" rel="noopener noreferrer">{{ r.url }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.help-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.help-view > p {
  max-width: 640px;
  color: var(--text-dim);
  line-height: 1.5;
}

.resources {
  display: grid;
  gap: 16px;
}

.resource h2 {
  margin: 0 0 6px;
  font-size: 1.1rem;
  color: var(--neon-cyan);
}

.resource p {
  margin: 0 0 6px;
  color: var(--text-dim);
}

.phone {
  font-weight: 700;
  color: var(--neon-gold) !important;
  font-size: 1.1rem;
}
</style>

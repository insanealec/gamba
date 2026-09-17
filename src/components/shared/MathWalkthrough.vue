<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <details class="math-card card">
    <summary>
      <span class="math-title">{{ title }}</span>
      <span class="math-chevron">▾</span>
    </summary>
    <div class="math-body">
      <slot />
    </div>
  </details>
</template>

<style scoped>
.math-card {
  padding: 0;
  overflow: hidden;
}

.math-card summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.math-card summary::-webkit-details-marker {
  display: none;
}

.math-title {
  font-weight: 700;
  color: var(--text);
}

.math-chevron {
  color: var(--text-dim);
  transition: transform 0.15s ease;
}

.math-card[open] .math-chevron {
  transform: rotate(180deg);
}

.math-card:not([open]) .math-body {
  display: none;
}

.math-body {
  padding: 0 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}
</style>

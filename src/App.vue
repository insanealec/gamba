<script setup lang="ts">
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<template>
  <AppHeader />
  <main class="page">
    <RouterView />
  </main>
  <AppFooter />
</template>

<script setup lang="ts"></script>

<template>
  <footer class="app-footer">
    <p>
      Gamba is a free simulator. No real money, cryptocurrency, or prizes are ever involved — it's
      practice for your brain, not a wager.
    </p>
    <div class="footer-links">
      <RouterLink to="/stats" class="help-link">Lifetime Stats</RouterLink>
      <RouterLink to="/help" class="help-link">Help &amp; Resources</RouterLink>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--border);
  padding: 20px 24px 32px;
  text-align: center;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.app-footer p {
  max-width: 560px;
  margin: 0 auto 10px;
}

.footer-links {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.help-link {
  color: var(--neon-cyan);
  text-decoration: none;
  font-weight: 600;
}

.help-link:hover {
  text-decoration: underline;
}
</style>

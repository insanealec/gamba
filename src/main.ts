import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import gsap from 'gsap'
import './assets/styles/main.css'
import App from './App.vue'
import router from './router'
import { useRunStore } from './stores/runStore'

// Disable GSAP's default lag-smoothing: after a stall (a backgrounded tab,
// a slow device), animations should catch up to the real elapsed time
// immediately rather than being artificially slowed to "smooth over" the
// gap — game-outcome-linked animations (reels, crash curve, races) should
// never visually diverge from the actual timing of the result they reveal.
gsap.ticker.lagSmoothing(0)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(router)

// runStore is already rehydrated from localStorage at this point (the
// persistence plugin hydrates synchronously on first use) — reconcile a
// round left mid-flight before the router's initial navigation resolves.
useRunStore().recoverInterruptedRound()

app.mount('#app')

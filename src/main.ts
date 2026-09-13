import { createApp } from 'vue'
import { createPinia } from 'pinia'
import gsap from 'gsap'
import './assets/styles/main.css'
import App from './App.vue'
import router from './router'

// Disable GSAP's default lag-smoothing: after a stall (a backgrounded tab,
// a slow device), animations should catch up to the real elapsed time
// immediately rather than being artificially slowed to "smooth over" the
// gap — game-outcome-linked animations (reels, crash curve, races) should
// never visually diverge from the actual timing of the result they reveal.
gsap.ticker.lagSmoothing(0)

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

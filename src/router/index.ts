import { createRouter, createWebHistory } from 'vue-router'
import { runGuard } from '../composables/useRunGuard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'lobby', component: () => import('../views/LobbyView.vue') },
    { path: '/slots', name: 'slots', component: () => import('../views/SlotsView.vue') },
    { path: '/crash', name: 'crash', component: () => import('../views/CrashView.vue') },
    { path: '/horses', name: 'horses', component: () => import('../views/HorseRaceView.vue') },
    { path: '/mega-slots', name: 'mega-slots', component: () => import('../views/MegaSlotsView.vue') },
    { path: '/mines', name: 'mines', component: () => import('../views/MinesView.vue') },
    { path: '/plinko', name: 'plinko', component: () => import('../views/PlinkoView.vue') },
    { path: '/dice', name: 'dice', component: () => import('../views/DiceView.vue') },
    { path: '/roulette', name: 'roulette', component: () => import('../views/RouletteView.vue') },
    { path: '/blackjack', name: 'blackjack', component: () => import('../views/BlackjackView.vue') },
    { path: '/video-poker', name: 'video-poker', component: () => import('../views/VideoPokerView.vue') },
    { path: '/casino-war', name: 'casino-war', component: () => import('../views/CasinoWarView.vue') },
    { path: '/game-over', name: 'game-over', component: () => import('../views/GameOverView.vue') },
    { path: '/help', name: 'help', component: () => import('../views/HelpView.vue') },
    { path: '/stats', name: 'lifetime-stats', component: () => import('../views/LifetimeStatsView.vue') },
  ],
})

router.beforeEach(runGuard)

export default router

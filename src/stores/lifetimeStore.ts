import { defineStore } from 'pinia'
import type { GameId, LifetimeStats, RunSummary } from '../types/game'
import { ALL_GAME_IDS, emptyRoundsByGame } from '../types/game'

const STORAGE_KEY = 'gamba-lifetime-stats'

function emptyStats(): LifetimeStats {
  return {
    runsCompleted: 0,
    totalWagered: 0,
    totalPaidOut: 0,
    totalGained: 0,
    totalLost: 0,
    roundsPlayed: 0,
    roundsByGame: emptyRoundsByGame(),
    totalPeakBalance: 0,
    bestPeakBalance: 0,
    cashedOutRuns: 0,
  }
}

function loadInitial(): LifetimeStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStats()
    const parsed = JSON.parse(raw)
    const roundsByGame = emptyRoundsByGame()
    for (const id of ALL_GAME_IDS) {
      roundsByGame[id] = Number(parsed.roundsByGame?.[id]) || 0
    }
    return {
      runsCompleted: Number(parsed.runsCompleted) || 0,
      totalWagered: Number(parsed.totalWagered) || 0,
      totalPaidOut: Number(parsed.totalPaidOut) || 0,
      totalGained: Number(parsed.totalGained) || 0,
      totalLost: Number(parsed.totalLost) || 0,
      roundsPlayed: Number(parsed.roundsPlayed) || 0,
      roundsByGame,
      totalPeakBalance: Number(parsed.totalPeakBalance) || 0,
      bestPeakBalance: Number(parsed.bestPeakBalance) || 0,
      cashedOutRuns: Number(parsed.cashedOutRuns) || 0,
    }
  } catch {
    return emptyStats()
  }
}

export const useLifetimeStore = defineStore('lifetime', {
  state: (): LifetimeStats => loadInitial(),
  getters: {
    net: (state) => state.totalPaidOut - state.totalWagered,
    realizedHouseEdge: (state) =>
      state.totalWagered > 0 ? (state.totalWagered - state.totalPaidOut) / state.totalWagered : 0,
    averagePeakBalance: (state) => (state.runsCompleted > 0 ? state.totalPeakBalance / state.runsCompleted : 0),
    bustedRuns: (state) => state.runsCompleted - state.cashedOutRuns,
    /** Fraction of completed runs that ended by choice rather than busting to
     * 0 — the closest thing this app has to "did you know when to stop?" */
    cashOutRate: (state) => (state.runsCompleted > 0 ? state.cashedOutRuns / state.runsCompleted : 0),
    /**
     * Now that voluntary cash-out exists, net-per-run actually varies (it's
     * no longer guaranteed to be -startingBalance for every run), so the
     * lifetime average is meaningful again.
     */
    averageNetPerRun(): number {
      return this.runsCompleted > 0 ? this.net / this.runsCompleted : 0
    },
  },
  actions: {
    /** Folds one completed run's totals into the running lifetime totals. Called exactly once
     * per run, from runStore.finishRun() — the single place a run is ever marked as over. */
    recordRun(summary: RunSummary) {
      this.runsCompleted += 1
      this.totalWagered += summary.totalWagered
      this.totalPaidOut += summary.totalPaidOut
      this.totalGained += summary.totalGained
      this.totalLost += summary.totalLost
      this.roundsPlayed += summary.roundsPlayed
      for (const id of ALL_GAME_IDS) {
        this.roundsByGame[id as GameId] += summary.roundsByGame[id as GameId]
      }
      this.totalPeakBalance += summary.peakBalance
      this.bestPeakBalance = Math.max(this.bestPeakBalance, summary.peakBalance)
      if (summary.endedBy === 'cash-out') this.cashedOutRuns += 1
      this.persist()
    },
    persist() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            runsCompleted: this.runsCompleted,
            totalWagered: this.totalWagered,
            totalPaidOut: this.totalPaidOut,
            totalGained: this.totalGained,
            totalLost: this.totalLost,
            roundsPlayed: this.roundsPlayed,
            roundsByGame: this.roundsByGame,
            totalPeakBalance: this.totalPeakBalance,
            bestPeakBalance: this.bestPeakBalance,
            cashedOutRuns: this.cashedOutRuns,
          }),
        )
      } catch {
        // private-browsing / storage-restricted environments — non-critical, just won't persist
      }
    },
  },
})

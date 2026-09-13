import { defineStore } from 'pinia'
import type { GameId, RunEndReason, RunStats, RunSummary } from '../types/game'
import { emptyRoundsByGame } from '../types/game'
import { useLifetimeStore } from './lifetimeStore'

const STARTING_BALANCE = 1000

function emptyStats(): RunStats {
  return {
    totalWagered: 0,
    totalPaidOut: 0,
    roundsPlayed: 0,
    roundsByGame: emptyRoundsByGame(),
  }
}

export const useRunStore = defineStore('run', {
  state: () => ({
    isActive: false,
    balance: 0,
    peakBalance: 0,
    /** True from a successful placeBet() until the matching settleRound() —
     * blocks voluntary cash-out mid-round so a pending bet's stake can never
     * be stranded (already deducted, but never resolved into a final summary). */
    roundInFlight: false,
    stats: emptyStats(),
    lastRunSummary: null as RunSummary | null,
  }),
  actions: {
    startRun() {
      this.balance = STARTING_BALANCE
      this.peakBalance = STARTING_BALANCE
      this.roundInFlight = false
      this.stats = emptyStats()
      this.isActive = true
      this.lastRunSummary = null
    },

    /** Deducts a bet from the balance. Returns false (and does nothing) if the bet is invalid. */
    placeBet(amount: number, game: GameId): boolean {
      if (!this.isActive || amount <= 0 || amount > this.balance) return false
      this.balance -= amount
      this.stats.totalWagered += amount
      this.stats.roundsPlayed += 1
      this.stats.roundsByGame[game] += 1
      this.roundInFlight = true
      return true
    },

    /** Credits a round's payout and checks whether the run just ended. */
    settleRound(payout: number, _game: GameId) {
      this.roundInFlight = false
      if (payout > 0) {
        this.balance += payout
        this.stats.totalPaidOut += payout
        this.peakBalance = Math.max(this.peakBalance, this.balance)
      }
      this.checkRunEnd()
    },

    checkRunEnd() {
      if (!this.isActive || this.balance > 0) return
      this.finishRun('bust')
    },

    /** Voluntarily ends the run, banking the current balance. Returns false
     * (and does nothing) if there's no active run or a bet is still resolving. */
    cashOutRun(): boolean {
      if (!this.isActive || this.roundInFlight) return false
      this.finishRun('cash-out')
      return true
    },

    finishRun(endedBy: RunEndReason) {
      const { totalWagered, totalPaidOut, roundsPlayed, roundsByGame } = this.stats
      const net = totalPaidOut - totalWagered
      const summary: RunSummary = {
        totalWagered,
        totalPaidOut,
        net,
        realizedHouseEdge: totalWagered > 0 ? -net / totalWagered : 0,
        roundsPlayed,
        roundsByGame: { ...roundsByGame },
        peakBalance: this.peakBalance,
        finalBalance: this.balance,
        endedBy,
      }
      this.lastRunSummary = summary
      this.isActive = false
      useLifetimeStore().recordRun(summary)
    },
  },
})

import { defineStore } from 'pinia'
import type { GameId, RunEndReason, RunStats, RunSummary } from '../types/game'
import { emptyRoundsByGame } from '../types/game'
import { useLifetimeStore } from './lifetimeStore'

const STARTING_BALANCE = 1000

function emptyStats(): RunStats {
  return {
    totalWagered: 0,
    totalPaidOut: 0,
    totalGained: 0,
    totalLost: 0,
    roundsPlayed: 0,
    roundsByGame: emptyRoundsByGame(),
  }
}

export const useRunStore = defineStore('run', {
  persist: {
    key: 'gamba-run-session',
  },
  state: () => ({
    isActive: false,
    balance: 0,
    peakBalance: 0,
    /** True from a successful placeBet() until the matching settleRound() —
     * blocks voluntary cash-out mid-round so a pending bet's stake can never
     * be stranded (already deducted, but never resolved into a final summary). */
    roundInFlight: false,
    /** The amount wagered on the round currently in flight — remembered here
     * (rather than passed back into settleRound) so the store can work out
     * that round's actual gain/loss on its own, with no game view needing to
     * hand its bet amount back at settlement time. */
    currentBet: 0,
    stats: emptyStats(),
    lastRunSummary: null as RunSummary | null,
  }),
  actions: {
    startRun() {
      this.balance = STARTING_BALANCE
      this.peakBalance = STARTING_BALANCE
      this.roundInFlight = false
      this.currentBet = 0
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
      this.currentBet = amount
      return true
    },

    /** Credits a round's payout and checks whether the run just ended. */
    settleRound(payout: number, _game: GameId) {
      this.roundInFlight = false
      // Profit only (not the returned stake) on a win, and only the portion
      // of the stake not returned on a loss — a push (payout === bet) is
      // neither. Together these always sum back to totalPaidOut - totalWagered.
      if (payout > this.currentBet) this.stats.totalGained += payout - this.currentBet
      else if (payout < this.currentBet) this.stats.totalLost += this.currentBet - payout
      if (payout > 0) {
        this.balance += payout
        this.stats.totalPaidOut += payout
        this.peakBalance = Math.max(this.peakBalance, this.balance)
      }
      this.currentBet = 0
      this.checkRunEnd()
    },

    checkRunEnd() {
      if (!this.isActive || this.balance > 0) return
      this.finishRun('bust')
    },

    /** Called once at app boot, after the persisted run is rehydrated from
     * localStorage. A round left `roundInFlight` can only mean the tab was
     * closed (or crashed) between placeBet() and settleRound() — the same
     * "torn down mid-round" situation every game's onUnmounted guard already
     * handles, just via a page reload instead of a route change. The stake
     * was already deducted, so resolving it as a loss (no payout) is the
     * only consistent way to un-strand it. */
    recoverInterruptedRound() {
      if (!this.roundInFlight) return
      this.roundInFlight = false
      this.stats.totalLost += this.currentBet
      this.currentBet = 0
      this.checkRunEnd()
    },

    /** Voluntarily ends the run, banking the current balance. Returns false
     * (and does nothing) if there's no active run or a bet is still resolving. */
    cashOutRun(): boolean {
      if (!this.isActive || this.roundInFlight) return false
      this.finishRun('cash-out')
      return true
    },

    finishRun(endedBy: RunEndReason) {
      const { totalWagered, totalPaidOut, totalGained, totalLost, roundsPlayed, roundsByGame } = this.stats
      const net = totalPaidOut - totalWagered
      const summary: RunSummary = {
        totalWagered,
        totalPaidOut,
        totalGained,
        totalLost,
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

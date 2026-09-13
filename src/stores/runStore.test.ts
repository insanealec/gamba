import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRunStore } from './runStore'
import { useLifetimeStore } from './lifetimeStore'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('runStore', () => {
  it('starts inactive with zero balance before startRun', () => {
    const store = useRunStore()
    expect(store.isActive).toBe(false)
    expect(store.balance).toBe(0)
  })

  it('startRun sets balance to 1000, activates the run, and resets stats', () => {
    const store = useRunStore()
    store.startRun()
    expect(store.isActive).toBe(true)
    expect(store.balance).toBe(1000)
    expect(store.peakBalance).toBe(1000)
    expect(store.roundInFlight).toBe(false)
    expect(store.stats.totalWagered).toBe(0)
    expect(store.stats.roundsPlayed).toBe(0)
    expect(store.lastRunSummary).toBeNull()
  })

  describe('placeBet', () => {
    it('fails when there is no active run', () => {
      const store = useRunStore()
      expect(store.placeBet(10, 'slots')).toBe(false)
    })

    it('fails for a non-positive amount', () => {
      const store = useRunStore()
      store.startRun()
      expect(store.placeBet(0, 'slots')).toBe(false)
      expect(store.placeBet(-5, 'slots')).toBe(false)
      expect(store.balance).toBe(1000)
    })

    it('fails when the bet exceeds the balance, and leaves balance untouched', () => {
      const store = useRunStore()
      store.startRun()
      expect(store.placeBet(1001, 'slots')).toBe(false)
      expect(store.balance).toBe(1000)
    })

    it('allows betting exactly the full balance (boundary case)', () => {
      const store = useRunStore()
      store.startRun()
      expect(store.placeBet(1000, 'slots')).toBe(true)
      expect(store.balance).toBe(0)
    })

    it('deducts balance, tracks wagered/rounds, and sets roundInFlight on success', () => {
      const store = useRunStore()
      store.startRun()
      expect(store.placeBet(100, 'slots')).toBe(true)
      expect(store.balance).toBe(900)
      expect(store.stats.totalWagered).toBe(100)
      expect(store.stats.roundsPlayed).toBe(1)
      expect(store.stats.roundsByGame.slots).toBe(1)
      expect(store.roundInFlight).toBe(true)
    })

    it('fails once the run has ended, even if called again', () => {
      const store = useRunStore()
      store.startRun()
      store.placeBet(1000, 'slots')
      store.settleRound(0, 'slots') // busts to 0, run ends
      expect(store.isActive).toBe(false)
      expect(store.placeBet(10, 'slots')).toBe(false)
    })
  })

  describe('settleRound', () => {
    it('credits a payout, updates peakBalance, and clears roundInFlight', () => {
      const store = useRunStore()
      store.startRun()
      store.placeBet(100, 'slots')
      store.settleRound(250, 'slots')
      expect(store.balance).toBe(900 + 250)
      expect(store.stats.totalPaidOut).toBe(250)
      expect(store.peakBalance).toBe(1150)
      expect(store.roundInFlight).toBe(false)
    })

    it('a zero payout does not touch totalPaidOut or peakBalance', () => {
      const store = useRunStore()
      store.startRun()
      store.placeBet(100, 'slots')
      store.settleRound(0, 'slots')
      expect(store.stats.totalPaidOut).toBe(0)
      expect(store.peakBalance).toBe(1000)
    })

    it('ends the run as a bust exactly when balance reaches 0, not before', () => {
      const store = useRunStore()
      store.startRun()
      store.placeBet(500, 'slots')
      store.settleRound(0, 'slots') // balance now 500
      expect(store.isActive).toBe(true)

      store.placeBet(500, 'slots')
      store.settleRound(0, 'slots') // balance now 0
      expect(store.isActive).toBe(false)
      expect(store.lastRunSummary?.endedBy).toBe('bust')
      expect(store.lastRunSummary?.finalBalance).toBe(0)
    })
  })

  describe('cashOutRun', () => {
    it('fails when there is no active run', () => {
      const store = useRunStore()
      expect(store.cashOutRun()).toBe(false)
    })

    it('fails while a bet is still resolving (roundInFlight) — the whole reason it exists', () => {
      const store = useRunStore()
      store.startRun()
      store.placeBet(10, 'slots')
      expect(store.roundInFlight).toBe(true)
      expect(store.cashOutRun()).toBe(false)
      expect(store.isActive).toBe(true)
    })

    it('succeeds once the round has settled, banking the current balance', () => {
      const store = useRunStore()
      store.startRun()
      store.placeBet(100, 'slots')
      store.settleRound(150, 'slots') // balance now 1050
      expect(store.cashOutRun()).toBe(true)
      expect(store.isActive).toBe(false)
      expect(store.lastRunSummary?.endedBy).toBe('cash-out')
      expect(store.lastRunSummary?.finalBalance).toBe(1050)
      expect(store.lastRunSummary?.net).toBe(50)
    })
  })

  describe('recoverInterruptedRound', () => {
    it('does nothing when no round is in flight', () => {
      const store = useRunStore()
      store.startRun()
      store.recoverInterruptedRound()
      expect(store.isActive).toBe(true)
      expect(store.balance).toBe(1000)
    })

    it('resolves a stranded bet as a loss (simulating a reload mid-round) without crediting a payout', () => {
      const store = useRunStore()
      store.startRun()
      store.placeBet(200, 'slots') // balance now 800, roundInFlight true — as if the tab closed here
      store.recoverInterruptedRound()
      expect(store.roundInFlight).toBe(false)
      expect(store.balance).toBe(800)
      expect(store.stats.totalPaidOut).toBe(0)
      expect(store.isActive).toBe(true)
    })

    it('ends the run as a bust if the stranded bet was the last of the balance', () => {
      const store = useRunStore()
      store.startRun()
      store.placeBet(1000, 'slots')
      store.recoverInterruptedRound()
      expect(store.isActive).toBe(false)
      expect(store.lastRunSummary?.endedBy).toBe('bust')
    })
  })

  describe('finishRun summary math', () => {
    it('computes net, realizedHouseEdge, and peakBalance correctly on a total loss', () => {
      const store = useRunStore()
      store.startRun()
      store.placeBet(1000, 'slots')
      store.settleRound(0, 'slots')

      const summary = store.lastRunSummary!
      expect(summary.totalWagered).toBe(1000)
      expect(summary.totalPaidOut).toBe(0)
      expect(summary.net).toBe(-1000)
      expect(summary.realizedHouseEdge).toBe(1)
      expect(summary.peakBalance).toBe(1000)
    })

    it('folds the completed run into lifetimeStore exactly once', () => {
      const runStore = useRunStore()
      const lifetimeStore = useLifetimeStore()
      runStore.startRun()
      runStore.placeBet(1000, 'slots')
      runStore.settleRound(0, 'slots')

      expect(lifetimeStore.runsCompleted).toBe(1)
      expect(lifetimeStore.totalWagered).toBe(1000)
    })
  })
})

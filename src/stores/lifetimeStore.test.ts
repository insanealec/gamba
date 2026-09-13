import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useLifetimeStore } from './lifetimeStore'
import { emptyRoundsByGame } from '../types/game'
import type { RunEndReason, RunSummary } from '../types/game'

function fakeSummary(overrides: Partial<RunSummary> = {}): RunSummary {
  const roundsByGame = emptyRoundsByGame()
  roundsByGame.slots = 5
  return {
    totalWagered: 1000,
    totalPaidOut: 0,
    net: -1000,
    realizedHouseEdge: 1,
    roundsPlayed: 5,
    roundsByGame,
    peakBalance: 1000,
    finalBalance: 0,
    endedBy: 'bust' as RunEndReason,
    ...overrides,
  }
}

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('lifetimeStore', () => {
  it('starts empty with no localStorage data', () => {
    const store = useLifetimeStore()
    expect(store.runsCompleted).toBe(0)
    expect(store.totalWagered).toBe(0)
    expect(store.net).toBe(0)
    expect(store.cashOutRate).toBe(0)
  })

  it('recordRun accumulates totals across multiple runs', () => {
    const store = useLifetimeStore()
    store.recordRun(fakeSummary({ totalWagered: 1000, totalPaidOut: 0, peakBalance: 1000 }))
    store.recordRun(fakeSummary({ totalWagered: 500, totalPaidOut: 200, peakBalance: 1300 }))

    expect(store.runsCompleted).toBe(2)
    expect(store.totalWagered).toBe(1500)
    expect(store.totalPaidOut).toBe(200)
    expect(store.net).toBe(-1300)
    expect(store.bestPeakBalance).toBe(1300)
    expect(store.totalPeakBalance).toBe(2300)
  })

  it('accumulates roundsByGame per game id', () => {
    const store = useLifetimeStore()
    const roundsA = emptyRoundsByGame()
    roundsA.slots = 3
    roundsA.dice = 2
    store.recordRun(fakeSummary({ roundsByGame: roundsA, roundsPlayed: 5 }))

    const roundsB = emptyRoundsByGame()
    roundsB.slots = 1
    roundsB.mines = 4
    store.recordRun(fakeSummary({ roundsByGame: roundsB, roundsPlayed: 5 }))

    expect(store.roundsByGame.slots).toBe(4)
    expect(store.roundsByGame.dice).toBe(2)
    expect(store.roundsByGame.mines).toBe(4)
    expect(store.roundsByGame.roulette).toBe(0)
    expect(store.roundsPlayed).toBe(10)
  })

  it('cashOutRate and bustedRuns reflect endedBy across runs', () => {
    const store = useLifetimeStore()
    store.recordRun(fakeSummary({ endedBy: 'bust' }))
    store.recordRun(fakeSummary({ endedBy: 'cash-out' }))
    store.recordRun(fakeSummary({ endedBy: 'cash-out' }))

    expect(store.runsCompleted).toBe(3)
    expect(store.cashedOutRuns).toBe(2)
    expect(store.bustedRuns).toBe(1)
    expect(store.cashOutRate).toBeCloseTo(2 / 3, 10)
  })

  it('averagePeakBalance and averageNetPerRun divide by runsCompleted', () => {
    const store = useLifetimeStore()
    store.recordRun(fakeSummary({ peakBalance: 1000, totalWagered: 1000, totalPaidOut: 0 }))
    store.recordRun(fakeSummary({ peakBalance: 2000, totalWagered: 1000, totalPaidOut: 500 }))

    expect(store.averagePeakBalance).toBe(1500)
    expect(store.net).toBe(-1500) // (0-1000) + (500-1000)
    expect(store.averageNetPerRun).toBe(-750)
  })

  it('realizedHouseEdge is 0 with no wagering yet (avoids divide-by-zero)', () => {
    const store = useLifetimeStore()
    expect(store.realizedHouseEdge).toBe(0)
  })

  it('persists to localStorage and a fresh store instance loads it back', () => {
    const store = useLifetimeStore()
    store.recordRun(fakeSummary({ totalWagered: 777, totalPaidOut: 111, endedBy: 'cash-out' }))

    // Simulate a fresh page load: new Pinia, new store instance, same localStorage.
    setActivePinia(createPinia())
    const reloaded = useLifetimeStore()
    expect(reloaded.runsCompleted).toBe(1)
    expect(reloaded.totalWagered).toBe(777)
    expect(reloaded.totalPaidOut).toBe(111)
    expect(reloaded.cashedOutRuns).toBe(1)
  })

  it('falls back to empty stats when localStorage holds corrupt JSON', () => {
    localStorage.setItem('gamba-lifetime-stats', '{not valid json')
    const store = useLifetimeStore()
    expect(store.runsCompleted).toBe(0)
    expect(store.totalWagered).toBe(0)
  })

  it('falls back to safe defaults when localStorage holds partial/missing fields', () => {
    localStorage.setItem('gamba-lifetime-stats', JSON.stringify({ runsCompleted: 3 }))
    const store = useLifetimeStore()
    expect(store.runsCompleted).toBe(3)
    expect(store.totalWagered).toBe(0)
    expect(store.roundsByGame.slots).toBe(0)
  })
})

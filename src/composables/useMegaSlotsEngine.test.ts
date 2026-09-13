import { describe, expect, it } from 'vitest'
import { useMegaSlotsEngine } from './useMegaSlotsEngine'
import { MEGASLOTS_RTP, PAYLINES, REEL_COUNT, ROW_COUNT } from '../data/megaSlotsConfig'

describe('useMegaSlotsEngine', () => {
  it('grid is always REEL_COUNT columns of ROW_COUNT symbols', () => {
    const engine = useMegaSlotsEngine()
    for (let i = 0; i < 200; i++) {
      const { grid } = engine.resolveRound(9)
      expect(grid).toHaveLength(REEL_COUNT)
      for (const column of grid) {
        expect(column).toHaveLength(ROW_COUNT)
      }
    }
  })

  it('totalPayout is exactly the sum of winning lines\' payouts, and payoutFor agrees', () => {
    const engine = useMegaSlotsEngine()
    for (let i = 0; i < 300; i++) {
      const result = engine.resolveRound(9)
      const expectedTotal = result.winningLines.reduce((sum, w) => sum + w.payout, 0)
      expect(result.totalPayout).toBeCloseTo(expectedTotal, 10)
      expect(engine.payoutFor(result, 9)).toBe(result.totalPayout)
    }
  })

  it('a winning line always has 3+ consecutive matches from reel 1', () => {
    const engine = useMegaSlotsEngine()
    for (let i = 0; i < 500; i++) {
      const { winningLines } = engine.resolveRound(9)
      for (const win of winningLines) {
        expect(win.count).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('simulated RTP over many spins converges to the analytic MEGASLOTS_RTP', () => {
    const engine = useMegaSlotsEngine()
    const bet = PAYLINES.length * 10 // a clean per-line bet
    const N = 50_000
    let totalWagered = 0
    let totalPaid = 0
    for (let i = 0; i < N; i++) {
      totalWagered += bet
      totalPaid += engine.resolveRound(bet).totalPayout
    }
    expect(Math.abs(totalPaid / totalWagered - MEGASLOTS_RTP)).toBeLessThan(0.05)
  })
})

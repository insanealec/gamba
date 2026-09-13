import { describe, expect, it } from 'vitest'
import { useCrashEngine } from './useCrashEngine'
import { CRASH_RTP } from '../data/crashConfig'

describe('useCrashEngine', () => {
  it('never produces a crash point below 1', () => {
    const engine = useCrashEngine()
    for (let i = 0; i < 2000; i++) {
      expect(engine.resolveRound(10).crashPoint).toBeGreaterThanOrEqual(1)
    }
  })

  it('EV of cashing out at ANY fixed multiplier converges to the same target RTP — the defining honesty property of a crash game', () => {
    const engine = useCrashEngine()
    const N = 200_000
    const crashPoints: number[] = []
    for (let i = 0; i < N; i++) {
      crashPoints.push(engine.resolveRound(10).crashPoint)
    }

    for (const m of [1.2, 1.5, 2, 3, 5, 10]) {
      const wins = crashPoints.filter((cp) => cp >= m).length
      const ev = (wins / N) * m
      // Generous tolerance for statistical noise at this sample size — the
      // point is confirming EV doesn't drift with m, not pinning it exactly.
      expect(ev).toBeCloseTo(CRASH_RTP, 1)
    }
  })
})

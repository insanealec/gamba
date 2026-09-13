import { describe, expect, it } from 'vitest'
import { useRouletteEngine } from './useRouletteEngine'
import { AMERICAN_WHEEL_ORDER, EUROPEAN_WHEEL_ORDER, rtpFor } from '../data/rouletteConfig'

describe('useRouletteEngine', () => {
  it('always lands on a real pocket from the selected wheel', () => {
    const european = useRouletteEngine('european')
    for (let i = 0; i < 500; i++) {
      expect(EUROPEAN_WHEEL_ORDER).toContain(european.resolveRound(10).pocket)
    }

    const american = useRouletteEngine('american')
    for (let i = 0; i < 500; i++) {
      expect(AMERICAN_WHEEL_ORDER).toContain(american.resolveRound(10).pocket)
    }
  })

  it('targetRtp matches the wheel type', () => {
    expect(useRouletteEngine('european').targetRtp).toBeCloseTo(rtpFor('european'), 10)
    expect(useRouletteEngine('american').targetRtp).toBeCloseTo(rtpFor('american'), 10)
  })

  it('landing distribution is uniform across all pockets (an honest wheel)', () => {
    const engine = useRouletteEngine('european')
    const N = 50_000
    const counts: Record<string, number> = {}
    for (const pocket of EUROPEAN_WHEEL_ORDER) counts[pocket] = 0

    for (let i = 0; i < N; i++) {
      counts[engine.resolveRound(10).pocket] += 1
    }

    const expectedRate = 1 / EUROPEAN_WHEEL_ORDER.length
    for (const pocket of EUROPEAN_WHEEL_ORDER) {
      expect(counts[pocket] / N).toBeCloseTo(expectedRate, 1)
    }
  })
})

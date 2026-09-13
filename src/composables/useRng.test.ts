import { describe, expect, it } from 'vitest'
import { pickWeighted, randomUnit } from './useRng'

describe('useRng', () => {
  describe('randomUnit', () => {
    it('is always in [0, 1)', () => {
      for (let i = 0; i < 2000; i++) {
        const value = randomUnit()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })
  })

  describe('pickWeighted', () => {
    it('only ever returns an item that was in the list', () => {
      const items = [{ id: 'a', weight: 1 }, { id: 'b', weight: 1 }, { id: 'c', weight: 1 }]
      for (let i = 0; i < 500; i++) {
        expect(items).toContainEqual(pickWeighted(items))
      }
    })

    it('a weight-0 item is never picked', () => {
      const items = [{ id: 'never', weight: 0 }, { id: 'always', weight: 1 }]
      for (let i = 0; i < 500; i++) {
        expect(pickWeighted(items).id).toBe('always')
      }
    })

    it('selection frequency converges to relative weight', () => {
      const items = [
        { id: 'heavy', weight: 90 },
        { id: 'light', weight: 10 },
      ]
      const N = 50_000
      let heavyCount = 0
      for (let i = 0; i < N; i++) {
        if (pickWeighted(items).id === 'heavy') heavyCount++
      }
      expect(heavyCount / N).toBeCloseTo(0.9, 1)
    })
  })
})

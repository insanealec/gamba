import { describe, expect, it } from 'vitest'
import { GRID_SIZE, MINES_RTP, MINE_COUNT_OPTIONS, multiplierAfter } from './minesConfig'

function survivalProbability(safeReveals: number, mineCount: number): number {
  const safeTiles = GRID_SIZE - mineCount
  let p = 1
  for (let i = 0; i < safeReveals; i++) {
    p *= (safeTiles - i) / (GRID_SIZE - i)
  }
  return p
}

describe('minesConfig', () => {
  it('multiplierAfter(0, mineCount) is exactly the target RTP for every mine count', () => {
    for (const mineCount of MINE_COUNT_OPTIONS) {
      expect(multiplierAfter(0, mineCount)).toBeCloseTo(MINES_RTP, 10)
    }
  })

  it('cashing out at ANY reveal depth has the exact same expected value — the defining honesty property', () => {
    for (const mineCount of MINE_COUNT_OPTIONS) {
      const safeTiles = GRID_SIZE - mineCount
      for (let k = 0; k <= safeTiles; k++) {
        const ev = survivalProbability(k, mineCount) * multiplierAfter(k, mineCount)
        expect(ev).toBeCloseTo(MINES_RTP, 10)
      }
    }
  })

  it('multiplier strictly increases with every additional safe reveal', () => {
    for (const mineCount of MINE_COUNT_OPTIONS) {
      const safeTiles = GRID_SIZE - mineCount
      for (let k = 1; k <= safeTiles; k++) {
        expect(multiplierAfter(k, mineCount)).toBeGreaterThan(multiplierAfter(k - 1, mineCount))
      }
    }
  })

  it('more mines means a steeper multiplier curve for the same reveal depth', () => {
    const [low, , high] = MINE_COUNT_OPTIONS // 3 vs 10 mines
    expect(multiplierAfter(1, high)).toBeGreaterThan(multiplierAfter(1, low))
  })
})

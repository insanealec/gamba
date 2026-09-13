import { describe, expect, it } from 'vitest'
import { HORSES, HORSES_RTP, fractionalOddsFor, multiplierFor, nameFor, winProbability } from './horsesConfig'

describe('horsesConfig', () => {
  it('win probabilities across all horses sum to 1 (a valid probability distribution)', () => {
    const total = HORSES.reduce((sum, h) => sum + winProbability(h.id), 0)
    expect(total).toBeCloseTo(1, 10)
  })

  it('every horse has the exact same expected value (the "fair odds" property)', () => {
    for (const horse of HORSES) {
      const ev = winProbability(horse.id) * multiplierFor(horse.id)
      expect(ev).toBeCloseTo(HORSES_RTP, 10)
    }
  })

  it('favorites (higher weight) pay less than longshots (lower weight)', () => {
    const byWeight = [...HORSES].sort((a, b) => b.weight - a.weight)
    for (let i = 0; i < byWeight.length - 1; i++) {
      expect(multiplierFor(byWeight[i].id)).toBeLessThanOrEqual(multiplierFor(byWeight[i + 1].id))
    }
  })

  it('unknown horse id has zero win probability and zero multiplier, not a crash', () => {
    expect(winProbability('not-a-horse')).toBe(0)
    expect(multiplierFor('not-a-horse')).toBe(0)
  })

  it('fractionalOddsFor returns a valid "num/den" string for every horse', () => {
    for (const horse of HORSES) {
      expect(fractionalOddsFor(horse.id)).toMatch(/^\d+\/\d+$/)
    }
  })

  it('nameFor resolves real horses and falls back to the id for unknown ones', () => {
    expect(nameFor(HORSES[0].id)).toBe(HORSES[0].name)
    expect(nameFor('mystery-horse')).toBe('mystery-horse')
  })
})

import { describe, expect, it } from 'vitest'
import { CASINO_WAR_HOUSE_EDGE, CASINO_WAR_RTP } from './casinoWarConfig'

describe('casinoWarConfig', () => {
  it('RTP + house edge sum to 1', () => {
    expect(CASINO_WAR_RTP + CASINO_WAR_HOUSE_EDGE).toBeCloseTo(1, 10)
  })

  it('RTP matches the well-documented "always go to war" published figure', () => {
    expect(CASINO_WAR_RTP).toBeGreaterThan(0.95)
    expect(CASINO_WAR_RTP).toBeLessThan(1)
  })
})

import type { PocketColor, RouletteBet, WheelType } from '../types/roulette'

// Real wheel pocket sequences — not that the sequence itself matters for
// fairness (any uniform draw over the pockets is equally honest), but it's
// the authentic layout rather than an arbitrary one.
export const EUROPEAN_WHEEL_ORDER = [
  '0', '32', '15', '19', '4', '21', '2', '25', '17', '34', '6', '27', '13', '36', '11', '30', '8',
  '23', '10', '5', '24', '16', '33', '1', '20', '14', '31', '9', '22', '18', '29', '7', '28', '12',
  '35', '3', '26',
]

export const AMERICAN_WHEEL_ORDER = [
  '0', '28', '9', '26', '30', '11', '7', '20', '32', '17', '5', '22', '34', '15', '3', '24', '36',
  '13', '1', '00', '27', '10', '25', '29', '12', '8', '19', '31', '18', '6', '21', '33', '16', '4',
  '23', '35', '14', '2',
]

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36])

export function wheelOrderFor(wheelType: WheelType): string[] {
  return wheelType === 'european' ? EUROPEAN_WHEEL_ORDER : AMERICAN_WHEEL_ORDER
}

export function colorFor(pocket: string): PocketColor {
  if (pocket === '0' || pocket === '00') return 'green'
  return RED_NUMBERS.has(Number(pocket)) ? 'red' : 'black'
}

/**
 * Every real roulette bet type — straight number, red/black, dozens — pays
 * exactly 36 ÷ pocketCount in expected value, because the payout odds (35:1,
 * 2:1, 1:1) were designed around a wheel with no zero at all; the zero
 * pocket(s) are what create the house edge, uniformly, for every bet type.
 * This is the real math, not something tuned for this app.
 */
export function rtpFor(wheelType: WheelType): number {
  return 36 / wheelOrderFor(wheelType).length
}

export const ROULETTE_RTP = rtpFor('european')
export const ROULETTE_HOUSE_EDGE_EUROPEAN = 1 - rtpFor('european')
export const ROULETTE_HOUSE_EDGE_AMERICAN = 1 - rtpFor('american')

export const NUMBER_ROWS: number[][] = [
  [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
  [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
]

export function straightBet(pocket: string): RouletteBet {
  return {
    id: `straight-${pocket}`,
    label: pocket === '00' ? '00' : pocket,
    multiplier: 36,
    matches: (p) => p === pocket,
  }
}

export function outsideBets(): RouletteBet[] {
  return [
    { id: 'red', label: 'Red', multiplier: 2, matches: (p) => colorFor(p) === 'red' },
    { id: 'black', label: 'Black', multiplier: 2, matches: (p) => colorFor(p) === 'black' },
    { id: 'odd', label: 'Odd', multiplier: 2, matches: (p) => p !== '0' && p !== '00' && Number(p) % 2 === 1 },
    { id: 'even', label: 'Even', multiplier: 2, matches: (p) => p !== '0' && p !== '00' && Number(p) % 2 === 0 },
    { id: 'low', label: '1–18', multiplier: 2, matches: (p) => Number(p) >= 1 && Number(p) <= 18 },
    { id: 'high', label: '19–36', multiplier: 2, matches: (p) => Number(p) >= 19 && Number(p) <= 36 },
    { id: 'dozen1', label: '1st 12', multiplier: 3, matches: (p) => Number(p) >= 1 && Number(p) <= 12 },
    { id: 'dozen2', label: '2nd 12', multiplier: 3, matches: (p) => Number(p) >= 13 && Number(p) <= 24 },
    { id: 'dozen3', label: '3rd 12', multiplier: 3, matches: (p) => Number(p) >= 25 && Number(p) <= 36 },
  ]
}

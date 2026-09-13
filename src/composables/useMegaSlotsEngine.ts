import { MEGASLOTS_RTP, MEGA_SYMBOLS, PAYLINES, REEL_COUNT, ROW_COUNT, multiplierFor } from '../data/megaSlotsConfig'
import type { GameEngine } from '../types/game'
import type { MegaSlotsResult, MegaSlotsWinningLine, Payline } from '../types/megaSlots'
import { pickWeighted } from './useRng'

function drawGrid(): string[][] {
  const grid: string[][] = []
  for (let reel = 0; reel < REEL_COUNT; reel++) {
    const column: string[] = []
    for (let row = 0; row < ROW_COUNT; row++) {
      column.push(pickWeighted(MEGA_SYMBOLS).id)
    }
    grid.push(column)
  }
  return grid
}

function evaluateLine(grid: string[][], line: Payline, betPerLine: number, lineIndex: number): MegaSlotsWinningLine | null {
  const firstSymbol = grid[0][line[0]]
  let count = 1
  for (let reel = 1; reel < REEL_COUNT; reel++) {
    if (grid[reel][line[reel]] === firstSymbol) count++
    else break
  }

  const multiplier = multiplierFor(firstSymbol, count)
  if (multiplier <= 0) return null

  return { lineIndex, symbolId: firstSymbol, count, multiplier, payout: betPerLine * multiplier }
}

export function useMegaSlotsEngine(): GameEngine<MegaSlotsResult> {
  return {
    id: 'megaslots',
    targetRtp: MEGASLOTS_RTP,
    resolveRound(bet: number): MegaSlotsResult {
      const grid = drawGrid()
      const betPerLine = bet / PAYLINES.length
      const winningLines: MegaSlotsWinningLine[] = []

      PAYLINES.forEach((line, lineIndex) => {
        const win = evaluateLine(grid, line, betPerLine, lineIndex)
        if (win) winningLines.push(win)
      })

      const totalPayout = winningLines.reduce((sum, w) => sum + w.payout, 0)
      return { grid, winningLines, totalPayout }
    },
    payoutFor(result) {
      return result.totalPayout
    },
  }
}

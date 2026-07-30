import { BOARD_MULTIPLIER_GRID } from '../constants'
import type { BoardState } from '../types'

/**
 * Creates a fresh 15x15 board populated with row/col coordinates.
 */
export const createInitialBoard = (): BoardState => {
  return BOARD_MULTIPLIER_GRID.map((row, rowIndex) =>
    row.map((scoreMultiplier, colIndex) => ({
      row: 0,
      col: 0,
      tile: null,
      coords: { row: rowIndex, col: colIndex },
      scoreMultiplier,
      isFocused: false
    }))
  )
}

export const INITIAL_BOARD = createInitialBoard()

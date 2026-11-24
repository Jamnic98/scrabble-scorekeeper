import { describe, it, expect } from 'vitest'

import { createInitialBoard, INITIAL_BOARD } from './board'
import { BOARD_SIZE, BOARD_MULTIPLIER_GRID } from '../constants'

describe('createInitialBoard', () => {
  it('should create a BOARD_SIZE x BOARD_SIZE grid', () => {
    const board = createInitialBoard()
    expect(board).toHaveLength(BOARD_SIZE)
    board.forEach((row) => expect(row).toHaveLength(BOARD_SIZE))
  })

  it('should leave every square empty and unfocused', () => {
    const board = createInitialBoard()
    board.forEach((row) =>
      row.forEach((sq) => {
        expect(sq.tile).toBeNull()
        expect(sq.isFocused).toBe(false)
      })
    )
  })

  it('should copy the multiplier grid, with star at the center and tw at the corners', () => {
    const board = createInitialBoard()
    expect(board[7][7].scoreMultiplier).toBe('star')
    expect(board[0][0].scoreMultiplier).toBe('tw')
    expect(board[0][14].scoreMultiplier).toBe('tw')
    expect(board[14][0].scoreMultiplier).toBe('tw')
    expect(board[14][14].scoreMultiplier).toBe('tw')
    board.forEach((row, r) =>
      row.forEach((sq, c) => expect(sq.scoreMultiplier).toBe(BOARD_MULTIPLIER_GRID[r][c]))
    )
  })

  it('INITIAL_BOARD should match a freshly created board', () => {
    expect(INITIAL_BOARD).toEqual(createInitialBoard())
  })
})

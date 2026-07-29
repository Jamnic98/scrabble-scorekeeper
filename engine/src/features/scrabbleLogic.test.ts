import { describe, it, expect, beforeEach } from 'vitest'

import { validatePlacement, getFormedWords, calculateEndGamePenalties } from './scrabbleLogic'
import { BOARD_MULTIPLIER_GRID } from '../constants'
import type { BoardState, TilePlacement } from '../types'

function createEmptyBoard(): BoardState {
  return BOARD_MULTIPLIER_GRID.map((row, r) =>
    row.map((scoreMultiplier, c) => ({
      row: r,
      col: c,
      scoreMultiplier,
      tile: null,
      isFocused: false
    }))
  )
}

describe('Scrabble Placement & Validation Logic', () => {
  let board: BoardState

  beforeEach(() => {
    board = createEmptyBoard()
  })

  // -------------------------------------------------------------
  // 1. First Turn Validation (Center Star Rule)
  // -------------------------------------------------------------
  describe('First Turn Rules', () => {
    it('should pass if first move covers center star (7,7)', () => {
      const placements: TilePlacement[] = [
        { id: '1', row: 7, col: 6, letter: 'H', points: 4, isBlank: false },
        { id: '2', row: 7, col: 7, letter: 'I', points: 1, isBlank: false }
      ]
      const result = validatePlacement(board, placements, true /* isFirstTurn */)
      expect(result.isValid).toBe(true)
    })

    it('should FAIL first move if center star (7,7) is NOT covered', () => {
      const placements: TilePlacement[] = [
        { id: '1', row: 0, col: 0, letter: 'C', points: 3, isBlank: false },
        { id: '2', row: 0, col: 1, letter: 'A', points: 1, isBlank: false },
        { id: '3', row: 0, col: 2, letter: 'T', points: 1, isBlank: false }
      ]
      const result = validatePlacement(board, placements, true)
      expect(result.isValid).toBe(false)
      expect(result.reason).toMatch(/center/i)
    })
  })

  // -------------------------------------------------------------
  // 2. Geometry & Continuity Checks
  // -------------------------------------------------------------
  describe('Tile Alignment and Continuity', () => {
    it('should FAIL if tiles are placed diagonally', () => {
      const placements: TilePlacement[] = [
        { id: '1', row: 2, col: 2, letter: 'A', points: 1, isBlank: false },
        { id: '2', row: 3, col: 3, letter: 'T', points: 1, isBlank: false }
      ]
      const result = validatePlacement(board, placements, false)
      expect(result.isValid).toBe(false)
      expect(result.reason).toMatch(/straight line/i)
    })

    it('should FAIL if there are empty un-bridged gaps between placed tiles', () => {
      // Place 'C' at (5,2) and 'T' at (5,5) with empty board squares in between
      const placements: TilePlacement[] = [
        { id: '1', row: 5, col: 2, letter: 'C', points: 3, isBlank: false },
        { id: '2', row: 5, col: 5, letter: 'T', points: 1, isBlank: false }
      ]
      const result = validatePlacement(board, placements, false)
      expect(result.isValid).toBe(false)
      expect(result.reason).toMatch(/continuous/i)
    })

    it('should PASS if gaps are bridged by PRE-EXISTING tiles on board', () => {
      // Board pre-filled with 'A' at (5,3) and 'T' at (5,4)
      board[5][3].tile = { id: 'a', letter: 'A', points: 1, isBlank: false }
      board[5][4].tile = { id: 't', letter: 'T', points: 1, isBlank: false }

      // Place 'C' at (5,2) and 'S' at (5,5)
      const placements: TilePlacement[] = [
        { id: '1', row: 5, col: 2, letter: 'C', points: 3, isBlank: false },
        { id: '2', row: 5, col: 5, letter: 'S', points: 1, isBlank: false }
      ]
      const result = validatePlacement(board, placements, false)
      expect(result.isValid).toBe(true)
    })

    it('should FAIL if placing a tile on top of an already occupied square', () => {
      board[7][7].tile = { id: 'old', letter: 'X', points: 8, isBlank: false }
      const placements: TilePlacement[] = [
        { id: '1', row: 7, col: 7, letter: 'Y', points: 4, isBlank: false }
      ]
      const result = validatePlacement(board, placements, false)
      expect(result.isValid).toBe(false)
      expect(result.reason).toMatch(/occupied/i)
    })
  })

  // -------------------------------------------------------------
  // 3. Connectivity Rules (Subsequent Turns)
  // -------------------------------------------------------------
  describe('Board Connectivity Rules', () => {
    it('should FAIL if placed tiles do not touch any existing board tiles (floating word)', () => {
      // Existing word at (7,7)
      board[7][7].tile = { id: '1', letter: 'A', points: 1, isBlank: false }

      // Disconnected move placed way up at row 0
      const placements: TilePlacement[] = [
        { id: '1', row: 0, col: 0, letter: 'N', points: 1, isBlank: false },
        { id: '2', row: 0, col: 1, letter: 'O', points: 1, isBlank: false }
      ]
      const result = validatePlacement(board, placements, false)
      expect(result.isValid).toBe(false)
      expect(result.reason).toMatch(/connect/i)
    })

    it('should PASS if at least one placed tile is adjacent to an existing board tile', () => {
      board[7][7].tile = { id: '1', letter: 'A', points: 1, isBlank: false }

      // Place 'T' right below at (8,7)
      const placements: TilePlacement[] = [
        { id: '1', row: 8, col: 7, letter: 'T', points: 1, isBlank: false }
      ]
      const result = validatePlacement(board, placements, false)
      expect(result.isValid).toBe(true)
    })
  })

  // -------------------------------------------------------------
  // 4. Board Boundary & Edge Cases
  // -------------------------------------------------------------
  describe('Board Edges & Boundaries', () => {
    it('should handle plays along the top edge (row 0) without out-of-bounds index errors', () => {
      board[0][0].tile = { id: '1', letter: 'A', points: 1, isBlank: false }

      const placements: TilePlacement[] = [
        { id: '1', row: 0, col: 1, letter: 'T', points: 1, isBlank: false }
      ]

      expect(() => validatePlacement(board, placements, false)).not.toThrow()
      const words = getFormedWords(board, placements)
      expect(words).toContain('AT')
    })

    it('should handle plays along the bottom-right corner (14,14) safely', () => {
      board[14][13].tile = { id: '1', letter: 'G', points: 2, isBlank: false }

      const placements: TilePlacement[] = [
        { id: '1', row: 14, col: 14, letter: 'O', points: 1, isBlank: false }
      ]

      expect(() => validatePlacement(board, placements, false)).not.toThrow()
      const words = getFormedWords(board, placements)
      expect(words).toContain('GO')
    })

    it('should correctly reject placements with out-of-bound indices', () => {
      const placements: TilePlacement[] = [
        { id: '1', row: -1, col: 5, letter: 'A', points: 1, isBlank: false }
      ]
      const result = validatePlacement(board, placements, false)
      expect(result.isValid).toBe(false)
    })
  })

  // -------------------------------------------------------------
  // 5. Game Over & Rack Penalty Logic
  // -------------------------------------------------------------
  describe('End-Game Scoring & Rack Penalties', () => {
    it('should subtract points for leftover rack tiles when game ends', () => {
      const playerRack = [
        { id: '1', letter: 'Q', points: 10, isBlank: false },
        { id: '2', row: 0, letter: 'A', points: 1, isBlank: false },
        { id: '3', letter: ' ', points: 0, isBlank: true } // Blank tile = 0 penalty
      ]

      const penalty = calculateEndGamePenalties(playerRack)
      // Q(10) + A(1) + Blank(0) = 11 pts deduction
      expect(penalty).toBe(11)
    })
  })
})

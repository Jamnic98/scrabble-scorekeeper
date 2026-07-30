import { describe, it, expect, beforeEach } from 'vitest'

import { calculateTurnScore, getLetterPoints, LETTER_DISTRIBUTION } from './scoring'
import { BOARD_MULTIPLIER_GRID } from '../constants' // Adjust path if needed
import type { BoardState, TilePlacement } from '../types'

/**
 * Creates a clean test board using your existing BOARD_MULTIPLIER_GRID matrix
 */
function createTestBoard(): BoardState {
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

describe('Scrabble Scoring System', () => {
  let board: BoardState

  beforeEach(() => {
    board = createTestBoard()
  })

  // -------------------------------------------------------------
  // 1. LETTER_DISTRIBUTION & Base Points Tests
  // -------------------------------------------------------------
  describe('getLetterPoints()', () => {
    it('should correctly lookup point values from LETTER_DISTRIBUTION regardless of case', () => {
      expect(getLetterPoints('a')).toBe(LETTER_DISTRIBUTION.a.value) // 1
      expect(getLetterPoints('Z')).toBe(LETTER_DISTRIBUTION.z.value) // 10
      expect(getLetterPoints('q')).toBe(LETTER_DISTRIBUTION.q.value) // 10
      expect(getLetterPoints('k')).toBe(LETTER_DISTRIBUTION.k.value) // 5
    })

    it('should assign 0 points to blank tiles regardless of designated letter', () => {
      expect(getLetterPoints('e', true)).toBe(0)
      expect(getLetterPoints('z', true)).toBe(0)
      expect(getLetterPoints(' ')).toBe(0)
    })

    it('should return 0 for unknown/invalid characters', () => {
      expect(getLetterPoints('!')).toBe(0)
    })
  })

  // -------------------------------------------------------------
  // 2. Base Word Scoring & Multipliers
  // -------------------------------------------------------------
  describe('Base Word Scoring and Premium Multipliers', () => {
    it('should score a simple word on normal squares without multipliers', () => {
      // Place "CAT" horizontally at row 0, cols 4, 5, 6 (neutral squares per BOARD_MULTIPLIER_GRID)
      const placements: TilePlacement[] = [
        { row: 0, col: 4, tile: { id: '1', letter: 'C', points: 3, isBlank: false } },
        { row: 0, col: 5, tile: { id: '2', letter: 'A', points: 1, isBlank: false } },
        { row: 0, col: 6, tile: { id: '3', letter: 'T', points: 1, isBlank: false } }
      ]

      const result = calculateTurnScore(board, placements)

      expect(result.words).toHaveLength(1)
      expect(result.words[0].word).toBe('CAT')
      expect(result.words[0].score).toBe(5)
      expect(result.totalScore).toBe(5)
      expect(result.isBingo).toBe(false)
    })

    it('should apply Double Letter (DL) and Triple Letter (TL) multipliers correctly', () => {
      // (0, 3) is 'dl' in BOARD_MULTIPLIER_GRID
      const placements: TilePlacement[] = [
        { row: 0, col: 3, tile: { id: '1', letter: 'D', points: 2, isBlank: false } }, // 2 * 2 = 4 pts (DL)
        { row: 0, col: 4, tile: { id: '2', letter: 'O', points: 1, isBlank: false } }, // 1 pt
        { row: 0, col: 5, tile: { id: '3', letter: 'G', points: 2, isBlank: false } } // 2 pts
      ]

      const result = calculateTurnScore(board, placements)

      // Expected: (2 * 2) + 1 + 2 = 7 pts
      expect(result.totalScore).toBe(7)
    })

    it('should double the word score when placed on the center STAR square', () => {
      // (7,7) is 'star' in BOARD_MULTIPLIER_GRID
      const placements: TilePlacement[] = [
        { row: 7, col: 6, tile: { id: '1', letter: 'H', points: 4, isBlank: false } }, // 4 pts
        { row: 7, col: 7, tile: { id: '2', letter: 'I', points: 1, isBlank: false } } // 1 pt [STAR = 2x Word]
      ]

      const result = calculateTurnScore(board, placements)

      // Expected: (4 + 1) * 2 = 10 pts
      expect(result.totalScore).toBe(10)
    })

    it('should multiply when hitting a Triple Word (TW) square', () => {
      // (0,0) is 'tw' in BOARD_MULTIPLIER_GRID
      const placements: TilePlacement[] = [
        { row: 0, col: 0, tile: { id: '1', letter: 'Z', points: 10, isBlank: false } }, // 10 pts [TW]
        { row: 0, col: 1, tile: { id: '2', letter: 'O', points: 1, isBlank: false } }, // 1 pt
        { row: 0, col: 2, tile: { id: '3', letter: 'O', points: 1, isBlank: false } } // 1 pt
      ]

      const result = calculateTurnScore(board, placements)

      // (10 + 1 + 1) * 3 = 36 pts
      expect(result.totalScore).toBe(36)
    })
  })

  // -------------------------------------------------------------
  // 3. Pre-existing Tiles & Multiplier Expiration
  // -------------------------------------------------------------
  describe('Pre-existing Board Tiles', () => {
    it('should NOT apply square multipliers to pre-existing board tiles', () => {
      // Pre-place 'Z' on the TW square at (0,0) from a prior turn
      board[0][0].tile = { id: 'old-z', letter: 'Z', points: 10, isBlank: false }

      // New turn: attach 'OO' at (0,1) and (0,2)
      const placements: TilePlacement[] = [
        { row: 0, col: 1, tile: { id: '1', letter: 'O', points: 1, isBlank: false } },
        { row: 0, col: 2, tile: { id: '2', letter: 'O', points: 1, isBlank: false } }
      ]

      const result = calculateTurnScore(board, placements)

      // TW at (0,0) is expired.
      // Expected score: 10 + 1 + 1 = 12 pts (NOT 36)
      expect(result.totalScore).toBe(12)
    })

    it('should correctly build words extending existing tiles on both sides', () => {
      // Existing word "AT" at (7,7) and (7,8)
      board[7][7].tile = { id: 'a', letter: 'A', points: 1, isBlank: false }
      board[7][8].tile = { id: 't', letter: 'T', points: 1, isBlank: false }

      // Place 'C' at (7,6) and 'S' at (7,9) => "CATS"
      const placements: TilePlacement[] = [
        { row: 7, col: 6, tile: { id: '1', letter: 'C', points: 3, isBlank: false } },
        { row: 7, col: 9, tile: { id: '2', letter: 'S', points: 1, isBlank: false } }
      ]

      const result = calculateTurnScore(board, placements)

      expect(result.words[0].word).toBe('CATS')
      expect(result.totalScore).toBe(6)
    })
  })

  // -------------------------------------------------------------
  // 4. Cross Words & Bingo Tests
  // -------------------------------------------------------------
  describe('Cross Words & Bingo Rules', () => {
    it('should calculate both main word and cross words created in a single move', () => {
      // Pre-existing tile 'N' at (2,4)
      board[2][4].tile = { id: 'n', letter: 'N', points: 1, isBlank: false }

      // Play "N O" horizontally at row 1, cols 3 and 4
      // Placing 'O' at (1,4) vertically aligns with 'N' at (2,4) to form "ON"
      const placements: TilePlacement[] = [
        { row: 1, col: 3, tile: { id: '1', letter: 'N', points: 1, isBlank: false } },
        { row: 1, col: 4, tile: { id: '2', letter: 'O', points: 1, isBlank: false } }
      ]

      const result = calculateTurnScore(board, placements)

      expect(result.words).toHaveLength(2)
      expect(result.words.map((w) => w.word)).toContain('NO')
      expect(result.words.map((w) => w.word)).toContain('ON')
      expect(result.totalScore).toBe(4)
    })

    it('should score blank tiles as 0 points even when hitting DL squares', () => {
      // Blank 'Z' placed on DL square at (0,3)
      const placements: TilePlacement[] = [
        { row: 0, col: 3, tile: { id: '1', letter: 'Z', points: 0, isBlank: true } }, // 0 pts
        { row: 0, col: 4, tile: { id: '2', letter: 'O', points: 1, isBlank: false } }, // 1 pt
        { row: 0, col: 5, tile: { id: '3', letter: 'O', points: 1, isBlank: false } } // 1 pt
      ]

      const result = calculateTurnScore(board, placements)

      expect(result.totalScore).toBe(2)
    })

    it('should add 50-point Bingo bonus when all 7 tiles are played', () => {
      // 7 tiles across row 7 starting at col 4
      const placements: TilePlacement[] = [
        { row: 7, col: 4, tile: { id: '1', letter: 'S', points: 1, isBlank: false } },
        { row: 7, col: 5, tile: { id: '2', letter: 'C', points: 3, isBlank: false } },
        { row: 7, col: 6, tile: { id: '3', letter: 'R', points: 1, isBlank: false } },
        { row: 7, col: 7, tile: { id: '4', letter: 'A', points: 1, isBlank: false } }, // STAR (2x Word)
        { row: 7, col: 8, tile: { id: '5', letter: 'M', points: 3, isBlank: false } },
        { row: 7, col: 9, tile: { id: '6', letter: 'B', points: 3, isBlank: false } },
        { row: 7, col: 10, tile: { id: '7', letter: 'L', points: 1, isBlank: false } }
      ]

      const result = calculateTurnScore(board, placements)

      expect(result.isBingo).toBe(true)
      // Word score: (1 + 3 + 1 + 1 + 3 + 3 + 1) * 2 = 26 pts
      // Total with Bingo: 26 + 50 = 76 pts
      expect(result.totalScore).toBe(76)
    })
  })

  // -------------------------------------------------------------
  // 5. Complex Scrabble Edge Cases
  // -------------------------------------------------------------
  describe('Complex Scrabble Edge Cases', () => {
    it('should stack multiple word multipliers exponentially (e.g. Double-Double = 4x)', () => {
      // Row 1 cols 1 and 13 are 'dw' in BOARD_MULTIPLIER_GRID
      // Place a word spanning across (1,1) [DW] and (1,13) [DW] using gaps on board
      // Let's test a shorter span hitting two DWs: (1,1) [DW] and (1,13) [DW] or row 1 (1,1) and (13,1) vertically
      // Row 1 cols 1 [DW] and col 13 [DW]
      // To test simpler: row 1, placing 'C' at (1,1) [DW], 'A' at (1,2), 'T' at (1,3)
      // Actually, row 1 cols 1 & 13 are DW. Let's test Row 2: (2,2) is DW and (2,12) is DW.
      // Let's place tiles on (2,2) [DW] and pre-fill existing tiles to reach another DW at (2,12)?
      // Simple isolated test: Place 1 tile on DW at (1,1) and another on (1,13) with pre-filled middle.
      for (let c = 2; c <= 12; c++) {
        board[1][c].tile = { id: `m-${c}`, letter: 'A', points: 1, isBlank: false }
      }

      // Play 'B' at (1,1) [DW] and 'S' at (1,13) [DW]
      const placements: TilePlacement[] = [
        { row: 1, col: 1, tile: { id: 'b', letter: 'B', points: 3, isBlank: false } },
        { row: 1, col: 13, tile: { id: 's', letter: 'S', points: 1, isBlank: false } }
      ]

      const result = calculateTurnScore(board, placements)

      // Base sum: B(3) + 11*A(1) + S(1) = 15 pts.
      // Multipliers: DW * DW = 2 * 2 = 4x.
      // Total: 15 * 4 = 60 pts.
      expect(result.totalScore).toBe(60)
    })

    it('should apply premium multipliers to BOTH main word and cross-word when placed on a premium square', () => {
      // Pre-existing vertical word "AT" at (6,3) and (8,3) leaving (7,3) empty [DL square]
      board[6][3].tile = { id: 'a', letter: 'A', points: 1, isBlank: false }
      board[8][3].tile = { id: 't', letter: 'T', points: 1, isBlank: false }

      // Play "C A T" horizontally at row 7, cols 3, 4, 5
      // (7,3) is a 'dl' square! Placed tile 'C' forms horizontal "CAT" AND vertical "CAT"
      const placements: TilePlacement[] = [
        { row: 7, col: 3, tile: { id: 'c', letter: 'C', points: 3, isBlank: false } }, // DL square!
        { row: 7, col: 4, tile: { id: 'a2', letter: 'A', points: 1, isBlank: false } },
        { row: 7, col: 5, tile: { id: 't2', letter: 'T', points: 1, isBlank: false } }
      ]

      const result = calculateTurnScore(board, placements)

      // Main Word "CAT" (horiz): C on DL (3*2=6) + A(1) + T(1) = 8 pts
      // Cross Word "CAT" (vert):  C on DL (3*2=6) + A(1) + T(1) = 8 pts
      // Total = 16 pts
      expect(result.words).toHaveLength(2)
      expect(result.totalScore).toBe(16)
    })

    it('should calculate scores correctly for single-tile plays extending existing words', () => {
      // Pre-existing word "FAR" at (0,1), (0,2), (0,3) [ (0,3) is DL ]
      board[0][1].tile = { id: 'f', letter: 'F', points: 4, isBlank: false }
      board[0][2].tile = { id: 'a', letter: 'A', points: 1, isBlank: false }
      board[0][3].tile = { id: 'r', letter: 'R', points: 1, isBlank: false }

      // Add single tile 'S' at (0,4) to make "FARS"
      const placements: TilePlacement[] = [
        { row: 0, col: 4, tile: { id: 's', letter: 'S', points: 1, isBlank: false } }
      ]

      const result = calculateTurnScore(board, placements)

      expect(result.words[0].word).toBe('FARS')
      // Note: R at (0,3) DL multiplier is expired because it's pre-existing.
      // Base: F(4) + A(1) + R(1) + S(1) = 7 pts
      expect(result.totalScore).toBe(7)
    })

    it('should correctly handle vertical main word placements with multipliers', () => {
      // Vertical play at col 5, rows 1, 2, 3
      // (1,5) is 'tl' in BOARD_MULTIPLIER_GRID
      const placements: TilePlacement[] = [
        { row: 1, col: 5, tile: { id: '1', letter: 'Z', points: 10, isBlank: false } }, // TL square!
        { row: 2, col: 5, tile: { id: '2', letter: 'I', points: 1, isBlank: false } },
        { row: 3, col: 5, tile: { id: '3', letter: 'P', points: 3, isBlank: false } }
      ]

      const result = calculateTurnScore(board, placements)

      expect(result.words[0].word).toBe('ZIP')
      // Z on TL (10 * 3 = 30) + I(1) + P(3) = 34 pts
      expect(result.totalScore).toBe(34)
    })
  })
})

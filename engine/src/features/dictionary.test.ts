import { describe, it, expect, beforeEach } from 'vitest'

import { WordDictionary } from './dictionary'
import { validateWordsInDictionary } from './scrabbleLogic'
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

describe('Dictionary Validation & Lookup System', () => {
  let testDict: WordDictionary
  let board: BoardState

  beforeEach(() => {
    board = createEmptyBoard()
    testDict = new WordDictionary()

    // Mock a lightweight Scrabble dictionary for tests
    testDict.loadWords(['CAT', 'CATS', 'AT', 'ON', 'NO', 'QUIZ', 'ZOO', 'DOG', 'HI'])
  })

  // -------------------------------------------------------------
  // 1. Direct Word Dictionary Unit Tests
  // -------------------------------------------------------------
  describe('WordDictionary Class', () => {
    it('should correctly identify valid words regardless of case', () => {
      expect(testDict.isValidWord('cat')).toBe(true)
      expect(testDict.isValidWord('CAT')).toBe(true)
      expect(testDict.isValidWord('Quiz')).toBe(true)
    })

    it('should reject invalid / misspelled words', () => {
      expect(testDict.isValidWord('CATT')).toBe(false)
      expect(testDict.isValidWord('XYZ')).toBe(false)
    })

    it('should reject words shorter than 2 letters', () => {
      expect(testDict.isValidWord('A')).toBe(false)
      expect(testDict.isValidWord('')).toBe(false)
    })

    it('should validate multiple words and return invalid ones', () => {
      const result = testDict.validateWords(['CAT', 'DOG', 'INVALIDWORD'])
      expect(result.isValid).toBe(false)
      expect(result.invalidWords).toEqual(['INVALIDWORD'])
    })
  })

  // -------------------------------------------------------------
  // 2. Integration with Turn Placements
  // -------------------------------------------------------------
  describe('validateWordsInDictionary Integration', () => {
    it('should pass when all formed words (main + cross-words) are valid', () => {
      // Pre-existing tile 'N' at (2,4)
      board[2][4].tile = { id: 'n', letter: 'N', points: 1, isBlank: false }

      // Play "N O" at (1,3) and (1,4), creating horizontal "NO" and vertical "ON"
      const placements: TilePlacement[] = [
        { id: '1', row: 1, col: 3, letter: 'N', points: 1, isBlank: false },
        { id: '2', row: 1, col: 4, letter: 'O', points: 1, isBlank: false }
      ]

      const result = validateWordsInDictionary(board, placements, testDict)

      expect(result.isValid).toBe(true)
      expect(result.invalidWords).toHaveLength(0)
      expect(result.formedWords).toContain('NO')
      expect(result.formedWords).toContain('ON')
    })

    it('should fail and report invalid words if main word or cross-words do not exist in dict', () => {
      // Pre-existing tile 'Z' at (2,4)
      board[2][4].tile = { id: 'z', letter: 'Z', points: 10, isBlank: false }

      // Play "N O" at (1,3) and (1,4), forming main word "NO" and cross-word "OZ" (invalid)
      const placements: TilePlacement[] = [
        { id: '1', row: 1, col: 3, letter: 'N', points: 1, isBlank: false },
        { id: '2', row: 1, col: 4, letter: 'O', points: 1, isBlank: false }
      ]

      const result = validateWordsInDictionary(board, placements, testDict)

      expect(result.isValid).toBe(false)
      expect(result.invalidWords).toContain('OZ')
    })
  })
})

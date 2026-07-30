import { WordDictionary } from './dictionary'
import type { BoardState, PlayerScoreState, Square, Tile, TilePlacement } from '../types'
import { BOARD_SIZE, LETTER_DISTRIBUTION } from '../constants'

type ValidationResult = {
  isValid: boolean
  reason?: string
}

export function validatePlacement(
  board: BoardState,
  placements: TilePlacement[],
  isFirstTurn: boolean
): ValidationResult {
  // 0. Empty placement check
  if (!placements || placements.length === 0) {
    return { isValid: false, reason: 'No tiles were placed.' }
  }

  const centerIndex = Math.floor(BOARD_SIZE / 2) // Typically 7 for 15x15 board

  // 1. Boundary and existing tile occupation checks
  for (const p of placements) {
    if (p.row < 0 || p.row >= BOARD_SIZE || p.col < 0 || p.col >= BOARD_SIZE) {
      return { isValid: false, reason: 'Tile placement is out of bounds.' }
    }

    // if (board[p.row][p.col].tile !== null) {
    //   return { isValid: false, reason: 'Cannot place tile on an already occupied square.' }
    // }
  }

  // 2. Single Tile Placement Handling
  if (placements.length === 1) {
    const single = placements[0]
    if (isFirstTurn) {
      if (single.row !== centerIndex || single.col !== centerIndex) {
        return { isValid: false, reason: 'First move must cover the center star square.' }
      }
      return { isValid: true }
    }

    // Must be adjacent to at least one pre-existing tile
    if (!hasAdjacentExistingTile(board, single.row, single.col)) {
      return { isValid: false, reason: 'Word must connect to existing tiles on the board.' }
    }
    return { isValid: true }
  }

  // 3. Straight Line Alignment Check
  const rows = placements.map((p) => p.row)
  const cols = placements.map((p) => p.col)
  const isHorizontal = rows.every((r) => r === rows[0])
  const isVertical = cols.every((c) => c === cols[0])

  if (!isHorizontal && !isVertical) {
    return { isValid: false, reason: 'Tiles must be placed in a single straight line.' }
  }

  // Sort placements sequentially along line
  const sorted = [...placements].sort((a, b) => (isHorizontal ? a.col - b.col : a.row - b.row))

  // 4. Continuity Check (Ensure no empty gaps between placed tiles)
  if (isHorizontal) {
    const row = sorted[0].row
    const minCol = sorted[0].col
    const maxCol = sorted[sorted.length - 1].col

    for (let c = minCol; c <= maxCol; c++) {
      const isNewlyPlaced = sorted.some((p) => p.col === c)
      const isExistingOnBoard = board[row][c].tile !== null

      if (!isNewlyPlaced && !isExistingOnBoard) {
        return { isValid: false, reason: 'Placed word must be continuous with no un-bridged gaps.' }
      }
    }
  } else {
    const col = sorted[0].col
    const minRow = sorted[0].row
    const maxRow = sorted[sorted.length - 1].row

    for (let r = minRow; r <= maxRow; r++) {
      const isNewlyPlaced = sorted.some((p) => p.row === r)
      const isExistingOnBoard = board[r][col].tile !== null

      if (!isNewlyPlaced && !isExistingOnBoard) {
        return { isValid: false, reason: 'Placed word must be continuous with no un-bridged gaps.' }
      }
    }
  }

  // 5. First Turn Center Coverage
  if (isFirstTurn) {
    const coversCenter = placements.some((p) => p.row === centerIndex && p.col === centerIndex)
    if (!coversCenter) {
      return { isValid: false, reason: 'First move must cover the center star square.' }
    }
    return { isValid: true }
  }

  // 6. Subsequent Turn Connection Rule
  let touchesExistingTile = false

  // Check if any placed tile sits directly adjacent to an existing board tile
  for (const p of placements) {
    if (hasAdjacentExistingTile(board, p.row, p.col)) {
      touchesExistingTile = true
      break
    }
  }

  // Or check if it bridges existing tiles along its span
  if (!touchesExistingTile) {
    if (isHorizontal) {
      const row = sorted[0].row
      for (let c = sorted[0].col; c <= sorted[sorted.length - 1].col; c++) {
        if (board[row][c].tile !== null) {
          touchesExistingTile = true
          break
        }
      }
    } else {
      const col = sorted[0].col
      for (let r = sorted[0].row; r <= sorted[sorted.length - 1].row; r++) {
        if (board[r][col].tile !== null) {
          touchesExistingTile = true
          break
        }
      }
    }
  }

  if (!touchesExistingTile) {
    return { isValid: false, reason: 'Placed word must connect to existing tiles on the board.' }
  }

  return { isValid: true }
}

/**
 * Extracts all valid words (main word + cross-words) formed by placing tiles on the board.
 * Returns an array of uppercase word strings (e.g., ["CATS", "ON"]).
 */
export function getFormedWords(board: BoardState, placements: TilePlacement[]): string[] {
  if (placements.length === 0) return []

  // Create a temporary representation of the board after applying placements
  const tempBoard = board.map((row) => row.map((cell) => cell.tile))
  for (const p of placements) {
    tempBoard[p.row][p.col] = p.tile
  }

  const words: string[] = []
  const isHorizontal = placements.length > 1 && placements.every((p) => p.row === placements[0].row)

  // 1. Get Main Word
  const sorted = [...placements].sort((a, b) => (isHorizontal ? a.col - b.col : a.row - b.row))
  const first = sorted[0]

  if (isHorizontal || placements.length === 1) {
    // Check horizontal main word
    const horizWord = extractWordAt(tempBoard, first.row, first.col, true)
    if (horizWord.length > 1) words.push(horizWord)
  }

  if (!isHorizontal || placements.length === 1) {
    // Check vertical main word
    const vertWord = extractWordAt(tempBoard, first.row, first.col, false)
    if (vertWord.length > 1) words.push(vertWord)
  }

  // 2. Get Cross Words formed perpendicular to each placed tile
  for (const p of placements) {
    if (isHorizontal) {
      // Main word is horizontal, extract perpendicular cross-word vertically
      const vertCross = extractWordAt(tempBoard, p.row, p.col, false)
      if (vertCross.length > 1) words.push(vertCross)
    } else if (placements.length > 1) {
      // Main word is vertical, extract perpendicular cross-word horizontally
      const horizCross = extractWordAt(tempBoard, p.row, p.col, true)
      if (horizCross.length > 1) words.push(horizCross)
    }
  }

  return words
}

/**
 * Calculates the point penalty for remaining tiles on a player's rack at game over.
 * Blank tiles contribute 0 points.
 */
export function calculateEndGamePenalties(rack: Tile[]): number {
  return rack.reduce((sum, tile) => {
    if (tile.isBlank) return sum
    return sum + (tile.points ?? 0)
  }, 0)
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function hasAdjacentExistingTile(board: BoardState, r: number, c: number): boolean {
  const neighbors = [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1]
  ]

  return neighbors.some(([nr, nc]) => {
    return nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc].tile !== null
  })
}

function extractWordAt(
  boardGrid: (Tile | null)[][],
  row: number,
  col: number,
  isHorizontal: boolean
): string {
  let startR = row
  let startC = col

  // Travel backward to start of line
  if (isHorizontal) {
    while (startC > 0 && boardGrid[startR][startC - 1] !== null) {
      startC--
    }
  } else {
    while (startR > 0 && boardGrid[startR - 1][startC] !== null) {
      startR--
    }
  }

  // Construct word forward
  let word = ''
  let curR = startR
  let curC = startC

  while (curR < BOARD_SIZE && curC < BOARD_SIZE && boardGrid[curR][curC] !== null) {
    word += boardGrid[curR][curC]!.letter.toUpperCase()
    if (isHorizontal) curC++
    else curR++
  }

  return word
}

/**
 * Calculates tile placement coordinates for a typed string,
 * automatically skipping over existing tiles on the board.
 */
export function calculateTilePlacements(
  board: Square[][],
  startRow: number,
  startCol: number,
  direction: 'right' | 'down',
  typedLetters: { letter: string; points: number; isBlank: boolean }[]
): TilePlacement[] {
  const placements: TilePlacement[] = []

  let currRow = startRow
  let currCol = startCol
  let letterIdx = 0

  while (letterIdx < typedLetters.length) {
    // Bounds check
    if (currRow >= 15 || currCol >= 15) {
      throw new Error('Word runs off the board edge!')
    }

    const currentSquare = board[currRow][currCol]

    // If square already has a tile, SKIP IT
    if (currentSquare.tile !== null) {
      if (direction === 'right') currCol++
      else currRow++
      continue // Move to next square without using up a typed letter
    }

    // Square is free! Place the current typed tile here
    const inputTile = typedLetters[letterIdx]
    placements.push({
      row: currRow,
      col: currCol,
      tile: {
        id: `tile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...inputTile
      }
    })

    // Advance both the letter index and board coordinate
    letterIdx++
    if (direction === 'right') currCol++
    else currRow++
  }

  return placements
}

export interface DictionaryValidationResult {
  isValid: boolean
  invalidWords: string[]
  formedWords: string[]
}

/**
 * Extracts formed words from board placements and validates all of them against the dictionary.
 */
export function validateWordsInDictionary(
  board: BoardState,
  placements: TilePlacement[],
  dict: WordDictionary
): DictionaryValidationResult {
  const formedWords = getFormedWords(board, placements)

  if (formedWords.length === 0) {
    return { isValid: false, invalidWords: [], formedWords: [] }
  }

  const { isValid, invalidWords } = dict.validateWords(formedWords)

  return {
    isValid,
    invalidWords,
    formedWords
  }
}

export interface FinalScoreResult {
  playerScores: Record<string, number> // Maps playerId -> finalScore
  deductions: Record<string, number> // Maps playerId -> points deducted
  outBonus: { playerId: string; bonusPoints: number } | null
}

/**
 * Calculates final scores at the end of the game according to standard Scrabble rules:
 * 1. Deduct remaining rack tile values from each player's score.
 * 2. If a player went "out" (empty rack) while the bag was empty, add the sum of all
 *    opponents' remaining rack tile values as a bonus to that "out" player.
 */
export function calculateFinalGameScores(
  players: PlayerScoreState[],
  outPlayerId: string | null = null
): FinalScoreResult {
  const finalScores: Record<string, number> = {}
  const deductions: Record<string, number> = {}
  let totalOpponentRackPoints = 0

  // Step 1: Calculate deductions for each player with remaining tiles
  for (const player of players) {
    const rack = player.rack ?? []

    const rackPenalty = rack.reduce((sum, tile) => {
      if (tile.isBlank) return sum // Blank tiles count as 0 penalty
      return sum + (tile.points ?? 0)
    }, 0)

    deductions[player.id] = rackPenalty
    finalScores[player.id] = player.score - rackPenalty

    // Collect total remaining points from opponents to award the player who went out
    if (player.id !== outPlayerId) {
      totalOpponentRackPoints += rackPenalty
    }
  }
  // Step 2: Award bonus to the player who went out (if applicable)
  let outBonus = null
  if (outPlayerId && finalScores[outPlayerId] !== undefined) {
    finalScores[outPlayerId] += totalOpponentRackPoints
    outBonus = {
      playerId: outPlayerId,
      bonusPoints: totalOpponentRackPoints
    }
  }

  return {
    playerScores: finalScores,
    deductions,
    outBonus
  }
}

/**
 * Converts a raw tile string input (e.g. "adksz " or "ADKSZ ") into a Tile array.
 * Reads point values directly from LETTER_DISTRIBUTION.
 */
export function parseRackString(input: string): Tile[] {
  if (!input) return []

  const tiles: Tile[] = []
  // Sanitize input to only allowed characters in LETTER_DISTRIBUTION
  const characters = input.toLowerCase().replace(/[^a-z ]/g, '')

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i]
    const spec = LETTER_DISTRIBUTION[char]

    if (!spec) continue

    const isBlank = char === ' '

    tiles.push({
      id: `endgame-tile-${i}-${Math.random().toString(36).substring(2, 7)}`,
      letter: isBlank ? ' ' : char.toUpperCase(),
      points: spec.value,
      isBlank
    })
  }

  return tiles
}

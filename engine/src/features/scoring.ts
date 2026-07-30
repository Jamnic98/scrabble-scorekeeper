import type { BoardState, Square, TilePlacement, FormedWord } from '../types'

export interface LetterSpec {
  count: number
  value: number
}

export const LETTER_DISTRIBUTION: Record<string, LetterSpec> = {
  a: { count: 9, value: 1 },
  b: { count: 2, value: 3 },
  c: { count: 2, value: 3 },
  d: { count: 4, value: 2 },
  e: { count: 12, value: 1 },
  f: { count: 2, value: 4 },
  g: { count: 3, value: 2 },
  h: { count: 2, value: 4 },
  i: { count: 9, value: 1 },
  j: { count: 1, value: 8 },
  k: { count: 1, value: 5 },
  l: { count: 4, value: 1 },
  m: { count: 2, value: 3 },
  n: { count: 6, value: 1 },
  o: { count: 8, value: 1 },
  p: { count: 2, value: 3 },
  q: { count: 1, value: 10 },
  r: { count: 6, value: 1 },
  s: { count: 4, value: 1 },
  t: { count: 6, value: 1 },
  u: { count: 4, value: 1 },
  v: { count: 2, value: 4 },
  w: { count: 2, value: 4 },
  x: { count: 1, value: 8 },
  y: { count: 2, value: 4 },
  z: { count: 1, value: 10 },
  ' ': { count: 2, value: 0 } // Blank tile
} as const

/**
 * Derives score value from LETTER_DISTRIBUTION.
 * Blank tiles always yield 0 points regardless of what letter they represent.
 */
export function getLetterPoints(letter: string, isBlank = false): number {
  if (isBlank || letter === ' ') return 0
  const key = letter.toLowerCase()
  return LETTER_DISTRIBUTION[key]?.value ?? 0
}

export interface ScoreResult {
  totalScore: number
  words: FormedWord[]
  isBingo: boolean
}

/**
 * Calculates total turn score for newly placed tiles on the board,
 * including primary word, cross words, premium multipliers, and bingo bonuses.
 */
export function calculateTurnScore(board: BoardState, placements: TilePlacement[]): ScoreResult {
  if (placements.length === 0) {
    return { totalScore: 0, words: [], isBingo: false }
  }

  // 1. Determine orientation (horizontal vs vertical)
  const isHorizontal =
    placements.length === 1 || placements.every((p) => p.row === placements[0].row)

  // Quick lookup set for coordinates of NEWLY placed tiles
  const newTileCoords = new Set(placements.map((p) => `${p.row},${p.col}`))

  // Merge placements into a temporary board state representation

  const tempBoard: BoardState = board.map((rowArr, r) =>
    rowArr.map((sq, c) => {
      const placement = placements.find((p) => p.row === r && p.col === c)
      if (placement) {
        return {
          ...sq,
          row: r,
          col: c,
          tile: placement.tile
        }
      }
      return {
        ...sq,
        row: r,
        col: c
      }
    })
  )

  const formedWords: FormedWord[] = []

  // 2. Extract Main Word
  const mainWordObj = extractWordAt(
    tempBoard,
    placements[0].row,
    placements[0].col,
    isHorizontal ? 'horizontal' : 'vertical'
  )

  if (mainWordObj && mainWordObj.squares.length > 1) {
    const score = calculateWordPoints(mainWordObj.squares, newTileCoords)
    formedWords.push({
      word: mainWordObj.word,
      score,
      isMainWord: true
    })
  }

  // 3. Extract Cross Words created by each newly placed tile
  placements.forEach((p) => {
    const crossWordObj = extractWordAt(
      tempBoard,
      p.row,
      p.col,
      isHorizontal ? 'vertical' : 'horizontal'
    )

    if (crossWordObj && crossWordObj.squares.length > 1) {
      const score = calculateWordPoints(crossWordObj.squares, newTileCoords)
      formedWords.push({
        word: crossWordObj.word,
        score,
        isMainWord: false
      })
    }
  })

  // 4. Sum up points & apply 50-point Bingo Bonus (if all 7 rack tiles placed)
  let totalScore = formedWords.reduce((sum, w) => sum + w.score, 0)
  const isBingo = placements.length === 7

  if (isBingo) {
    totalScore += 50
  }

  return { totalScore, words: formedWords, isBingo }
}

/**
 * Calculates points for a word sequence, applying multipliers ONLY to new tiles.
 */
function calculateWordPoints(squares: Square[], newTileCoords: Set<string>): number {
  let wordScore = 0
  let wordMultiplier = 1

  squares.forEach((sq) => {
    if (!sq.tile) return

    const key = `${sq.row},${sq.col}`
    const isNewTile = newTileCoords.has(key)

    const basePoints =
      typeof sq.tile.points === 'number'
        ? sq.tile.points
        : getLetterPoints(sq.tile.letter, sq.tile.isBlank)

    if (isNewTile && sq.scoreMultiplier) {
      switch (sq.scoreMultiplier) {
        case 'dl':
          wordScore += basePoints * 2
          break
        case 'tl':
          wordScore += basePoints * 3
          break
        case 'dw':
        case 'star': // Center star operates as double word multiplier on turn 1
          wordScore += basePoints
          wordMultiplier *= 2
          break
        case 'tw':
          wordScore += basePoints
          wordMultiplier *= 3
          break
        default:
          wordScore += basePoints
      }
    } else {
      // Pre-existing tile on board: score base points with zero active multipliers
      wordScore += basePoints
    }
  })

  return wordScore * wordMultiplier
}

/**
 * Traverses board left/right or up/down from a coordinate to extract a complete contiguous word.
 */
function extractWordAt(
  board: BoardState,
  row: number,
  col: number,
  direction: 'horizontal' | 'vertical'
): { word: string; squares: Square[] } | null {
  const isHoriz = direction === 'horizontal'
  let start = isHoriz ? col : row

  // Walk backward to start of contiguous tile sequence
  while (start > 0) {
    const prevSq = isHoriz ? board[row][start - 1] : board[start - 1][col]
    if (!prevSq.tile) break
    start--
  }

  const squares: Square[] = []
  let curr = start

  // Walk forward to assemble full contiguous sequence
  while (curr < 15) {
    const sq = isHoriz ? board[row][curr] : board[curr][col]
    if (!sq.tile) break

    // ✅ FIX: Explicitly assign row and col so sq.row and sq.col are never undefined!
    squares.push({
      ...sq,
      row: isHoriz ? row : curr,
      col: isHoriz ? curr : col
    })
    curr++
  }

  if (squares.length <= 1) return null

  const word = squares.map((s) => s.tile?.letter ?? '').join('')
  return { word, squares }
}

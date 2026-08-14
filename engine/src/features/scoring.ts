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
  ' ': { count: 2, value: 0 }
} as const

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

export function calculateTurnScore(board: BoardState, placements: TilePlacement[]): ScoreResult {
  if (placements.length === 0) {
    return { totalScore: 0, words: [], isBingo: false }
  }

  const isHorizontal =
    placements.length === 1 || placements.every((p) => p.row === placements[0].row)

  const tempBoard: BoardState = board.map((rowArr, r) =>
    rowArr.map((sq, c) => {
      const placement = placements.find((p) => p.row === r && p.col === c)
      if (placement) {
        return { ...sq, row: r, col: c, tile: placement.tile }
      }
      return { ...sq, row: r, col: c }
    })
  )

  const formedWords: FormedWord[] = []

  const mainWordObj = extractWordAt(
    tempBoard,
    placements[0].row,
    placements[0].col,
    isHorizontal ? 'horizontal' : 'vertical'
  )

  if (mainWordObj && mainWordObj.squares.length > 1) {
    const score = calculateWordPoints(mainWordObj.squares, placements)
    formedWords.push({ word: mainWordObj.word, score, isMainWord: true })
  }

  placements.forEach((p) => {
    const crossWordObj = extractWordAt(
      tempBoard,
      p.row,
      p.col,
      isHorizontal ? 'vertical' : 'horizontal'
    )

    if (crossWordObj && crossWordObj.squares.length > 1) {
      const score = calculateWordPoints(crossWordObj.squares, placements)
      formedWords.push({ word: crossWordObj.word, score, isMainWord: false })
    }
  })

  let totalScore = formedWords.reduce((sum, w) => sum + w.score, 0)
  const isBingo = placements.length === 7

  if (isBingo) {
    totalScore += 50
  }

  return { totalScore, words: formedWords, isBingo }
}

/**
 * Calculates points for a word sequence. Premium multipliers only apply to
 * squares that are part of THIS turn's placements — tiles already sitting
 * on the board from a previous turn score their base value only.
 */
function calculateWordPoints(squares: PositionedSquare[], placements: TilePlacement[]): number {
  let wordScore = 0
  let wordMultiplier = 1

  const newTileCoords = new Set(placements.map((p) => `${p.row},${p.col}`))

  squares.forEach(({ square: sq, row, col }) => {
    if (!sq.tile) return

    const basePoints =
      typeof sq.tile.points === 'number'
        ? sq.tile.points
        : getLetterPoints(sq.tile.letter, sq.tile.isBlank)

    const isNewTile = newTileCoords.has(`${row},${col}`)

    if (sq.scoreMultiplier && isNewTile) {
      switch (sq.scoreMultiplier) {
        case 'dl':
          wordScore += basePoints * 2
          break
        case 'tl':
          wordScore += basePoints * 3
          break
        case 'dw':
        case 'star':
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
      wordScore += basePoints
    }
  })

  return wordScore * wordMultiplier
}

interface PositionedSquare {
  square: Square
  row: number
  col: number
}

function extractWordAt(
  board: BoardState,
  row: number,
  col: number,
  direction: 'horizontal' | 'vertical'
): { word: string; squares: PositionedSquare[] } | null {
  const isHoriz = direction === 'horizontal'
  let start = isHoriz ? col : row

  while (start > 0) {
    const prevSq = isHoriz ? board[row][start - 1] : board[start - 1][col]
    if (!prevSq.tile) break
    start--
  }

  const squares: PositionedSquare[] = []
  let curr = start

  while (curr < 15) {
    const r = isHoriz ? row : curr
    const c = isHoriz ? curr : col
    const sq = board[r][c]
    if (!sq.tile) break
    squares.push({ square: sq, row: r, col: c })
    curr++
  }

  if (squares.length <= 1) return null

  const word = squares.map((s) => s.square.tile?.letter ?? '').join('')
  return { word, squares }
}

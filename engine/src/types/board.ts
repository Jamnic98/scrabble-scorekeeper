import type { ScoreMultiplier, Tile } from '.'

export interface Square {
  row: number
  col: number
  scoreMultiplier: ScoreMultiplier
  tile: Tile | null // null = empty square
  isFocused: boolean
}

export type Row = Square[]

export type BoardState = Row[]

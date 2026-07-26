import { STARTING_LETTER_COUNTS } from 'utils/constants'

export type WordDirection = 'right' | 'down' | ''

export type Square = {
  isBlank: boolean
  isFocused: boolean
  letter: string
  scoreMultiplier: ScoreMultiplier
}

export type Row = Square[]

export type BoardState = Row[]

export type Coords = { x: number; y: number }

export type ScoreMultiplier = 'tw' | 'tl' | 'dw' | 'dl' | ''

export type Letter = {
  letter: string
  isBlank: boolean
}

export type Word = Letter[]

export type TileLetter = keyof typeof STARTING_LETTER_COUNTS

export type LetterCounts = Record<TileLetter, number>

import type { LETTER_DISTRIBUTION } from '../constants'

// Base representation of a tile (e.g. in a rack or tile bag)
export interface Tile {
  id: string
  letter: string // "A", "B", or " " for blank tiles in rack
  points: number
  isBlank: boolean
}

export type TileLetter = keyof typeof LETTER_DISTRIBUTION

export type LetterCounts = Record<TileLetter, number>

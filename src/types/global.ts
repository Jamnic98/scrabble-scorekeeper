export type WordDirection = 'right' | 'down' | ''

export type Square = {
  isBlank: boolean
  isFocused: boolean
  letter: string
  scoreMultiplier: ScoreMultiplier
}

export type Row = Square[]

export type Coords = [x: number, y: number]

export type ScoreMultiplier = 'tw' | 'tl' | 'dw' | 'dl' | ''

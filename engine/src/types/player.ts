import type { Tile } from '.'

export type Player = {
  name: string
  rack?: Tile[]
  turnScores: number[]
}

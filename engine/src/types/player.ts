import type { Tile } from '.'

export interface PlayerScoreState {
  id: string // Unique identifier (e.g., 'p-1', socket.id, or crypto.randomUUID())
  score: number
  rack?: Tile[]
}

export interface Player extends PlayerScoreState {
  name: string
  turnScores: number[] // Array of score for each individual turn [12, 0, 34, ...]
  isHost?: boolean // Optional flag for network host
}

import type { BoardState, Player, Tile } from '.'

export type WordDirection = 'horizontal' | 'vertical' | null
export type ScoreMultiplier = 'tw' | 'tl' | 'dw' | 'dl' | 'star' | null

export type FormedWord = {
  word: string
  score: number
  isMainWord: boolean
}

// Extends base Tile with board position and its assigned letter on the board
export interface PlacedTileData extends Tile {
  row: number
  col: number
}

export type MoveHistoryItem = {
  id: string
  playerId: string
  actionType: 'PLAY_WORD' | 'SWAP_TILES' | 'PASS_TURN'

  // Scored results
  words: FormedWord[]
  totalScore: number

  // Replay state data
  placements: PlacedTileData[] // Empty for PASS_TURN or SWAP_TILES

  playedAt: number
}

export type GameState = {
  roomCode: string
  board: BoardState
  players: Player[]
  activePlayerIndex: number
  history: MoveHistoryItem[]
}

export type TilePlacement = {
  row: number
  col: number
  tileId: string
}

export type GameAction =
  | { type: 'PLAY_WORD'; playerId: string; placements: TilePlacement[] }
  | { type: 'SWAP_TILES'; playerId: string; tileIdsToSwap: string[] }
  | { type: 'PASS_TURN'; playerId: string }

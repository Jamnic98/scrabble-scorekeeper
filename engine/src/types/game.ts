import type { BoardState, Player, Tile } from '.'

export type WordDirection = 'horizontal' | 'vertical' | null
export type ScoreMultiplier = 'tw' | 'tl' | 'dw' | 'dl' | 'star' | null

export type FormedWord = {
  word: string
  score: number
  isMainWord: boolean
}

// Extends base Tile with board position and its assigned letter on the board
export interface TilePlacement extends Tile {
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
  placements: TilePlacement[] // Empty for PASS_TURN or SWAP_TILES

  playedAt: number
}

export type GameStatus = 'LOBBY' | 'IN_PROGRESS' | 'COMPLETED'

export type GameState = {
  roomCode: string
  status: GameStatus // Tracks current phase (LOBBY -> IN_PROGRESS -> COMPLETED)
  gameMode: GameMode // 'scorekeeper' | 'full'
  board: BoardState
  players: Player[]
  activePlayerIndex: number
  history: MoveHistoryItem[]
}

export type GameMode = 'scorekeeper' | 'full'

export type RemainingTileInput = {
  playerId: string
  unplayedTiles: Tile[] // Tiles remaining on rack at end of game
}

export type GameAction =
  | { type: 'ADD_PLAYER'; name: string; isHost?: boolean }
  | { type: 'START_GAME'; mode?: GameMode }
  | { type: 'PLAY_WORD'; playerId: string; placements: TilePlacement[] }
  | { type: 'PASS_TURN'; playerId: string }
  | { type: 'UNDO_MOVE'; playerId: string }
  | { type: 'END_GAME'; finalRacks: RemainingTileInput[] }

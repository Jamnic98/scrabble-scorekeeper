import type { BoardState, LetterCounts, Player, Tile, TileStyle } from '.'
import type { ScoreResult } from '../features'

export type WordDirection = 'horizontal' | 'vertical' | null
export type ScoreMultiplier = 'tw' | 'tl' | 'dw' | 'dl' | 'star' | null

export type FormedWord = {
  word: string
  score: number
  isMainWord: boolean
}

// Extends base Tile with board position and its assigned letter on the board
export type TilePlacement = {
  tile: Tile
  row: number
  col: number
}

export type MoveHistoryItem = {
  id: string
  playerId: string
  actionType: 'PLAY_WORD' | 'SWAP_TILES' | 'SKIP_TURN' | 'GAME_START'

  // Scored results
  words: FormedWord[]
  totalScore: number

  // Replay state data
  placements: TilePlacement[] // Empty for SKIP_TURN or SWAP_TILES
  boardState?: BoardState
  playedAt: number
}

export type GameStatus = 'LOBBY' | 'IN_PROGRESS' | 'END_GAME_PROMPT' | 'COMPLETED'

export type GameState = {
  roomCode: string
  status: GameStatus // Tracks current phase (LOBBY -> IN_PROGRESS -> COMPLETED)
  gameMode: GameMode // 'scorekeeper' | 'full'
  board: BoardState
  remainingLetters: LetterCounts
  players: Player[]
  activePlayerIndex: number
  history: MoveHistoryItem[]
  tileStyle: TileStyle
}

export type GameMode = 'scorekeeper' | 'full'

export type RemainingTileInput = {
  playerId: string
  unplayedTiles: Tile[] // Tiles remaining on rack at end of game
}

export type GameAction =
  | { type: 'ADD_PLAYER'; name: string; isHost?: boolean }
  | { type: 'START_GAME'; mode?: GameMode }
  | { type: 'PLAY_WORD'; playerId: string; placements: TilePlacement[]; turnResult: ScoreResult }
  | { type: 'SKIP_TURN'; playerId: string }
  | { type: 'UNDO_MOVE'; playerId: string }
  | { type: 'INITIATE_END_GAME' }
  | { type: 'CANCEL_END_GAME' }
  | { type: 'END_GAME'; finalRacks: RemainingTileInput[]; finishingPlayerId: number }

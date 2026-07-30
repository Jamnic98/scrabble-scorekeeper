import { createContext } from 'react'
import type {
  GameAction,
  GameState,
  Player,
  TilePlacement,
  WordDictionary,
  WordDirection
} from '@scrabble/engine'
import { Coords } from 'types/global'

export interface UIState extends GameState {
  activeSquareCoords: Coords | null
  wordDirection: WordDirection
  placements: TilePlacement[]
  errorMessage: string | null
  lastTurnSummary: {
    words: string[]
    score: number
  } | null
}

export type UIAction =
  | GameAction
  | { type: 'SELECT_SQUARE'; coords: Coords | null }
  | { type: 'SET_WORD_DIRECTION'; direction: WordDirection }
  | { type: 'PLACE_TILE'; placement: TilePlacement }
  | { type: 'REMOVE_TILE'; row: number; col: number }
  | { type: 'CLEAR_PLACEMENTS' }
  | { type: 'SUBMIT_TURN'; dictionary: WordDictionary }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'REORDER_PLAYERS'; players: Player[] }

export type GameContextType = {
  state: UIState
  dispatch: React.Dispatch<UIAction>
}

export const GameContext = createContext<GameContextType | undefined>(undefined)

import React, { createContext, useContext, useReducer } from 'react'

import {
  gameReducer as engineGameReducer,
  createInitialState,
  validatePlacement,
  validateWordsInDictionary,
  calculateTurnScore,
  WordDictionary
} from '@scrabble/engine'
import type { GameAction, GameState, Player, TilePlacement } from '@scrabble/engine'

// ---------------------------------------------------------------------------
// 1. Extend Engine GameState with UI-specific interaction state
// ---------------------------------------------------------------------------

export interface UIState extends GameState {
  placements: TilePlacement[] // Tiles sitting on the board before "Submit Play" is clicked
  errorMessage: string | null
  lastTurnSummary: {
    words: string[]
    score: number
  } | null
}

// Actions handled specifically by the UI wrapper
export type UIAction =
  | GameAction // Standard engine actions (ADD_PLAYER, START_GAME, PASS_TURN, UNDO_MOVE, END_GAME)
  | { type: 'PLACE_TILE'; placement: TilePlacement }
  | { type: 'REMOVE_TILE'; row: number; col: number }
  | { type: 'CLEAR_PLACEMENTS' }
  | { type: 'SUBMIT_TURN'; dictionary: WordDictionary }
  | { type: 'REMOVE_PLAYER'; playerId: string }
  | { type: 'REORDER_PLAYERS'; players: Player[] }

const INITIAL_UI_STATE: UIState = {
  ...createInitialState('LOCAL'),
  placements: [],
  errorMessage: null,
  lastTurnSummary: null
}

// ---------------------------------------------------------------------------
// 2. Hybrid Reducer: Intercept UI actions or delegate to Engine
// ---------------------------------------------------------------------------

function combinedGameReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    // --- UI Local Staging Actions ---
    case 'PLACE_TILE': {
      const filtered = state.placements.filter(
        (p) => !(p.row === action.placement.row && p.col === action.placement.col)
      )
      return {
        ...state,
        placements: [...filtered, action.placement],
        errorMessage: null
      }
    }

    case 'REMOVE_TILE': {
      return {
        ...state,
        placements: state.placements.filter((p) => !(p.row === action.row && p.col === action.col)),
        errorMessage: null
      }
    }

    case 'CLEAR_PLACEMENTS': {
      return {
        ...state,
        placements: [],
        errorMessage: null
      }
    }

    // --- Submit Play: Validate in UI, then delegate PLAY_WORD to Engine ---
    case 'SUBMIT_TURN': {
      if (state.placements.length === 0) {
        return { ...state, errorMessage: 'No tiles placed on the board.' }
      }

      const activePlayer = state.players[state.activePlayerIndex]
      const isFirstTurn = state.history.length === 0

      // 1. Board Geometry Validation
      const placementResult = validatePlacement(state.board, state.placements, isFirstTurn)
      if (!placementResult.isValid) {
        return { ...state, errorMessage: placementResult.reason || 'Invalid tile placement' }
      }

      // 2. Dictionary Validation
      const dictResult = validateWordsInDictionary(state.board, state.placements, action.dictionary)
      if (!dictResult.isValid) {
        return {
          ...state,
          errorMessage: `Invalid word(s): ${dictResult.invalidWords.join(', ')}`
        }
      }

      // 3. Delegate execution to Engine's PLAY_WORD reducer case
      try {
        const turnResult = calculateTurnScore(state.board, state.placements)

        const engineNextState = engineGameReducer(state, {
          type: 'PLAY_WORD',
          playerId: activePlayer.id,
          placements: state.placements
        })

        return {
          ...engineNextState,
          placements: [],
          errorMessage: null,
          lastTurnSummary: {
            words: dictResult.formedWords,
            score: turnResult.totalScore
          }
        }
      } catch (err) {
        return {
          ...state,
          errorMessage: err instanceof Error ? err.message : 'Failed to commit move'
        }
      }
    }

    case 'REMOVE_PLAYER': {
      const updated = state.players.filter((p) => p.id !== action.playerId)
      // Ensure player 1 remains designated as host
      return {
        ...state,
        players: updated.map((p, idx) => ({ ...p, isHost: idx === 0 }))
      }
    }

    case 'REORDER_PLAYERS': {
      return {
        ...state,
        players: action.players
      }
    }

    // --- Delegate all other core actions directly to @scrabble/engine reducer ---
    default: {
      try {
        const nextEngineState = engineGameReducer(state, action as GameAction)
        return {
          ...nextEngineState,
          placements: state.placements,
          errorMessage: null,
          lastTurnSummary: state.lastTurnSummary
        }
      } catch (err) {
        return {
          ...state,
          errorMessage: err instanceof Error ? err.message : 'Action failed'
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Context & Provider Component
// ---------------------------------------------------------------------------

export type GameContextType = {
  state: UIState
  dispatch: React.Dispatch<UIAction>
}

export const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(combinedGameReducer, INITIAL_UI_STATE)

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

export function useGame(): GameContextType {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

import React, { useReducer } from 'react'
import {
  gameReducer as engineGameReducer,
  createInitialState,
  initialGameState,
  validatePlacement,
  calculateTurnScore,
  INITIAL_BOARD,
  createInitialBoard,
  validateWordsInDictionary
} from '@scrabble/engine'
import type { GameAction, GameState, MoveHistoryItem, TileLetter } from '@scrabble/engine'

import { GameContext, UIAction, UIState } from './GameContext'

const overrides: Partial<GameState> = {
  status: 'IN_PROGRESS',
  players: [
    { id: '1', name: 'Player 1', turnScores: [], score: 0 },
    { id: '2', name: 'Player 2', turnScores: [], score: 0 }
  ]
}

function makeInitialUIState(base = createInitialState('LOCAL', overrides)): UIState {
  const initialBoard = base.board || createInitialBoard()
  const gameStartHistoryItem: MoveHistoryItem = {
    id: 'game-start',
    playerId: '',
    actionType: 'GAME_START',
    words: [],
    totalScore: 0,
    placements: [],
    boardState: initialBoard,
    playedAt: Date.now()
  }

  return {
    ...base,
    placements: [],
    errorMessage: null,
    activeSquareCoords: null,
    wordDirection: null,
    roomCode: '',
    status: 'LOBBY',
    gameMode: 'scorekeeper',
    board: initialBoard,
    history: [gameStartHistoryItem],
    ...overrides
  }
}

function combinedGameReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SELECT_SQUARE': {
      return {
        ...state,
        activeSquareCoords: action.coords
      }
    }

    case 'SET_WORD_DIRECTION': {
      return {
        ...state,
        wordDirection: action.direction
      }
    }

    case 'PLACE_TILE': {
      const { row, col, tile } = action.placement

      // 1. Replace existing placement at coords
      const filteredPlacements = state.placements.filter((p) => !(p.row === row && p.col === col))

      // 2. Immutably update the board grid
      const updatedBoard = state.board.map((r, rowIndex) => {
        if (rowIndex !== row) return r
        return r.map((cell, colIndex) => {
          if (colIndex !== col) return cell
          return {
            ...cell,
            tile,
            letter: tile?.letter || cell?.tile?.letter // Extra fallback for custom UI cells
          }
        })
      })

      // 3. Update remaining letters
      const letterKey = (tile.isBlank ? ' ' : tile.letter.toLowerCase()) as TileLetter
      const currentCount = state.remainingLetters[letterKey] ?? 0

      if (currentCount <= 0) {
        return { ...state, errorMessage: 'No remaining letters of this type!' }
      }

      return {
        ...state,
        placements: [...filteredPlacements, action.placement],
        board: updatedBoard,
        remainingLetters: {
          ...state.remainingLetters,
          [letterKey]: currentCount - 1
        }
      }
    }

    case 'REMOVE_TILE': {
      const { row, col } = action

      const updatedBoard = state.board.map((r, rowIndex) => {
        if (rowIndex !== row) return r
        return r.map((cell, colIndex) => {
          if (colIndex !== col) return cell
          return {
            ...cell,
            tile: null
          }
        })
      })

      const targetPlacement = state.placements.find((p) => p.row === row && p.col === col)

      if (!targetPlacement) return state

      const letterKey = (
        targetPlacement.tile.isBlank ? ' ' : targetPlacement.tile.letter.toLowerCase()
      ) as TileLetter

      return {
        ...state,
        board: updatedBoard,
        placements: state.placements.filter((p) => !(p.row === row && p.col === col)),
        remainingLetters: {
          ...state.remainingLetters,
          [letterKey]: (state.remainingLetters[letterKey] ?? 0) + 1
        }
      }
    }

    case 'CLEAR_PLACEMENTS': {
      return {
        ...state,
        placements: [],
        errorMessage: null
      }
    }

    case 'SUBMIT_TURN': {
      if (state.placements.length === 0) {
        return { ...state, errorMessage: 'No tiles placed on the board.' }
      }

      const activePlayer = state.players[state.activePlayerIndex]
      const isFirstTurn = state.history.length === 0

      const placementResult = validatePlacement(state.board, state.placements, isFirstTurn)
      if (!placementResult.isValid) {
        return { ...state, errorMessage: placementResult.reason || 'Invalid tile placement' }
      }

      const dictResult = validateWordsInDictionary(state.board, state.placements, action.dictionary)
      if (!dictResult.isValid) {
        return {
          ...state,
          errorMessage: `Invalid word(s): ${dictResult.invalidWords.join(', ')}`
        }
      }

      try {
        const turnResult = calculateTurnScore(state.board, state.placements)

        const engineNextState = engineGameReducer(
          { ...state, board: state.history[state.history.length - 1].boardState || INITIAL_BOARD },
          {
            type: 'PLAY_WORD',
            playerId: activePlayer.id,
            placements: state.placements,
            turnResult
          }
        )

        return {
          ...state,
          ...engineNextState,
          placements: [],
          errorMessage: null,
          activeSquareCoords: state.activeSquareCoords,
          wordDirection: null
        }
      } catch (err) {
        return {
          ...state,
          wordDirection: null,
          activeSquareCoords: null,
          errorMessage: err instanceof Error ? err.message : 'Failed to commit move'
        }
      }
    }

    case 'REMOVE_PLAYER': {
      const players = state.players.filter((p) => p.id !== action.playerId)
      return {
        ...state,
        // TODO: fix isHost
        // players: updated.map((p, idx) => ({ ...p, isHost: idx === 0 }))
        players
      }
    }

    case 'REORDER_PLAYERS': {
      return {
        ...state,
        players: action.players
      }
    }

    default: {
      try {
        const nextEngineState = engineGameReducer(state, action as GameAction)
        return {
          ...nextEngineState,
          placements: state.placements,
          activeSquareCoords: state.activeSquareCoords,
          wordDirection: null,
          errorMessage: null
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

declare const process: { env?: { NODE_ENV?: string } } | undefined
const DEV_SEED_STATE =
  typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'
    ? initialGameState
    : undefined

export function GameProvider({ children }: { children: React.ReactNode }) {
  const initial = DEV_SEED_STATE ? makeInitialUIState(DEV_SEED_STATE) : makeInitialUIState()
  const [state, dispatch] = useReducer(combinedGameReducer, initial)

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

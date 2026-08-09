import React, { useEffect, useReducer } from 'react'
import {
  gameReducer as engineGameReducer,
  createInitialState,
  validatePlacement,
  calculateTurnScore,
  validateWordsInDictionary,
  createInitialBoard
} from '@scrabble/engine'
import type { BoardState, GameAction, GameState, TileLetter } from '@scrabble/engine'

import { GameContext, UIAction, UIState } from './GameContext'
import { gameStartHistoryItem } from 'utils'

const STORAGE_KEY = 'scrabble_game_state_v1'

// Helper to safely load persisted state
function loadPersistedState(): UIState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return null
    return JSON.parse(saved) as UIState
  } catch (err) {
    console.error('Failed to load saved game state from localStorage:', err)
    return null
  }
}

const overrides: Partial<GameState> = {
  // TODO: remove
  // status: 'IN_PROGRESS',
  // players: [
  //   { id: '1', name: 'Player 1', turnScores: [], score: 0 },
  //   { id: '2', name: 'Player 2', turnScores: [], score: 0 }
  // ]
}

function makeInitialUIState(base = createInitialState('LOCAL', overrides)): UIState {
  const fullBoard = base.board?.length ? base.board : createInitialBoard()

  return {
    ...base,
    roomCode: '',
    status: base.status || 'LOBBY',
    gameMode: 'scorekeeper',
    board: fullBoard,
    history: [gameStartHistoryItem],
    players: base.players || [],
    placements: [],
    errorMessage: null,
    activeSquareCoords: null,
    wordDirection: null,
    ...overrides
  }
}

function combinedGameReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_TILE_STYLE': {
      return {
        ...state,
        tileStyle: action.style
      }
    }

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

      // 1. Check if the PERMANENT board grid already has a committed tile from a past turn
      const square = state.board[row]?.[col]
      if (square?.tile !== null && square?.tile !== undefined) {
        return {
          ...state,
          errorMessage: 'Square is already occupied by a committed tile'
        }
      }

      // 2. Replace any pending placement at these same coordinates (staging only)
      const filteredPlacements = state.placements.filter((p) => !(p.row === row && p.col === col))
      const updatedPlacements = [...filteredPlacements, action.placement]

      // 3. Update remaining letters
      const letterKey = (tile.isBlank ? ' ' : tile.letter.toLowerCase()) as TileLetter
      const currentCount = state.remainingLetters[letterKey] ?? 0

      if (currentCount <= 0) {
        return { ...state, errorMessage: 'No remaining letters of this type!' }
      }

      return {
        ...state,
        placements: updatedPlacements,
        remainingLetters: {
          ...state.remainingLetters,
          [letterKey]: currentCount - 1
        },
        errorMessage: null
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
      if (state.placements.length === 0) {
        return { ...state, activeSquareCoords: null, wordDirection: null, errorMessage: null }
      }

      // Restore placed tiles from remainingLetters
      const remainingLetters = { ...state.remainingLetters }
      state.placements.forEach((p) => (state.remainingLetters[p.tile.letter.toLowerCase()] += 1))

      return {
        ...state,
        placements: [],
        activeSquareCoords: null,
        wordDirection: null,
        errorMessage: null,
        remainingLetters
      }
    }

    case 'SUBMIT_TURN': {
      if (state.placements.length === 0) {
        return { ...state, errorMessage: 'No tiles placed on the board.' }
      }

      // 🛡️ Guard against empty or uninitialized dictionary
      const isDictEmpty =
        !action.dictionary ||
        (action.dictionary instanceof Set
          ? action.dictionary.size === 0
          : Array.isArray(action.dictionary)
            ? action.dictionary.length === 0
            : Object.keys(action.dictionary).length === 0)

      if (isDictEmpty) {
        return {
          ...state,
          errorMessage: 'Dictionary not loaded.'
        }
      }

      const activePlayer = state.players[state.activePlayerIndex]
      const isFirstTurn = state.history.length === 0

      const previousHistoryItem = state.history[state.history.length - 1]
      const previousBoard: BoardState = previousHistoryItem?.boardState ?? state.board

      // 1. Validate placement rules
      const placementResult = validatePlacement(previousBoard, state.placements, isFirstTurn)
      if (!placementResult.isValid) {
        return {
          ...state,
          errorMessage: placementResult.reason || 'Invalid tile placement'
        }
      }

      // 2. Validate dictionary words
      const dictResult = validateWordsInDictionary(
        previousBoard,
        state.placements,
        action.dictionary
      )
      if (!dictResult.isValid) {
        return {
          ...state,
          errorMessage: `Invalid word(s): ${dictResult.invalidWords.join(', ')}`
        }
      }

      try {
        const turnResult = calculateTurnScore(previousBoard, state.placements)

        const engineNextState = engineGameReducer(
          { ...state, board: previousBoard },
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
          activeSquareCoords: null,
          wordDirection: null
        }
      } catch (err) {
        return {
          ...state,
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

    case 'INITIATE_END_GAME': {
      if (state.status !== 'IN_PROGRESS') return state

      return {
        ...state,
        status: 'END_GAME_PROMPT',
        placements: [],
        activeSquareCoords: null,
        wordDirection: null,
        errorMessage: null
      }
    }
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(combinedGameReducer, null, () => {
    const hasDevOverrides = Object.keys(overrides).length > 0

    // 🛡️ Skip localStorage completely if active dev overrides are configured
    if (hasDevOverrides) {
      return makeInitialUIState()
    }

    return loadPersistedState() ?? makeInitialUIState()
  })

  // 2. Persist state to localStorage every time it updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.error('Failed to save game state to localStorage:', err)
    }
  }, [state])

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>
}

import { createInitialBoard, type LetterSpec } from '../features'
import { LETTER_DISTRIBUTION, MAX_PLAYERS } from '../constants'
import type { GameAction, GameState, Player, MoveHistoryItem, LetterCounts } from '../types'

function getInitialLetterCounts(letterBag: Record<string, LetterSpec>): LetterCounts {
  const counts: LetterCounts = {}

  for (const [letter, spec] of Object.entries(letterBag)) {
    counts[letter] = typeof spec === 'number' ? spec : spec.count
  }

  return counts
}

export const initialGameState: GameState = {
  remainingLetters: getInitialLetterCounts(LETTER_DISTRIBUTION),
  players: [],
  activePlayerIndex: 0,
  history: [],
  roomCode: '',
  board: [],
  status: 'LOBBY',
  gameMode: 'scorekeeper'
}

export const createInitialState = (
  roomCode = '', // Default to seeding if in dev/testing, or pass custom initial state
  overrides: Partial<GameState> = {}
): GameState => ({
  remainingLetters: getInitialLetterCounts(LETTER_DISTRIBUTION),
  roomCode,
  status: initialGameState.status,
  gameMode: 'scorekeeper',
  board: createInitialBoard(),
  players: [],
  activePlayerIndex: 0,
  history: [],
  ...overrides
})

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ==========================================
    // 1. ADD_PLAYER
    // ==========================================
    case 'ADD_PLAYER': {
      if (state.players.length >= MAX_PLAYERS) {
        throw new Error(`Maximum of ${MAX_PLAYERS} players allowed`)
      }

      const newPlayer: Player = {
        id: `player-${state.players.length + 1}-${Date.now()}`,
        name: action.name,
        score: 0,
        isHost: action.isHost ?? false,
        turnScores: []
      }

      return {
        ...state,
        players: [...state.players, newPlayer]
      }
    }

    // ==========================================
    // 2. START_GAME
    // ==========================================
    case 'START_GAME': {
      if (state.players.length < 2) {
        throw new Error('At least 2 players are required to start')
      }

      return {
        ...state,
        status: 'IN_PROGRESS',
        activePlayerIndex: 0,
        board: createInitialBoard(),
        history: []
      }
    }

    // ==========================================
    // 3. PLAY_WORD
    // ==========================================
    case 'PLAY_WORD': {
      // Guard against playing moves after game end
      if (state.status === 'COMPLETED') {
        throw new Error('Game is already completed')
      }

      const activePlayer = state.players[state.activePlayerIndex]
      if (action.playerId !== activePlayer.id) {
        throw new Error('Not your turn')
      }

      // 1. Apply placements to board
      const newBoard = state.board.map((row) => [...row])

      action.placements.forEach(({ row, col, tile }) => {
        // Check if board square is occupied
        if (newBoard[row][col].tile !== null) {
          throw new Error(`Square at (${row}, ${col}) is already occupied`)
        }

        // Look up square and update tile
        newBoard[row][col] = {
          ...newBoard[row][col],
          tile
        }
      })

      // 2. Extract calculated score & words from turnResult
      const turnScore = action.turnResult?.totalScore ?? 0
      const formedWords = action.turnResult?.words ?? []

      const historyItem: MoveHistoryItem = {
        id: `move-${Date.now()}`,
        playerId: action.playerId,
        actionType: 'PLAY_WORD',
        words: formedWords,
        totalScore: turnScore,
        placements: action.placements,
        boardState: newBoard,
        playedAt: Date.now()
      }

      // 3. Update player total score, turnScores history array, and rotate turn
      const updatedPlayers = state.players.map((p, idx) => {
        if (idx !== state.activePlayerIndex) return p

        return {
          ...p,
          score: p.score + turnScore, // ✅ Add calculated turn score to total
          turnScores: [...(p.turnScores || []), turnScore] // ✅ Track individual turn history
        }
      })

      return {
        ...state,
        board: newBoard,
        players: updatedPlayers,
        history: [...state.history, historyItem],
        activePlayerIndex: (state.activePlayerIndex + 1) % state.players.length
      }
    }

    // ==========================================
    // 4. SKIP_TURN
    // ==========================================
    case 'SKIP_TURN': {
      // Guard against passing turn after game ends
      if (state.status === 'COMPLETED') {
        throw new Error('Game is already completed')
      }

      const activePlayer = state.players[state.activePlayerIndex]
      if (action.playerId !== activePlayer.id) {
        throw new Error('Not your turn')
      }

      const newTurnScores = [...activePlayer.turnScores, 0]

      const updatedPlayers = state.players.map((p) => {
        if (p.id === activePlayer.id) {
          return {
            ...p,
            turnScores: newTurnScores
          }
        }

        return p
      })

      const historyItem: MoveHistoryItem = {
        id: `move-${Date.now()}`,
        playerId: action.playerId,
        actionType: 'SKIP_TURN',
        words: [],
        totalScore: newTurnScores.reduce((a, b) => a + b, 0),
        placements: [],
        playedAt: Date.now()
      }

      return {
        ...state,
        players: updatedPlayers,
        history: [...state.history, historyItem],
        activePlayerIndex: (state.activePlayerIndex + 1) % state.players.length
      }
    }

    // ==========================================
    // 5. UNDO_MOVE
    // ==========================================
    case 'UNDO_MOVE': {
      // if (state.history.length === 0) return state

      const lastMove = state.history[state.history.length - 1]
      const prevPlayerIndex =
        (state.activePlayerIndex - 1 + state.players.length) % state.players.length

      // const prevPlayer = state.players[prevPlayerIndex]

      // // Verify that the person requesting undo matches the last player
      // if (action.playerId !== prevPlayer.id) {
      //   throw new Error('Can only undo your own turn')
      // }

      // Clear placed tiles from board if last turn was a PLAY_WORD
      const restoredBoard = state.board.map((row) => [...row])
      if (lastMove.actionType === 'PLAY_WORD') {
        lastMove.placements.forEach(({ row, col }) => {
          restoredBoard[row][col] = {
            ...restoredBoard[row][col],
            tile: null
          }
        })
      }

      // Revert player's score
      const restoredPlayers = state.players.map((p, idx) =>
        idx === prevPlayerIndex ? { ...p, turnScores: p.turnScores.slice(0, -1) } : p
      )

      return {
        ...state,
        board: restoredBoard,
        players: restoredPlayers,
        history: state.history.slice(0, -1),
        activePlayerIndex: prevPlayerIndex
      }
    }

    // ==========================================
    // 6. END_GAME
    // ==========================================
    case 'END_GAME': {
      let totalDeductedPoints = 0

      const updatedPlayers = state.players.map((player) => {
        const rackInput = action.finalRacks.find((r) => r.playerId === player.id)
        const unplayedPoints = rackInput
          ? rackInput.unplayedTiles.reduce((sum, t) => sum + t.points, 0)
          : 0

        totalDeductedPoints += unplayedPoints

        return {
          ...player,
          score: player.score - unplayedPoints,
          unplayedPoints
        }
      })

      // Award deducted sum to player who emptied rack first
      const finalPlayers = updatedPlayers.map((player) => {
        if (player.unplayedPoints === 0 && totalDeductedPoints > 0) {
          return { ...player, score: player.score + totalDeductedPoints }
        }
        return player
      })

      return {
        ...state,
        status: 'COMPLETED',
        players: finalPlayers
      }
    }

    default:
      return state
  }
}

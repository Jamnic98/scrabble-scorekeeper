import { createInitialBoard, type LetterSpec } from '../features'
import { LETTER_DISTRIBUTION, MAX_PLAYERS } from '../constants'
import type {
  GameAction,
  GameState,
  Player,
  MoveHistoryItem,
  LetterCounts,
  BoardState
} from '../types'

function getInitialLetterCounts(letterBag: Record<string, LetterSpec>): LetterCounts {
  const counts: LetterCounts = {}

  for (const [letter, spec] of Object.entries(letterBag)) {
    counts[letter] = typeof spec === 'number' ? spec : spec.count
  }

  return counts
}

export const initialGameState: GameState = {
  gameId: '',
  remainingLetters: getInitialLetterCounts(LETTER_DISTRIBUTION),
  players: [],
  activePlayerIndex: 0,
  history: [],
  roomCode: '',
  board: [],
  status: 'LOBBY',
  gameMode: 'scorekeeper',
  tileStyle: 'mono'
}

export const createInitialState = (
  roomCode = '', // Default to seeding if in dev/testing, or pass custom initial state
  overrides: Partial<GameState> = {}
): GameState => ({
  gameId: '',
  remainingLetters: getInitialLetterCounts(LETTER_DISTRIBUTION),
  roomCode,
  status: initialGameState.status,
  gameMode: 'scorekeeper',
  board: createInitialBoard(),
  players: [],
  activePlayerIndex: 0,
  history: [],
  tileStyle: 'mono',
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
        gameId: crypto.randomUUID(),
        status: 'IN_PROGRESS'
      }
    }

    // ==========================================
    // 3. PLAY_WORD
    // ==========================================
    case 'PLAY_WORD': {
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
        if (newBoard[row][col].tile !== null) {
          throw new Error(`Square at (${row}, ${col}) is already occupied`)
        }
        newBoard[row][col] = {
          ...newBoard[row][col],
          tile
        }
      })

      // 2. Deduct placed tiles from remainingLetters
      const updatedRemainingLetters = { ...state.remainingLetters }
      action.placements.forEach(({ tile }) => {
        const letterKey = tile.isBlank ? 'BLANK' : tile.letter.toUpperCase()
        if (updatedRemainingLetters[letterKey] !== undefined) {
          updatedRemainingLetters[letterKey] = Math.max(0, updatedRemainingLetters[letterKey] - 1)
        }
      })

      // 3. Extract calculated score & words from turnResult
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

      // 4. Update player score & turn history
      const updatedPlayers = state.players.map((p, idx) => {
        if (idx !== state.activePlayerIndex) return p

        return {
          ...p,
          score: p.score + turnScore,
          turnScores: [...(p.turnScores || []), turnScore]
        }
      })

      return {
        ...state,
        board: newBoard,
        players: updatedPlayers,
        history: [...state.history, historyItem],
        remainingLetters: updatedRemainingLetters, // ✅ Bag counts updated
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
        totalScore: 0,
        boardState: state.board,
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
      if (state.history.length === 0) return state

      const lastMove = state.history[state.history.length - 1]

      // 1. Identify exact player who made this move from history
      const targetPlayerIndex = state.players.findIndex((p) => p.id === lastMove.playerId)
      const prevPlayerIndex = targetPlayerIndex !== -1 ? targetPlayerIndex : state.activePlayerIndex

      // 2. Remove last move from history
      const newHistory = state.history.slice(0, -1)

      // 3. Extract previous board snapshot safely
      const previousHistoryItem = newHistory[newHistory.length - 1] as MoveHistoryItem | undefined
      const restoredBoard: BoardState = previousHistoryItem?.boardState ?? createInitialBoard()

      // 4. Revert player's total score and turnScores
      const restoredPlayers = state.players.map((p, idx) => {
        if (idx !== prevPlayerIndex) return p
        return {
          ...p,
          score: Math.max(0, p.score - lastMove.totalScore),
          turnScores: (p.turnScores || []).slice(0, -1)
        }
      })

      // 5. Restore tile counts back into remainingLetters
      const restoredLetters = { ...state.remainingLetters }

      if (lastMove.actionType === 'PLAY_WORD' && lastMove.placements) {
        lastMove.placements.forEach(({ tile }) => {
          // Normalize key to match bag distribution (uppercase letter or ' ')
          const letterKey = tile.isBlank ? ' ' : tile.letter.toLowerCase()
          const currentVal = restoredLetters[letterKey] ?? 0
          restoredLetters[letterKey] = currentVal + 1
        })
      }

      return {
        ...state,
        board: restoredBoard,
        players: restoredPlayers,
        history: newHistory,
        remainingLetters: restoredLetters,
        activePlayerIndex: prevPlayerIndex
      }
    }

    // ==========================================
    // CANCEL_END_GAME
    // ==========================================
    case 'CANCEL_END_GAME': {
      if (state.status !== 'END_GAME_PROMPT') return state

      return {
        ...state,
        status: 'IN_PROGRESS'
      }
    }

    // ==========================================
    // 6. END_GAME
    // ==========================================
    case 'END_GAME': {
      let totalDeductedPoints = 0

      const playerDeductions = state.players.map((player) => {
        const rackInput = action.finalRacks.find((r) => String(r.playerId) === String(player.id))
        const unplayedTiles = rackInput?.unplayedTiles ?? []
        const unplayedPoints = unplayedTiles.reduce((sum, t) => sum + (Number(t.points) || 0), 0)
        totalDeductedPoints += unplayedPoints
        return { playerId: player.id, unplayedPoints }
      })

      const finalPlayers = state.players.map((player) => {
        const deduction = playerDeductions.find((d) => String(d.playerId) === String(player.id))
        const unplayedPoints = deduction?.unplayedPoints ?? 0

        // Explicit check against the known finishing player, not inferred from rack state
        const isFinishingPlayer =
          action.finishingPlayerId != null && String(player.id) === String(action.finishingPlayerId)

        const adjustmentScore = isFinishingPlayer
          ? totalDeductedPoints - unplayedPoints
          : -unplayedPoints
        const currentTurnScores = Array.isArray(player.turnScores) ? player.turnScores : []
        const currentScore = Number(player.score) || 0

        return {
          ...player,
          score: currentScore + adjustmentScore,
          unplayedPoints,
          turnScores: [...currentTurnScores, adjustmentScore]
        }
      })

      // 4. Determine winner(s) by final score (handles ties)
      const highestScore = Math.max(...finalPlayers.map((p) => Number(p.score) || 0))
      const playersWithWinnerFlag = finalPlayers.map((player) => ({
        ...player,
        isWinner: (Number(player.score) || 0) === highestScore
      }))

      return {
        ...state,
        status: 'COMPLETED',
        players: playersWithWinnerFlag
      }
    }

    default:
      return state
  }
}

import { createInitialBoard } from './board'
import type { GameAction, GameState, Player, MoveHistoryItem } from '../types'

export const initialGameState: GameState = {
  players: [
    {
      name: 'Player 1',
      turnScores: [],
      id: '1',
      score: 0,
      isHost: true
    },
    {
      name: 'Player 2',
      turnScores: [],
      id: '2',
      score: 0
    }
  ],
  activePlayerIndex: 0,
  history: [],
  roomCode: '',
  board: [],
  status: 'LOBBY',
  gameMode: 'scorekeeper'
}

export const createInitialState = (roomCode = ''): GameState => ({
  roomCode,
  status: 'LOBBY',
  gameMode: 'scorekeeper',
  board: createInitialBoard(),
  players: [],
  activePlayerIndex: 0,
  history: []
})

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ==========================================
    // 1. ADD_PLAYER
    // ==========================================
    case 'ADD_PLAYER': {
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

      state.status = 'IN_PROGRESS'
      return {
        ...state,
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

      action.placements.forEach(({ row, col, id, letter, points, isBlank }) => {
        // Check if board square is occupied
        if (newBoard[row][col].tile !== null) {
          throw new Error(`Square at (${row}, ${col}) is already occupied`)
        }

        // Look up square and update tile
        newBoard[row][col] = {
          ...newBoard[row][col],
          tile: {
            id,
            letter,
            points,
            isBlank
          }
        }
      })

      // 2. Placeholder scoring (integrate calculateWordScore / cross-words here)
      const rawPoints = action.placements.reduce((sum, p) => sum + (p.isBlank ? 0 : p.points), 0)
      const hitsCenterStar = action.placements.some((p) => p.row === 7 && p.col === 7)
      const turnScore = hitsCenterStar ? rawPoints * 2 : rawPoints

      const historyItem: MoveHistoryItem = {
        id: `move-${Date.now()}`,
        playerId: action.playerId,
        actionType: 'PLAY_WORD',
        words: [{ word: 'EXAMPLE', score: turnScore, isMainWord: true }],
        totalScore: turnScore,
        placements: action.placements.map((p) => ({
          ...p,
          letter: p.letter ?? 'A',
          points: 1,
          isBlank: !!p.isBlank
        })),
        playedAt: Date.now()
      }

      // 3. Update scores & rotate turn
      const updatedPlayers = state.players.map((p, idx) =>
        idx === state.activePlayerIndex ? { ...p, score: p.score + turnScore } : p
      )

      return {
        ...state,
        board: newBoard,
        players: updatedPlayers,
        history: [...state.history, historyItem],
        activePlayerIndex: (state.activePlayerIndex + 1) % state.players.length
      }
    }

    // ==========================================
    // 4. PASS_TURN
    // ==========================================
    case 'PASS_TURN': {
      // Guard against passing turn after game ends
      if (state.status === 'COMPLETED') {
        throw new Error('Game is already completed')
      }

      const activePlayer = state.players[state.activePlayerIndex]
      if (action.playerId !== activePlayer.id) {
        throw new Error('Not your turn')
      }

      const historyItem: MoveHistoryItem = {
        id: `move-${Date.now()}`,
        playerId: action.playerId,
        actionType: 'PASS_TURN',
        words: [],
        totalScore: 0,
        placements: [],
        playedAt: Date.now()
      }

      return {
        ...state,
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
      const prevPlayerIndex =
        (state.activePlayerIndex - 1 + state.players.length) % state.players.length

      const prevPlayer = state.players[prevPlayerIndex]

      // Verify that the person requesting undo matches the last player
      if (action.playerId !== prevPlayer.id) {
        throw new Error('Can only undo your own turn')
      }

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
        idx === prevPlayerIndex ? { ...p, score: p.score - lastMove.totalScore } : p
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

      state.status = 'COMPLETED'
      return {
        ...state,
        players: finalPlayers
      }
    }

    default:
      return state
  }
}

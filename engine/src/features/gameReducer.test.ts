import { describe, it, expect, beforeEach } from 'vitest'

import { gameReducer, createInitialState } from './gameReducer'
import { type GameState } from '../types'

describe('Scrabble Scorekeeper Reducer', () => {
  let initialState: GameState

  beforeEach(() => {
    initialState = createInitialState('ROOM123')
  })

  // ==========================================
  // 1. SETUP ACTIONS (ADD_PLAYER & START_GAME)
  // ==========================================
  describe('Lobby & Setup', () => {
    it('should allow adding players to the lobby', () => {
      let state = gameReducer(initialState, { type: 'ADD_PLAYER', name: 'Alice', isHost: true })
      state = gameReducer(state, { type: 'ADD_PLAYER', name: 'Bob' })

      expect(state.players).toHaveLength(2)
      expect(state.players[0].name).toBe('Alice')
      expect(state.players[1].name).toBe('Bob')
      expect(state.status).toBe('LOBBY')
    })

    it('should fail to start game if under minimum players (< 2)', () => {
      let state = gameReducer(initialState, { type: 'ADD_PLAYER', name: 'Alice' })

      expect(() => {
        gameReducer(state, { type: 'START_GAME', mode: 'scorekeeper' })
      }).toThrow('At least 2 players are required to start')
    })

    it('should set initial active player and status on START_GAME', () => {
      let state = gameReducer(initialState, { type: 'ADD_PLAYER', name: 'Alice' })
      state = gameReducer(state, { type: 'ADD_PLAYER', name: 'Bob' })
      state = gameReducer(state, { type: 'START_GAME', mode: 'scorekeeper' })

      expect(state.status).toBe('IN_PROGRESS')
      expect(state.activePlayerIndex).toBe(0)
      expect(state.gameMode).toBe('scorekeeper')
    })
  })

  // ==========================================
  // 2. TURN ACTIONS (PLAY_WORD & PASS_TURN)
  // ==========================================
  describe('Gameplay Mechanics', () => {
    let inGameState: GameState

    beforeEach(() => {
      let state = gameReducer(initialState, { type: 'ADD_PLAYER', name: 'Alice' })
      state = gameReducer(state, { type: 'ADD_PLAYER', name: 'Bob' })
      inGameState = gameReducer(state, { type: 'START_GAME', mode: 'scorekeeper' })
    })

    it('should reject action if not played by active player', () => {
      const bobId = inGameState.players[1].id

      expect(() => {
        gameReducer(inGameState, { type: 'PASS_TURN', playerId: bobId })
      }).toThrow('Not your turn')
    })

    it('should rotate turn and log turn on PASS_TURN', () => {
      const aliceId = inGameState.players[0].id
      const state = gameReducer(inGameState, { type: 'PASS_TURN', playerId: aliceId })

      expect(state.activePlayerIndex).toBe(1)
      expect(state.history).toHaveLength(1)
      expect(state.history[0].actionType).toBe('PASS_TURN')
      expect(state.history[0].totalScore).toBe(0)
    })

    it('should update board, score, and turn on PLAY_WORD', () => {
      const aliceId = inGameState.players[0].id

      // Place "CAT" horizontally at center (7,7)
      const placements = [
        { id: 't1', row: 7, col: 7, letter: 'C', points: 3, isBlank: false },
        { id: 't2', row: 7, col: 8, letter: 'A', points: 1, isBlank: false },
        { id: 't3', row: 7, col: 9, letter: 'T', points: 1, isBlank: false }
      ]

      const state = gameReducer(inGameState, {
        type: 'PLAY_WORD',
        playerId: aliceId,
        placements
      })

      // Turn rotates to Bob (index 1)
      expect(state.activePlayerIndex).toBe(1)

      // Board updated at (7,7)
      expect(state.board[7][7].tile?.letter).toBe('C')

      // History recorded
      expect(state.history).toHaveLength(1)
      expect(state.history[0].actionType).toBe('PLAY_WORD')

      // Alice score updated (Center star gives Double Word multiplier => (3+1+1)*2 = 10)
      expect(state.players[0].score).toBe(10)
    })

    it('should throw an error if attempting to place a tile on an occupied square', () => {
      const aliceId = inGameState.players[0].id
      const bobId = inGameState.players[1].id

      // Alice plays at (7, 7)
      const state = gameReducer(inGameState, {
        type: 'PLAY_WORD',
        playerId: aliceId,
        placements: [{ id: 't1', row: 7, col: 7, letter: 'A', points: 1, isBlank: false }]
      })

      // Bob attempts to overwrite (7, 7)
      expect(() => {
        gameReducer(state, {
          type: 'PLAY_WORD',
          playerId: bobId,
          placements: [{ id: 't2', row: 7, col: 7, letter: 'B', points: 3, isBlank: false }]
        })
      }).toThrow()
    })

    it('should handle turn rotation across 3 or more players', () => {
      let state = gameReducer(initialState, { type: 'ADD_PLAYER', name: 'Alice' })
      state = gameReducer(state, { type: 'ADD_PLAYER', name: 'Bob' })
      state = gameReducer(state, { type: 'ADD_PLAYER', name: 'Charlie' })
      state = gameReducer(state, { type: 'START_GAME' })

      const [alice, bob, charlie] = state.players

      // Alice -> Bob
      state = gameReducer(state, { type: 'PASS_TURN', playerId: alice.id })
      expect(state.activePlayerIndex).toBe(1)

      // Bob -> Charlie
      state = gameReducer(state, { type: 'PASS_TURN', playerId: bob.id })
      expect(state.activePlayerIndex).toBe(2)

      // Charlie -> Alice (Wrap-around!)
      state = gameReducer(state, { type: 'PASS_TURN', playerId: charlie.id })
      expect(state.activePlayerIndex).toBe(0)
    })

    it('should score 0 points for blank tiles regardless of assigned letter', () => {
      const aliceId = inGameState.players[0].id

      // Play a blank tile assigned as "E"
      const state = gameReducer(inGameState, {
        type: 'PLAY_WORD',
        playerId: aliceId,
        placements: [{ id: 'b1', row: 7, col: 7, letter: 'E', points: 0, isBlank: true }]
      })

      // On center star (2x word), (0 * 2) = 0
      expect(state.players[0].score).toBe(0)
      expect(state.board[7][7].tile?.isBlank).toBe(true)
    })
  })

  // ==========================================
  // 3. UNDO MECHANICS (UNDO_MOVE)
  // ==========================================
  describe('Undo Move', () => {
    it('should revert board, scores, turn, and history on UNDO_MOVE', () => {
      let state = gameReducer(initialState, { type: 'ADD_PLAYER', name: 'Alice' })
      state = gameReducer(state, { type: 'ADD_PLAYER', name: 'Bob' })
      state = gameReducer(state, { type: 'START_GAME' })

      const aliceId = state.players[0].id
      const placements = [
        { id: 't1', row: 7, col: 7, letter: 'C', points: 3, isBlank: false },
        { id: 't2', row: 7, col: 8, letter: 'A', points: 1, isBlank: false }
      ]

      // Alice plays move
      state = gameReducer(state, { type: 'PLAY_WORD', playerId: aliceId, placements })
      expect(state.activePlayerIndex).toBe(1)
      expect(state.players[0].score).toBeGreaterThan(0)

      // Undo the move
      state = gameReducer(state, { type: 'UNDO_MOVE', playerId: aliceId })

      // Turn reverts back to Alice
      expect(state.activePlayerIndex).toBe(0)
      // Score reverts back to 0
      expect(state.players[0].score).toBe(0)
      // Board is cleared at placed tiles
      expect(state.board[7][7].tile).toBeNull()
      // History stack shrinks
      expect(state.history).toHaveLength(0)
    })

    it('should handle sequential UNDO_MOVE calls across multiple players', () => {
      let state = gameReducer(initialState, { type: 'ADD_PLAYER', name: 'Alice' })
      state = gameReducer(state, { type: 'ADD_PLAYER', name: 'Bob' })
      state = gameReducer(state, { type: 'START_GAME' })

      const [alice, bob] = state.players

      // Alice plays turn 1
      state = gameReducer(state, {
        type: 'PLAY_WORD',
        playerId: alice.id,
        placements: [{ id: 't1', row: 7, col: 7, letter: 'A', points: 1, isBlank: false }]
      })

      // Bob passes turn 2
      state = gameReducer(state, { type: 'PASS_TURN', playerId: bob.id })
      expect(state.activePlayerIndex).toBe(0) // Back to Alice

      // Bob undos his pass
      state = gameReducer(state, { type: 'UNDO_MOVE', playerId: bob.id })
      expect(state.activePlayerIndex).toBe(1) // Active player is Bob again

      // Alice undos her word placement
      state = gameReducer(state, { type: 'UNDO_MOVE', playerId: alice.id })
      expect(state.activePlayerIndex).toBe(0) // Active player is Alice again
      expect(state.board[7][7].tile).toBeNull() // Board cleared
      expect(state.history).toHaveLength(0)
    })
  })

  // ==========================================
  // 4. END GAME & SCRABBLE SCORE DEDUCTION
  // ==========================================
  describe('End Game Calculations', () => {
    it('should correctly deduct remaining unplayed tiles from final scores', () => {
      let state = gameReducer(initialState, { type: 'ADD_PLAYER', name: 'Alice' })
      state = gameReducer(state, { type: 'ADD_PLAYER', name: 'Bob' })
      state = gameReducer(state, { type: 'START_GAME' })

      const aliceId = state.players[0].id
      const bobId = state.players[1].id

      // Set initial scores
      state.players[0].score = 100
      state.players[1].score = 80

      // End Game input: Bob emptied rack, Alice left with Q (10 pts) and Z (10 pts)
      const finalRacks = [
        {
          playerId: aliceId,
          unplayedTiles: [
            { id: 'q1', letter: 'Q', points: 10, isBlank: false },
            { id: 'z1', letter: 'Z', points: 10, isBlank: false }
          ]
        },
        {
          playerId: bobId,
          unplayedTiles: [] // Emptied rack gets sum of opponent unplayed tiles (+20 pts)
        }
      ]

      state = gameReducer(state, { type: 'END_GAME', finalRacks })

      expect(state.status).toBe('COMPLETED')
      // Alice: 100 - 20 = 80
      expect(state.players[0].score).toBe(80)
      // Bob: 80 + 20 = 100
      expect(state.players[1].score).toBe(100)
    })

    it('should reject PLAY_WORD or PASS_TURN if game is already COMPLETED', () => {
      let state = gameReducer(initialState, { type: 'ADD_PLAYER', name: 'Alice' })
      state = gameReducer(state, { type: 'ADD_PLAYER', name: 'Bob' })
      state = gameReducer(state, { type: 'START_GAME' })

      state = gameReducer(state, { type: 'END_GAME', finalRacks: [] })
      expect(state.status).toBe('COMPLETED')

      expect(() => {
        gameReducer(state, { type: 'PASS_TURN', playerId: state.players[0].id })
      }).toThrow()
    })
  })
})

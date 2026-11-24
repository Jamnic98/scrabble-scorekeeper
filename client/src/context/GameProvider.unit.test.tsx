import { describe, it, expect } from 'vitest'
import { WordDictionary } from '@scrabble/engine'
import type { Tile, TilePlacement } from '@scrabble/engine'

import { combinedGameReducer, makeInitialUIState } from './GameProvider'
import type { UIState } from './GameContext'

const sumLetters = (state: UIState) =>
  Object.values(state.remainingLetters).reduce((sum, n) => sum + Number(n), 0)

const makeTile = (id: string, letter: string, points: number, isBlank = false): Tile => ({
  id,
  letter,
  points,
  isBlank
})

const at = (row: number, col: number, tile: Tile): TilePlacement => ({ row, col, tile })

const startedState = (): UIState => {
  let state = makeInitialUIState()
  state = combinedGameReducer(state, { type: 'ADD_PLAYER', name: 'Alice' })
  state = combinedGameReducer(state, { type: 'ADD_PLAYER', name: 'Bob' })
  return combinedGameReducer(state, { type: 'START_GAME' })
}

const catDictionary = () => {
  const dict = new WordDictionary()
  dict.loadWords(['CAT'])
  return dict
}

// Place "CAT" across the center star and submit it
const submitCat = (state: UIState) => {
  let s = combinedGameReducer(state, {
    type: 'PLACE_TILE',
    placement: at(7, 7, makeTile('t1', 'C', 3))
  })
  s = combinedGameReducer(s, { type: 'PLACE_TILE', placement: at(7, 8, makeTile('t2', 'A', 1)) })
  s = combinedGameReducer(s, { type: 'PLACE_TILE', placement: at(7, 9, makeTile('t3', 'T', 1)) })
  return combinedGameReducer(s, { type: 'SUBMIT_TURN', dictionary: catDictionary() })
}

describe('combinedGameReducer', () => {
  it('creates a LOBBY state with a full 100-tile bag and a GAME_START history entry', () => {
    const state = makeInitialUIState()
    expect(state.status).toBe('LOBBY')
    expect(state.board).toHaveLength(15)
    expect(state.history).toHaveLength(1)
    expect(state.history[0].actionType).toBe('GAME_START')
    expect(sumLetters(state)).toBe(100)
  })

  it('starts the game once two players join', () => {
    const state = startedState()
    expect(state.status).toBe('IN_PROGRESS')
    expect(state.gameId).toBeTruthy()
    expect(state.players).toHaveLength(2)
    expect(state.activePlayerIndex).toBe(0)
  })

  describe('tile staging (PLACE_TILE / REMOVE_TILE / CLEAR_PLACEMENTS)', () => {
    it('deducts a staged tile from the bag', () => {
      let state = startedState()
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 7, makeTile('t1', 'C', 3))
      })
      expect(state.placements).toHaveLength(1)
      expect(state.remainingLetters['c']).toBe(1) // 2 - 1
      expect(sumLetters(state)).toBe(99)
    })

    it('refuses to stage more tiles of a letter than remain in the bag', () => {
      let state = startedState()
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 7, makeTile('q1', 'Q', 10))
      })
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 8, makeTile('q2', 'Q', 10))
      })
      expect(state.placements).toHaveLength(1)
      expect(state.errorMessage).toMatch(/No remaining letters/)
    })

    it('refuses to stage on a committed board tile', () => {
      let state = submitCat(startedState())
      expect(state.errorMessage).toBeNull()

      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 7, makeTile('t9', 'Z', 10))
      })
      expect(state.errorMessage).toMatch(/occupied/)
      expect(state.placements).toHaveLength(0)
    })

    it('restores the bag when a staged tile is removed', () => {
      let state = startedState()
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 7, makeTile('t1', 'C', 3))
      })
      state = combinedGameReducer(state, { type: 'REMOVE_TILE', row: 7, col: 7 })
      expect(state.placements).toHaveLength(0)
      expect(state.remainingLetters['c']).toBe(2)
      expect(sumLetters(state)).toBe(100)
    })

    it('restores the bag when all staged tiles are cleared', () => {
      let state = startedState()
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 7, makeTile('t1', 'C', 3))
      })
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 8, makeTile('t2', 'A', 1))
      })
      state = combinedGameReducer(state, { type: 'CLEAR_PLACEMENTS' })
      expect(state.placements).toHaveLength(0)
      expect(sumLetters(state)).toBe(100)
    })
  })

  describe('SUBMIT_TURN', () => {
    it('rejects an empty submission', () => {
      const state = combinedGameReducer(startedState(), {
        type: 'SUBMIT_TURN',
        dictionary: catDictionary()
      })
      expect(state.errorMessage).toMatch(/No tiles placed/)
    })

    it('rejects a first move that does not cover the center star', () => {
      let state = startedState()
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(0, 0, makeTile('t1', 'C', 3))
      })
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(0, 1, makeTile('t2', 'A', 1))
      })
      state = combinedGameReducer(state, { type: 'SUBMIT_TURN', dictionary: catDictionary() })
      expect(state.errorMessage).toMatch(/center/i)
      expect(state.board[0][0].tile).toBeNull()
    })

    it('rejects words that are not in the dictionary', () => {
      let state = startedState()
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 7, makeTile('t1', 'C', 3))
      })
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 8, makeTile('t2', 'A', 1))
      })
      state = combinedGameReducer(state, {
        type: 'PLACE_TILE',
        placement: at(7, 9, makeTile('t3', 'T', 1))
      })
      const emptyDict = new WordDictionary()
      emptyDict.loadWords(['DOG'])
      state = combinedGameReducer(state, { type: 'SUBMIT_TURN', dictionary: emptyDict })
      expect(state.errorMessage).toMatch(/Invalid word/)
      expect(state.board[7][7].tile).toBeNull()
    })

    it('commits a valid word: board, score, turn rotation, and bag stay consistent', () => {
      const state = submitCat(startedState())

      expect(state.errorMessage).toBeNull()
      expect(state.board[7][7].tile?.letter).toBe('C')
      expect(state.board[7][9].tile?.letter).toBe('T')
      expect(state.players[0].score).toBe(10) // (3+1+1) * 2 for the center star
      expect(state.players[0].turnScores).toEqual([10])
      expect(state.activePlayerIndex).toBe(1)
      expect(state.history).toHaveLength(2)
      expect(state.history[1].actionType).toBe('PLAY_WORD')
      expect(state.placements).toHaveLength(0)
      // Bag deducted exactly once per played tile: 100 - 3 on board
      expect(sumLetters(state)).toBe(97)
    })

    it('undoing the committed word restores board, score, turn, and bag', () => {
      let state = submitCat(startedState())
      state = combinedGameReducer(state, { type: 'UNDO_MOVE', playerId: state.players[1].id })

      expect(state.activePlayerIndex).toBe(0)
      expect(state.players[0].score).toBe(0)
      expect(state.board[7][7].tile).toBeNull()
      expect(state.history).toHaveLength(1)
      expect(sumLetters(state)).toBe(100)
    })
  })

  describe('END_GAME', () => {
    it('completes the game and flags the winner', () => {
      let state = submitCat(startedState())
      const [alice, bob] = state.players

      state = combinedGameReducer(state, {
        type: 'END_GAME',
        finalRacks: [
          { playerId: alice.id, unplayedTiles: [] },
          { playerId: bob.id, unplayedTiles: [makeTile('q1', 'Q', 10)] }
        ],
        finishingPlayerId: alice.id
      })

      expect(state.status).toBe('COMPLETED')
      expect(state.players[0].score).toBe(20) // 10 + 10 bonus from Bob's rack
      expect(state.players[0].isWinner).toBe(true)
      expect(state.players[1].isWinner).toBe(false)
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import type { BoardState, GameState, MoveHistoryItem } from '@scrabble/engine'
import { createInitialBoard } from '@scrabble/engine'

// In-memory stand-in for the MongoDB `games` collection
const mocks = vi.hoisted(() => {
  const store = new Map<string, Record<string, unknown>>()
  return {
    store,
    updateOne: vi.fn(
      async (
        filter: { gameId: string },
        update: { $set: Record<string, unknown> },
        opts?: { upsert?: boolean }
      ) => {
        if (!store.has(filter.gameId) && opts?.upsert) {
          store.set(filter.gameId, update.$set)
          return { upsertedId: filter.gameId, upsertedCount: 1, matchedCount: 0, modifiedCount: 0 }
        }
        if (store.has(filter.gameId)) {
          store.set(filter.gameId, update.$set)
          return { upsertedId: null, upsertedCount: 0, matchedCount: 1, modifiedCount: 1 }
        }
        return { upsertedId: null, upsertedCount: 0, matchedCount: 0, modifiedCount: 0 }
      }
    )
  }
})

vi.mock('./db.js', () => ({
  getDB: () => ({ collection: () => ({ updateOne: mocks.updateOne }) }),
  connectDB: async () => ({}),
  disconnectDB: async () => {}
}))

import { createApp } from './app.js'

const app = createApp()

function makeBoard(filled: boolean): BoardState {
  const board = createInitialBoard()
  if (filled) {
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        board[r][c] = {
          ...board[r][c],
          isFocused: true,
          tile: { id: `t-${r}-${c}`, letter: 'Q', points: 10, isBlank: false }
        }
      }
    }
  }
  return board
}

function makeCompletedGame(historyLength = 2, gameId = 'game-1'): GameState {
  const history: MoveHistoryItem[] = Array.from({ length: historyLength }, (_, i) => ({
    id: `move-${i}`,
    playerId: 'p1',
    actionType: 'PLAY_WORD' as const,
    words: [{ word: 'CAT', score: 10, isMainWord: true }],
    totalScore: 10,
    placements: [],
    boardState: makeBoard(true),
    playedAt: 1700000000000 + i
  }))

  return {
    gameId,
    roomCode: 'ROOM123',
    status: 'COMPLETED',
    gameMode: 'scorekeeper',
    board: makeBoard(true),
    remainingLetters: {},
    players: [
      { id: 'p1', name: 'Alice', score: 120, turnScores: [120], isWinner: true },
      { id: 'p2', name: 'Bob', score: 80, turnScores: [80] }
    ],
    activePlayerIndex: 0,
    history,
    tileStyle: 'mono'
  }
}

const postGame = (body: unknown) =>
  request(app).post('/api/games').set('Content-Type', 'application/json').send(body as string)

describe('server API', () => {
  beforeEach(() => {
    mocks.store.clear()
    mocks.updateOne.mockClear()
  })

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })

  describe('POST /api/games validation', () => {
    it('rejects a non-JSON body', async () => {
      const res = await request(app)
        .post('/api/games')
        .set('Content-Type', 'text/plain')
        .send('hello')
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/game state object/)
    })

    it('rejects an empty object body', async () => {
      const res = await postGame({})
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Only completed games/)
    })

    it('rejects games that are not COMPLETED', async () => {
      const res = await postGame({ ...makeCompletedGame(), status: 'IN_PROGRESS' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/Only completed games/)
    })

    it('rejects games with no players', async () => {
      const res = await postGame({ ...makeCompletedGame(), players: [] })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/at least one player/)
    })

    it('rejects games missing roomCode', async () => {
      const res = await postGame({ ...makeCompletedGame(), roomCode: '' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/roomCode/)
    })

    it('rejects games missing gameId', async () => {
      const res = await postGame({ ...makeCompletedGame(), gameId: '' })
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/gameId/)
    })

    it('rejects games missing a board', async () => {
      const game = makeCompletedGame() as Record<string, unknown>
      delete game.board
      const res = await postGame(game)
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/board/)
    })

    it('rejects games with a non-array history', async () => {
      const game = makeCompletedGame() as Record<string, unknown>
      game.history = null
      const res = await postGame(game)
      expect(res.status).toBe(400)
      expect(res.body.error).toMatch(/history/)
    })
  })

  describe('POST /api/games persistence', () => {
    it('saves a completed game and strips transient isFocused flags from boards', async () => {
      const res = await postGame(makeCompletedGame(3))

      expect(res.status).toBe(201)
      expect(res.body).toEqual({ id: 'game-1', wasNew: true, message: 'Game saved' })

      const stored = mocks.store.get('game-1') as {
        gameId: string
        roomCode: string
        gameMode: string
        playerCount: number
        winnerIds: string[]
        finalBoard: { isFocused?: boolean; tile: unknown }[][]
        history: { boardState?: { isFocused?: boolean; tile: unknown }[][] }[]
        completedAt: Date
      }

      expect(stored.gameId).toBe('game-1')
      expect(stored.roomCode).toBe('ROOM123')
      expect(stored.gameMode).toBe('scorekeeper')
      expect(stored.playerCount).toBe(2)
      expect(stored.winnerIds).toEqual(['Alice'])
      expect(stored.completedAt).toBeInstanceOf(Date)
      expect(stored.history).toHaveLength(3)

      // Board snapshots are stored in full, but without the UI-only flag
      expect(stored.finalBoard[0][0]).not.toHaveProperty('isFocused')
      expect(stored.finalBoard[0][0].tile).not.toBeNull()
      expect(stored.history[0].boardState?.[0][0]).not.toHaveProperty('isFocused')
      expect(stored.history[0].boardState?.[0][0].tile).not.toBeNull()
    })

    it('upserts on gameId so a duplicate save overwrites instead of duplicating', async () => {
      const first = await postGame(makeCompletedGame(2, 'game-dup'))
      expect(first.status).toBe(201)
      expect(first.body.wasNew).toBe(true)

      const second = await postGame(makeCompletedGame(5, 'game-dup'))
      expect(second.status).toBe(201)
      expect(second.body.wasNew).toBe(false)

      expect(mocks.store.size).toBe(1)
      const stored = mocks.store.get('game-dup') as { history: unknown[] }
      expect(stored.history).toHaveLength(5)
    })

    it('saves a long game whose payload far exceeds the old 100kb default limit', async () => {
      // 100 moves x full 15x15 board snapshot each => multi-MB payload
      const game = makeCompletedGame(100)
      const body = JSON.stringify(game)
      expect(body.length).toBeGreaterThan(100 * 1024)
      expect(body.length).toBeLessThan(10 * 1024 * 1024)

      const res = await request(app)
        .post('/api/games')
        .set('Content-Type', 'application/json')
        .send(body)

      expect(res.status).toBe(201)
      expect(res.body.wasNew).toBe(true)

      const stored = mocks.store.get('game-1') as { history: unknown[] }
      expect(stored.history).toHaveLength(100)
    })

    it('rejects payloads above the 10mb guard limit with 413', async () => {
      const game = makeCompletedGame(400) // ~12MB of board snapshots
      const body = JSON.stringify(game)
      expect(body.length).toBeGreaterThan(10 * 1024 * 1024)

      const res = await request(app)
        .post('/api/games')
        .set('Content-Type', 'application/json')
        .send(body)

      expect(res.status).toBe(413)
      expect(mocks.store.size).toBe(0)
    })
  })
})

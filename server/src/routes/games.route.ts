import { Router, type Request, type Response } from 'express'

import { getDB } from '../db.js'
import type { BoardState, GameState } from '@scrabble/engine'

const router = Router()

// Strip transient UI flags from a stored board snapshot — the client marks
// the focused square on every square of every history entry, which bloats
// long games without adding replay value.
function sanitizeBoard(board: BoardState) {
  return board.map((row) => row.map(({ isFocused, ...rest }) => rest))
}

router.post('/games', async (req: Request, res: Response) => {
  try {
    const game = req.body as GameState

    if (!game || typeof game !== 'object') {
      return res.status(400).json({ error: 'Request body must be a game state object' })
    }

    if (game.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Only completed games can be saved' })
    }

    if (!Array.isArray(game.players) || game.players.length === 0) {
      return res.status(400).json({ error: 'Game must include at least one player' })
    }

    if (!game.roomCode) {
      return res.status(400).json({ error: 'Game must include a roomCode' })
    }

    if (!game.gameId) {
      return res.status(400).json({ error: 'Game must include a gameId' })
    }

    if (!Array.isArray(game.board) || game.board.length === 0) {
      return res.status(400).json({ error: 'Game must include a board' })
    }

    if (!Array.isArray(game.history)) {
      return res.status(400).json({ error: 'Game must include a history array' })
    }

    const db = getDB()
    const collection = db.collection('games')

    const finalBoard = sanitizeBoard(game.board)
    const history = game.history.map((item) =>
      item.boardState ? { ...item, boardState: sanitizeBoard(item.boardState) } : item
    )

    const document = {
      gameId: game.gameId,
      roomCode: game.roomCode,
      gameMode: game.gameMode,
      players: game.players,
      history,
      finalBoard,
      playerCount: game.players.length,
      winnerIds: game.players.filter((p) => p.isWinner).map((p) => p.name),
      completedAt: new Date()
    }

    // Upsert on gameId — a retried/duplicate save overwrites the same
    // document instead of creating a second one.
    const result = await collection.updateOne(
      { gameId: game.gameId },
      { $set: document },
      { upsert: true }
    )

    return res.status(201).json({
      id: result.upsertedId ?? game.gameId,
      wasNew: result.upsertedCount > 0,
      message: 'Game saved'
    })
  } catch (err) {
    console.error('Failed to save game:', err)
    return res.status(500).json({ error: 'Failed to save game' })
  }
})

export default router

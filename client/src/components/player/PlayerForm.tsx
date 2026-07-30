import React, { useState } from 'react'
import { UserPlus, Trash2, GripVertical } from 'lucide-react'

import { useGame } from 'hooks'

const MAX_PLAYERS = 4

export const PlayerForm: React.FC = () => {
  const { state, dispatch } = useGame()
  const [playerName, setPlayerName] = useState('')
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)

  const isFull = state.players.length >= MAX_PLAYERS

  const handleAddPlayer = (e: React.SubmitEvent) => {
    e.preventDefault()
    if (!playerName.trim() || isFull) return

    dispatch({
      type: 'ADD_PLAYER',
      name: playerName.trim()
      // isHost: state.players.length === 0
    })

    setPlayerName('')
  }

  const handleRemovePlayer = (playerId: string) => {
    dispatch({ type: 'REMOVE_PLAYER', playerId } as any)
  }

  // --- Drag and Drop Handlers ---
  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx)
  }

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, targetIdx: number) => {
    e.preventDefault()
    if (draggedIdx === null || draggedIdx === targetIdx) return

    const updatedPlayers = [...state.players]
    const [draggedPlayer] = updatedPlayers.splice(draggedIdx, 1)
    updatedPlayers.splice(targetIdx, 0, draggedPlayer)

    // Update host tag if position 0 changes
    const reorderedPlayers = updatedPlayers.map((player, index) => ({
      ...player,
      isHost: index === 0
    }))

    setDraggedIdx(targetIdx)
    dispatch({ type: 'REORDER_PLAYERS', players: reorderedPlayers } as any)
  }

  const handleDragEnd = () => {
    setDraggedIdx(null)
  }

  return (
    <>
      {/* Add Player Form */}
      <form onSubmit={handleAddPlayer} className="mb-6 flex gap-2">
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder={isFull ? 'Max player limit reached' : 'Enter player name...'}
          disabled={isFull}
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:disabled:bg-slate-800/50 dark:disabled:text-slate-500"
          maxLength={20}
        />
        <button
          type="submit"
          disabled={!playerName.trim() || isFull}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50 disabled:opacity-50 hover:disabled:bg-blue-600/50 cursor-pointer"
        >
          <UserPlus size={16} />
          Add
        </button>
      </form>

      {/* Error Message */}
      {state.errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
          {state.errorMessage}
        </div>
      )}

      {/* Player List */}
      <div className="mb-6 space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Players ({state.players.length}/{MAX_PLAYERS})
        </h2>

        {state.players.length === 0 ? (
          <p className="py-4 text-center text-xs italic text-slate-400">No players added yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {state.players.map((player, idx) => (
              <li
                key={player.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`group flex items-center justify-between py-2.5 text-sm transition-colors ${
                  draggedIdx === idx ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 active:cursor-grabbing">
                    <GripVertical size={16} />
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {idx + 1}. {player.name}
                    {player.isHost && (
                      <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Host
                      </span>
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemovePlayer(player.id)}
                  aria-label={`Remove ${player.name}`}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

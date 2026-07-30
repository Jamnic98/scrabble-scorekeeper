import React from 'react'
import { Play } from 'lucide-react'

import { PlayerForm } from 'components'
import { useGame } from 'hooks'

export const PlayerEntry: React.FC = () => {
  const { state, dispatch } = useGame()

  const handleStartGame = () => {
    dispatch({ type: 'START_GAME' })
  }

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Scrabble Scorekeeper
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Add at least 2 players to start the game.
        </p>

        <PlayerForm />

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          disabled={state.players.length < 2}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          <Play size={18} />
          Start Game
        </button>
      </div>
    </div>
  )
}

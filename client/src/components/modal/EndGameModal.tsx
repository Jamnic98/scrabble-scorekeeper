import React, { useEffect, useState } from 'react'

import type { Player, Tile as TileModel } from '@scrabble/engine'
import { Rack } from 'components'

interface EndGameModalProps {
  isOpen: boolean
  players: Player[]
  onClose: () => void
  onSubmit: (finalRacks: Array<{ playerId: string; unplayedTiles: TileModel[] }>) => void
}

const EndGameModal: React.FC<EndGameModalProps> = ({ isOpen, players, onClose, onSubmit }) => {
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0)
  const [playerRacks, setPlayerRacks] = useState<Record<string, TileModel[]>>({})

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

      e.preventDefault()
      handleNext()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentPlayerIdx, playerRacks, players])

  if (!isOpen || players.length === 0) return null

  const currentPlayer = players[currentPlayerIdx]
  const currentRack = playerRacks[currentPlayer.id] ?? []

  const handleRackChange = (updatedTiles: TileModel[]) => {
    setPlayerRacks((prev) => ({
      ...prev,
      [currentPlayer.id]: updatedTiles
    }))
  }

  const handleNext = () => {
    if (currentPlayerIdx < players.length - 1) {
      setCurrentPlayerIdx((prev) => prev + 1)
    } else {
      // Format final racks payload
      const finalRacks = players.map((p) => ({
        playerId: String(p.id),
        unplayedTiles: playerRacks[p.id] ?? []
      }))

      onSubmit(finalRacks)
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentPlayerIdx > 0) {
      setCurrentPlayerIdx((prev) => prev - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border-4 border-black bg-amber-50 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 text-center">
          <h2 className="text-xl font-black uppercase tracking-wider text-black">End Game</h2>
          <p className="text-sm font-semibold text-neutral-600">
            Player {currentPlayerIdx + 1} of {players.length}:{' '}
            <span className="text-amber-800 font-bold">{currentPlayer.name}</span>
          </p>
        </div>

        {/* Rack Container */}
        <div className="my-6 flex flex-col items-center gap-3">
          <Rack
            tiles={currentRack}
            editable
            maxTiles={7}
            onChange={handleRackChange}
            reservedTiles={Object.entries(playerRacks)
              .filter(([playerId]) => playerId !== currentPlayer.id)
              .flatMap(([, tiles]) => tiles)}
            className="w-full"
          />
          <p className="text-xs text-neutral-500 text-center font-medium">
            Type letters on your keyboard{' '}
            <kbd className="px-1 bg-neutral-200 rounded border">A-Z</kbd> (or{' '}
            <kbd className="px-1 bg-neutral-200 rounded border">Space</kbd> for Blank). Click a tile
            or press <kbd className="px-1 bg-neutral-200 rounded border">Backspace</kbd> to delete.
          </p>
        </div>

        {/* Quick Actions */}
        {/* <div className="mb-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => handleRackChange([])}
            className="rounded border border-black bg-neutral-200 px-3 py-1 text-xs font-bold uppercase transition hover:bg-neutral-300 cursor-pointer"
          >
            Clear Rack (0 tiles left)
          </button>
        </div> */}

        {/* Footer Navigation Buttons */}
        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={currentPlayerIdx === 0 ? onClose : handlePrevious}
            className="w-1/2 rounded-md border-2 border-black bg-neutral-200 py-2 text-sm font-bold uppercase tracking-wide transition hover:bg-neutral-300 cursor-pointer"
          >
            {currentPlayerIdx === 0 ? 'Cancel' : 'Back'}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="w-1/2 rounded-md border-2 border-black bg-amber-400 py-2 text-sm font-bold uppercase tracking-wide transition hover:bg-amber-500 cursor-pointer"
          >
            {currentPlayerIdx === players.length - 1 ? 'Finish & End Game' : 'Next Player'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EndGameModal

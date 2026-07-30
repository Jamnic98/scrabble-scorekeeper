import React from 'react'
import { ArrowRight, ArrowDown, SkipForward, Undo2 } from 'lucide-react'

import { LETTER_DISTRIBUTION, type WordDirection } from '@scrabble/engine'
import { Tile } from 'components'
import { useGame } from 'hooks'
import { Coords } from 'types/global'

export interface ControlsProps {
  wordDirection: WordDirection
  setWordDirection: (wordDirection: WordDirection) => void
  activeSquareCoords: Coords | null
  onUndo: () => void
  onSkip: () => void
}

export const Controls: React.FC<ControlsProps> = ({
  wordDirection,
  setWordDirection,
  activeSquareCoords,
  onUndo,
  onSkip
}) => {
  const { state } = useGame()
  // Pull remainingLetters directly from game context state
  const { placements = [], history = [], remainingLetters = {} } = state || {}

  const hasPendingPlacements = placements.length > 0
  const turnCount = history.length

  const handleDownArrow = () => setWordDirection?.('vertical')
  const handleRightArrow = () => setWordDirection?.('horizontal')

  const handleUndo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onUndo()
  }

  const handleSkip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onSkip()
  }

  return (
    <div className="flex h-146.25 w-54 flex-col justify-between border-b-8 border-r-8 border-t-8 border-black bg-neutral-400 p-2 shadow-inner">
      {/* Direction Controls */}
      <div id="arrows" className="flex flex-row gap-1">
        <button
          type="button"
          onClick={handleDownArrow}
          disabled={!activeSquareCoords || hasPendingPlacements || wordDirection === 'vertical'}
          className="flex w-1/2 cursor-pointer items-center justify-center rounded-md border-2 border-black bg-[rgb(255,218,163)] py-2.5 transition hover:brightness-95 disabled:cursor-default disabled:opacity-30 disabled:hover:brightness-100"
        >
          <ArrowDown size={18} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={handleRightArrow}
          disabled={!activeSquareCoords || hasPendingPlacements || wordDirection === 'horizontal'}
          className="flex w-1/2 cursor-pointer items-center justify-center rounded-md border-2 border-black bg-[rgb(255,218,163)] py-2.5 transition hover:brightness-95 disabled:cursor-default disabled:opacity-30 disabled:hover:brightness-100"
        >
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Remaining Tile Count Display */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-2 overflow-y-auto p-1">
        {Object.entries(remainingLetters).map(([letter, count]) => (
          <div key={letter} className="flex flex-col items-center justify-center">
            <Tile
              tile={{
                id: letter,
                letter,
                points: LETTER_DISTRIBUTION[letter].value,
                isBlank: false
              }}
              unavailable={count === 0}
            />
            <span className={`text-xs font-bold ${count === 0 ? 'opacity-30' : 'text-black'}`}>
              {count}
            </span>
          </div>
        ))}
      </div>

      {/* Action Controls */}
      <div className="flex flex-row gap-1">
        <button
          id="undo-button"
          type="button"
          onClick={handleUndo}
          disabled={hasPendingPlacements || turnCount === 1}
          className="flex w-1/2 cursor-pointer items-center justify-center gap-1 rounded-md border-2 border-black bg-[rgb(255,218,163)] py-2.5 text-sm font-bold uppercase tracking-wide transition hover:brightness-95 disabled:cursor-default disabled:opacity-30 disabled:hover:brightness-100"
        >
          <Undo2 size={16} strokeWidth={2.5} />
          Undo
        </button>

        <button
          id="skip-button"
          type="button"
          onClick={handleSkip}
          disabled={hasPendingPlacements}
          className="flex w-1/2 cursor-pointer items-center justify-center gap-1 rounded-md border-2 border-black bg-[rgb(255,218,163)] py-2.5 text-sm font-bold uppercase tracking-wide transition hover:brightness-95 disabled:cursor-default disabled:opacity-30 disabled:hover:brightness-100"
        >
          <SkipForward size={16} strokeWidth={2.5} />
          Skip
        </button>
      </div>
    </div>
  )
}

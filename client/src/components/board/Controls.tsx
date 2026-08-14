import React, { useState } from 'react'
import { ArrowRight, ArrowDown, SkipForward, Undo2, SendHorizontal } from 'lucide-react'

import { LETTER_DISTRIBUTION, type Tile as TileType, type WordDirection } from '@scrabble/engine'
import { EndGameModal, Tile } from 'components'
import { useGame } from 'hooks'
import { Coords } from 'types/global'

export function parseTilesFromInput(input: string): TileType[] {
  // Strip whitespace delimiters or commas, keep raw letters / spaces
  const rawChars = input.trim().toUpperCase().split('')

  const tiles: TileType[] = []

  for (let i = 0; i < rawChars.length; i++) {
    const char = rawChars[i]
    if (!char) continue

    const isBlank = char === ' ' || char === '?' || char === '_'
    const letter = isBlank ? ' ' : char

    // Fallback to LETTER_DISTRIBUTION or 0 if unknown
    const dist = LETTER_DISTRIBUTION[letter]
    const points = isBlank ? 0 : (dist?.value ?? 0)

    tiles.push({
      id: `end-tile-${letter}-${i}-${Date.now()}`,
      letter,
      points,
      isBlank
    })
  }

  console.log('[End Game Debug] Parsed input:', input, '=> Tiles:', tiles)
  return tiles
}

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
  const { state, dispatch } = useGame()
  const { placements = [], history = [], remainingLetters = {} } = state || {}
  const [isEndGameOpen, setIsEndGameOpen] = useState(false)

  const hasPendingPlacements = placements.length > 0
  const turnCount = history.length

  const isGameOver = state.status === 'COMPLETED' || state.status === 'END_GAME_PROMPT'
  const isDownArrowButtonDisabled =
    isGameOver || !activeSquareCoords || hasPendingPlacements || wordDirection === 'vertical'
  const isRightArrowButtonDisabled =
    isGameOver || !activeSquareCoords || hasPendingPlacements || wordDirection === 'horizontal'
  const isUndoDisabled = isGameOver || (!hasPendingPlacements && turnCount <= 1)
  const isSkipDisabled = isGameOver || hasPendingPlacements
  const isEndGameDisabled = isGameOver || hasPendingPlacements

  // Triggered by the "End Game" icon button
  const handleOpenEndGame = () => {
    if (window.confirm('Are you sure you want to end the game?')) {
      dispatch({ type: 'INITIATE_END_GAME' })
      setIsEndGameOpen(true)
    }
  }

  const handleDownArrow = () => setWordDirection?.('vertical')
  const handleRightArrow = () => setWordDirection?.('horizontal')

  const handleUndo = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (hasPendingPlacements) {
      // 1. Recall currently typed/staged tiles back to rack
      dispatch({ type: 'CLEAR_PLACEMENTS' })
      dispatch({ type: 'SELECT_SQUARE', coords: null })
      dispatch({ type: 'SET_WORD_DIRECTION', direction: null })
    } else {
      // 2. Otherwise trigger parent onUndo to revert last committed move
      onUndo()
    }
  }

  const handleSkip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    onSkip()
  }

  return (
    <div className="flex h-146.5 w-54 flex-col justify-between border-b-8 border-r-8 border-t-8 border-black bg-neutral-400 p-2 shadow-inner">
      {/* Direction Controls */}
      <div id="arrows" className="flex flex-row gap-1">
        <button
          type="button"
          onClick={handleDownArrow}
          disabled={isDownArrowButtonDisabled}
          className="flex w-1/2 cursor-pointer items-center justify-center rounded-md border-2 border-black bg-[rgb(255,218,163)] py-2.5 transition hover:brightness-95 disabled:cursor-default disabled:opacity-30 disabled:hover:brightness-100"
        >
          <ArrowDown size={18} strokeWidth={2.5} />
        </button>

        <button
          type="button"
          onClick={handleRightArrow}
          disabled={isRightArrowButtonDisabled}
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
                points: LETTER_DISTRIBUTION[letter]?.value ?? 0,
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
          disabled={isUndoDisabled}
          title={hasPendingPlacements ? 'Recall typed tiles' : 'Undo last move'}
          aria-label="Undo move"
          className="flex w-1/3 cursor-pointer items-center justify-center gap-1 rounded-md border-2 border-black bg-[rgb(255,218,163)] py-2.5 text-sm font-bold uppercase tracking-wide transition hover:brightness-95 disabled:cursor-default disabled:opacity-30 disabled:hover:brightness-100"
        >
          <Undo2 size={16} strokeWidth={2.5} />
          {/* UNDO */}
        </button>

        <button
          id="skip-button"
          type="button"
          onClick={handleSkip}
          disabled={isSkipDisabled}
          title="Skip turn"
          aria-label="Skip turn"
          className="flex w-1/3 cursor-pointer items-center justify-center gap-1 rounded-md border-2 border-black bg-[rgb(255,218,163)] py-2.5 text-sm font-bold uppercase tracking-wide transition hover:brightness-95 disabled:cursor-default disabled:opacity-30 disabled:hover:brightness-100"
        >
          <SkipForward size={16} strokeWidth={2.5} />
          {/* SKIP */}
        </button>

        <button
          id="end-game-button"
          type="button"
          onClick={handleOpenEndGame}
          disabled={isEndGameDisabled}
          title="End game"
          aria-label="End game"
          className="flex w-1/3 cursor-pointer items-center justify-center gap-1 rounded-md border-2 border-black bg-[rgb(255,218,163)] py-2.5 text-sm font-bold uppercase tracking-wide transition hover:brightness-95 disabled:cursor-default disabled:opacity-30 disabled:hover:brightness-100"
        >
          <SendHorizontal size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* 🏁 END GAME MODAL: Interactive rack prompt replacement */}
      <EndGameModal
        isOpen={isEndGameOpen}
        players={state.players}
        onClose={() => {
          dispatch({ type: 'CANCEL_END_GAME' })
          setIsEndGameOpen(false)
        }}
        onFinish={() => {
          setIsEndGameOpen(false)
        }}
        onSubmit={(finalRacks) => {
          const finishingPlayer = state.players[state.activePlayerIndex]
          dispatch({ type: 'END_GAME', finalRacks, finishingPlayerId: finishingPlayer?.id })
        }}
      />
    </div>
  )
}

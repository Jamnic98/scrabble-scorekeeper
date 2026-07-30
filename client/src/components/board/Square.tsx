import React from 'react'
import { Star } from 'lucide-react'

import type { Square as SquareType, WordDirection } from '@scrabble/engine'
import { Arrow, Tile } from 'components'
import { type Coords } from 'types/global'
import { useGame } from 'hooks'

const baseStyle =
  'relative border-[0.5px] border-solid border-gray-400 w-[38px] h-[38px] p-0 outline-none flex items-center justify-center'

const getFlashClass = (scoreMultiplier?: string): string => {
  switch (scoreMultiplier?.toLowerCase()) {
    case 'tw':
      return 'animate-tw-color-change'
    case 'tl':
      return 'animate-tl-color-change'
    case 'dw':
    case 'star':
      return 'animate-dw-color-change'
    case 'dl':
      return 'animate-dl-color-change'
    default:
      return 'animate-color-change'
  }
}

const getMultiplierBg = (scoreMultiplier?: string): string => {
  switch (scoreMultiplier?.toLowerCase()) {
    case 'tw':
      return 'bg-[rgb(255,0,0)]'
    case 'tl':
      return 'bg-[rgb(0,0,255)]'
    case 'dw':
    case 'star':
      return 'bg-[rgb(255,192,203)]'
    case 'dl':
      return 'bg-sky-200'
    default:
      return 'bg-white'
  }
}

export interface SquareProps {
  square: SquareType
  coords: Coords
  wordDirection?: WordDirection
  setWordDirection?: (dir: WordDirection) => void
  onSelectSquare?: (coords: Coords) => void
}

export const Square: React.FC<SquareProps> = ({
  square,
  coords,
  wordDirection,
  onSelectSquare
}) => {
  const {
    state: { placements }
  } = useGame()
  // Driven directly by engine state
  const isActive = square.isFocused

  const scoreMultiplier = square?.scoreMultiplier ?? ''
  const isStarSquare = scoreMultiplier.toLowerCase() === 'star'

  const flashClass = isActive ? getFlashClass(scoreMultiplier) : ''
  const bgClass = flashClass || getMultiplierBg(scoreMultiplier)

  const hasTile = square?.tile !== null && square?.tile !== undefined

  const handleMouseDown = () => {
    // Only block if the square already has a tile
    if (hasTile || placements.length > 0) return

    // Trigger the selection update
    onSelectSquare?.(coords)
  }

  return (
    <button
      type="button"
      tabIndex={-1}
      className={`
        ${baseStyle}
        ${bgClass}
        ${isActive ? 'focused' : 'unfocused'} 
        ${hasTile ? 'cursor-default' : 'cursor-pointer'} 
      `}
      onMouseDown={handleMouseDown}
    >
      <Arrow square={square} wordDirection={wordDirection || null} />

      {/* Render tile if placed, using w-full h-full to automatically fit the square */}
      {hasTile && square.tile ? (
        <Tile tile={square.tile} isBlank={square.tile.isBlank} />
      ) : (
        isStarSquare && <Star size={28} className="fill-black" strokeWidth={1} />
      )}
    </button>
  )
}

export default Square

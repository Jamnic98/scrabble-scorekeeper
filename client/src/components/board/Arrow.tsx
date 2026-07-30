import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import type { Square, WordDirection } from '@scrabble/engine'
import { useGame } from 'hooks'

interface ArrowProps {
  square: Square
  wordDirection: WordDirection
  /** Optional custom size, defaults to 16px */
  size?: number
}

export const Arrow: React.FC<ArrowProps> = ({ square, wordDirection, size = 16 }) => {
  const {
    state: { activeSquareCoords }
  } = useGame()

  // Only render when the square is actively focused and doesn't contain a letter
  const isEmpty = !square.tile || square.tile.letter === ''
  if (!square.isFocused || !isEmpty || !wordDirection) {
    return null
  }

  const IconComponent = wordDirection === 'horizontal' ? ChevronRight : ChevronDown

  const isCenter =
    activeSquareCoords && activeSquareCoords.row === 7 && activeSquareCoords.col === 7

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${isCenter ? 'text-white' : 'text-black'}`}
      aria-hidden="true"
    >
      <IconComponent size={size} strokeWidth={4} />
    </div>
  )
}

export default Arrow

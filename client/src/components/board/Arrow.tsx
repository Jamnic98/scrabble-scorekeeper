import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import type { Square, WordDirection } from '@scrabble/engine'

interface ArrowProps {
  square: Square
  wordDirection: WordDirection
  /** Optional custom size, defaults to 18px */
  size?: number
}

export const Arrow: React.FC<ArrowProps> = ({ square, wordDirection, size = 18 }) => {
  // Only render when the square is actively focused and doesn't contain a letter
  const isEmpty = !square.tile || square.tile.letter === ''
  if (!square.isFocused || !isEmpty || !wordDirection) {
    return null
  }

  const IconComponent = wordDirection === 'horizontal' ? ChevronRight : ChevronDown

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none text-blue-600 dark:text-blue-400 animate-pulse drop-shadow-sm"
      aria-hidden="true"
    >
      <IconComponent size={size} strokeWidth={2.5} />
    </div>
  )
}

export default Arrow

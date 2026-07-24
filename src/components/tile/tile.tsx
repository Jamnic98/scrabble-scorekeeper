import React from 'react'

import { getLetterValue } from 'utils'

export interface TileProps {
  letter: string
  isBlank?: boolean
  unavailable?: boolean
  style?: TileStyle
}

type TileStyle = 'mono' | 'serif' | 'sans'

const fontStyles: Record<TileStyle, string> = {
  mono: 'font-mono font-bold',
  serif: 'font-serif font-bold',
  sans: 'font-sans font-bold'
}

const baseStyle =
  'flex items-center w-9.5 h-9.5 -top-px -left-px relative border-black rounded-sm border-2 box-border shadow-[inset_-1px_-1px_1px_2px_rgba(46,46,46,0.22)]'

export const Tile: React.FC<TileProps> = ({
  letter = '',
  isBlank = false,
  unavailable = false,
  style = 'sans'
}) => (
  <div
    className={`${baseStyle} ${unavailable ? 'bg-[rgb(255,218,163)]/30 border-black/40' : 'bg-[rgb(255,218,163)] border-black'}`}
    data-testid="application-tile"
  >
    <div
      className={`${fontStyles[style]} text-center tracking-normal ${unavailable ? 'text-black/40' : 'text-black'}`}
    >
      {/* display letter */}
      <span className="text-2xl absolute left-1.5 top-4 leading-0">{letter.toUpperCase()}</span>
      {/* display digit */}
      <span className="absolute text-[9px] bottom-1 right-px leading-0 font-sans">
        {isBlank ? null : getLetterValue(letter)}
      </span>
    </div>
  </div>
)

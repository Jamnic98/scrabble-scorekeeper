import React from 'react'

import { LETTER_DISTRIBUTION, Tile as TileModel } from '@scrabble/engine'

type TileStyle = 'mono' | 'serif' | 'sans'

export interface TileProps {
  /** Optional full Tile object from state */
  tile?: TileModel
  isBlank?: boolean
  /** Render style with reduced opacity */
  unavailable?: boolean
  /** Font family styling option */
  style?: TileStyle
  /** Click handler for selecting/moving tiles */
  onClick?: () => void
}

const fontStyles: Record<TileStyle, string> = {
  mono: 'font-mono font-bold left-[8px] top-[18px]',
  sans: 'font-sans font-bold left-[6px] top-[15px]',
  serif: 'font-serif font-bold left-[6px] top-[15px]'
}

const baseStyle =
  'flex items-center w-9.5 h-9.5 -top-px -left-px relative rounded-sm border-2 box-border shadow-[inset_-1px_-1px_1px_2px_rgba(46,46,46,0.22)] select-none transition-opacity'

export const Tile: React.FC<TileProps> = ({
  tile,
  isBlank: isBlankProp,
  unavailable = false,
  style = 'mono',
  onClick
}) => {
  // Derive values prioritizing the `tile` object if passed
  const char = (tile?.letter ?? '').trim()
  const isBlankTile = tile?.isBlank ?? isBlankProp ?? char === ''

  // Look up default point value from distribution if not explicitly passed
  const lookupKey = char.toLowerCase()
  const derivedPoints = tile?.points ?? LETTER_DISTRIBUTION[lookupKey]?.value ?? 0

  return (
    <div
      onClick={onClick}
      data-testid="application-tile"
      className={`
        ${baseStyle}
        ${unavailable ? 'bg-[rgb(255,218,163)]/30 border-black/40' : 'bg-[rgb(255,218,163)] border-black'}
        ${onClick ? 'cursor-pointer hover:brightness-105 active:scale-95' : ''}
      `}
    >
      <div
        className={`text-center tracking-normal ${unavailable ? 'text-black/40' : 'text-black'}`}
      >
        {/* Display letter */}
        <span className={`${fontStyles[style]} text-2xl absolute leading-none uppercase`}>
          {char}
        </span>

        {/* Display tile point value (hidden for blank tiles) */}
        {!isBlankTile && (
          <span className="absolute text-[9px] bottom-1.5 right-px leading-none font-sans font-bold">
            {derivedPoints}
          </span>
        )}
      </div>
    </div>
  )
}

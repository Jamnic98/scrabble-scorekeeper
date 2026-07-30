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
  /** Custom additional styling / dimensions override (e.g., 'w-full h-full' or 'w-8 h-8') */
  className?: string
  /** Click handler for selecting/moving tiles */
  onClick?: () => void
}

const fontStyles: Record<TileStyle, string> = {
  mono: 'font-mono font-bold',
  sans: 'font-sans font-bold',
  serif: 'font-serif font-bold'
}

const baseStyle =
  'z-10 flex shrink-0 items-center justify-center relative rounded-sm border-2 box-border shadow-[inset_-1px_-1px_1px_2px_rgba(46,46,46,0.22)] select-none transition-opacity'

export const Tile: React.FC<TileProps> = ({
  tile,
  isBlank: isBlankProp,
  unavailable = false,
  style = 'mono',
  className = 'w-9.5 h-9.5', // Default stand-alone size
  onClick
}) => {
  const char = (tile?.letter ?? '').trim()
  const isBlankTile = tile?.isBlank ?? isBlankProp ?? char === ''

  const lookupKey = char.toLowerCase()
  const derivedPoints = tile?.points ?? LETTER_DISTRIBUTION[lookupKey]?.value ?? 0

  return (
    <div
      onClick={onClick}
      data-testid="application-tile"
      className={`
        ${baseStyle}
        ${className}
        ${unavailable ? 'bg-[rgb(255,218,163)]/30 border-black/40' : 'bg-[rgb(255,218,163)] border-black'}
        ${onClick ? 'cursor-pointer hover:brightness-105 active:scale-95' : ''}
      `}
    >
      <div
        className={`flex w-full h-full items-center justify-center relative ${unavailable ? 'text-black/40' : 'text-black'}`}
      >
        {/* Letter display centered inside tile */}
        <span className={`${fontStyles[style]} text-2xl leading-none uppercase`}>{char}</span>

        {/* Point value on bottom right */}
        {!isBlankTile && (
          <span className="absolute text-[8px] bottom-0.5 right-0.5 leading-none font-sans font-bold select-none">
            {derivedPoints}
          </span>
        )}
      </div>
    </div>
  )
}

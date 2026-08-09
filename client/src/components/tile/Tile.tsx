import React from 'react'

import { LETTER_DISTRIBUTION, Tile as TileModel, TileStyle } from '@scrabble/engine'
import { useGame } from 'hooks'

export interface TileProps {
  tile?: TileModel
  isBlank?: boolean
  unavailable?: boolean
  style?: TileStyle
  className?: string
  onClick?: () => void
}

const fontStyles: Record<TileStyle, string> = {
  mono: 'font-mono font-bold top-[5px] left-[10px]',
  serif: 'font-serif font-bold top-[2px] left-[7px]',
  sans: 'font-sans font-bold top-[3px] left-[7px]'
}

const baseStyle =
  'z-10 flex shrink-0 items-center justify-center relative rounded-sm border-2 box-border shadow-[inset_-1px_-1px_1px_1.2px_rgba(46,46,46,0.25)]'

export const Tile: React.FC<TileProps> = ({
  tile,
  isBlank: isBlankProp,
  unavailable = false,
  style,
  className = 'w-9.5 h-9.5',
  onClick
}) => {
  const { state } = useGame()
  const resolvedStyle: TileStyle = style ?? state.tileStyle ?? 'mono'

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
        <span className={`${fontStyles[resolvedStyle]} text-2xl leading-none uppercase absolute`}>
          {char}
        </span>

        {!isBlankTile && (
          <span className="absolute text-[8px] bottom-px right-px leading-none font-sans font-bold select-none">
            {derivedPoints}
          </span>
        )}
      </div>
    </div>
  )
}

export default Tile

import React from 'react'
import type { Tile as TileType } from '@scrabble/engine'

export interface TileProps {
  tile?: TileType | null
  letter?: string
  points?: number
  isBlank?: boolean
  unavailable?: boolean
  className?: string
}

export const Tile: React.FC<TileProps> = ({
  tile,
  letter: letterProp = '',
  points: pointsProp = 0,
  isBlank: isBlankProp = false,
  unavailable = false,
  className = ''
}) => {
  // 1. Fallback order: object prop -> individual direct prop -> empty string
  const rawLetter = tile?.letter ?? letterProp ?? ''

  // 2. Transform to uppercase in JS so RTL DOM node matches uppercase queries
  const displayLetter = rawLetter.toUpperCase()

  const points = tile?.points ?? pointsProp ?? 0
  const isBlank = tile?.isBlank ?? isBlankProp ?? false

  return (
    <div
      data-testid="application-tile"
      className={`
        z-10 flex shrink-0 items-center justify-center relative rounded-sm border-2 box-border shadow-[inset_-1px_-1px_1px_2px_rgba(46,46,46,0.22)] select-none transition-opacity
        w-9.5 h-9.5
        bg-[rgb(255,218,163)] border-black
        ${unavailable ? 'opacity-30' : 'opacity-100'}
        ${className}
      `}
    >
      <div className="flex w-full h-full items-center justify-center relative text-black">
        <span className="font-mono font-bold text-2xl leading-none uppercase">
          {isBlank ? '' : displayLetter}
        </span>

        {!isBlank && (
          <span className="absolute text-[8px] bottom-0.5 right-0.5 leading-none font-sans font-bold select-none">
            {points}
          </span>
        )}
      </div>
    </div>
  )
}

export default Tile

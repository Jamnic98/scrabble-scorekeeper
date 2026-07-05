import React from 'react'
import { getLetterValue } from '../../utils/helpers'

export interface TileProps {
  letter: string
  isBlank?: boolean
  style?: TileStyle
}

type TileStyle = 'mono' | 'serif' | 'sans'

const fontStyles: Record<TileStyle, string> = {
  mono: 'font-mono',
  serif: 'font-serif font-bold',
  sans: 'font-sans font-bold',
}

export const Tile: React.FC<TileProps> = ({ letter = '', isBlank = false, style = 'sans' }) => {
  return (
    <div
      className="flex items-center w-9.5 h-9.5 -top-px -left-px relative border-black rounded-sm border-2 box-border bg-[rgb(255,218,163)] shadow-[inset_-1px_-1px_1px_2px_rgba(46,46,46,0.12)]"
      data-testid="application-tile"
    >
      <div className={`${fontStyles[style]} text-center tracking-normal`}>
        {/* display letter */}
        <span className="text-2xl absolute left-1.5 top-4 leading-0">{letter.toUpperCase()}</span>
        {/* display digit */}
        <span className="absolute text-[8px] bottom-1 right-px leading-0">
          {isBlank ? null : getLetterValue(letter)}
        </span>
      </div>
    </div>
  )
}

import React from 'react'
import { getLetterValue } from '../../utils/helpers'
import './tile.css'

export interface TileProps {
  letter: string
  isBlank: boolean
}

export const Tile: React.FC<TileProps> = ({ letter, isBlank }) =>
  letter !== '' ? (
    <div className='tile'>
      <div className='tile-letter'>{letter.toUpperCase()}</div>
      <div className='tile-value'>
        {/* display digit */}
        {isBlank ? null : getLetterValue(letter)}
      </div>
    </div>
  ) : null

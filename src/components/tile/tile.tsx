import React from 'react'
import { getLetterValue } from '../../utils/helpers'
import styles from './tile.module.css'

export interface TileProps {
  letter: string
  isBlank: boolean
}

export const Tile: React.FC<TileProps> = ({ letter = '', isBlank = true }) => {
  return (
    <div className={styles.tile} data-testid='application-tile'>
      {/* display letter */}
      <span className={styles.letter}>{letter.toUpperCase()}</span>
      {/* display digit */}
      <span className={styles.value}>
        {isBlank ? null : getLetterValue(letter)}
      </span>
    </div>
  )
}

import React from 'react'
import { Tile } from '../tile'
import './board-square.css'

export interface BoardSquareProps {
  coords: [x: number, y: number]
  square: any
  activeSquareCoords: any
  setActiveSquareCoords: any
  wordDirection: any
  setWordDirection: any
  letters: any
  boardState: any
}

export const BoardSquare: React.FC<BoardSquareProps> = ({
  coords,
  square,
  activeSquareCoords,
  setActiveSquareCoords,
  wordDirection,
  setWordDirection,
  letters,
  boardState
}) => {
  const setArrow = () => {
    if (wordDirection === '') {
      return null
    } else if (square.letter === '' && square.isFocused) {
      return <span className={`${wordDirection} arrow small`}></span>
    }
  }

  return (
    <button
      tabIndex={-1}
      className={`
        ${square.scoreMultiplier} 
        ${square.isFocused ? 'focused' : 'unfocused'} 
        ${square.letter === '' ? 'empty' : 'occupied'} board-square`}
      onMouseDown={() => {
        if (letters.length === 0) {
          if (
            coords[0] !== activeSquareCoords[0] ||
            coords[1] !== activeSquareCoords[1]
          ) {
            setWordDirection('')
          }
          if (boardState[coords[1]][coords[0]].letter === '') {
            setActiveSquareCoords(coords)
          }
        }
      }}
    >
      {setArrow()}
      {square.letter !== '' && (
        <Tile letter={square.letter} isBlank={square.isBlank} />
      )}
    </button>
  )
}

import { ChevronDown, ChevronRight } from 'lucide-react'

import { Tile } from 'components'

import './board-square.css'

const baseStyle = 'relative border-1 border-solid border-gray-400'

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

const BoardSquare: React.FC<BoardSquareProps> = ({
  coords,
  square,
  activeSquareCoords,
  setActiveSquareCoords,
  wordDirection,
  setWordDirection,
  letters,
  boardState,
}) => {
  const setArrow = () => {
    if (wordDirection === '') {
      return null
    } else if (square.letter === '' && square.isFocused) {
      if (wordDirection === 'right') {
        return (
          <span className="flex justify-center">
            <ChevronRight size={20} />
          </span>
        )
      } else {
        return (
          <span className="flex justify-center ">
            <ChevronDown size={20} />
          </span>
        )
      }
    }
  }

  return (
    <button
      tabIndex={-1}
      className={`
        ${baseStyle} 
        ${square.scoreMultiplier} 
        ${square.isFocused ? 'focused' : 'unfocused'} 
        ${square.letter === '' ? 'empty' : 'occupied'} board-square`}
      onMouseDown={() => {
        if (letters.length === 0) {
          if (coords[0] !== activeSquareCoords[0] || coords[1] !== activeSquareCoords[1]) {
            setWordDirection('')
          }
          if (boardState[coords[1]][coords[0]].letter === '') {
            setActiveSquareCoords(coords)
          }
        }
      }}
    >
      {setArrow()}
      {square.letter && <Tile letter={square.letter} isBlank={square.isBlank} />}
    </button>
  )
}

export default BoardSquare

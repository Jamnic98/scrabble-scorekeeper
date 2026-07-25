import React from 'react'

import { Arrow, Tile } from 'components'
import type { BoardState, Coords, Square, Word, WordDirection } from 'types/global'

const baseStyle = `relative border-1 border-solid border-gray-400 w-[38px] h-[38px] p-0 float-left outline-none`

const getFlashClass = (scoreMultiplier?: string): string => {
  switch (scoreMultiplier) {
    case 'tw':
      return 'animate-tw-color-change'
    case 'tl':
      return 'animate-tl-color-change'
    case 'dw':
      return 'animate-dw-color-change'
    case 'dl':
      return 'animate-dl-color-change'
    default:
      return 'animate-color-change'
  }
}

const getMultiplierBg = (scoreMultiplier?: string): string => {
  switch (scoreMultiplier) {
    case 'tw':
      return 'bg-[rgb(255,0,0)]'
    case 'tl':
      return 'bg-[rgb(0,0,255)]'
    case 'dw':
      return 'bg-[rgb(255,192,203)]'
    case 'dl':
      return 'bg-sky-200'
    default:
      return 'bg-white'
  }
}

export interface BoardSquareProps {
  coords: Coords
  activeSquareCoords: Coords
  square: Square
  setActiveSquareCoords: React.Dispatch<React.SetStateAction<Coords>>
  wordDirection: WordDirection
  setWordDirection: React.Dispatch<React.SetStateAction<WordDirection>>
  letters: Word
  boardState: BoardState
}

const BoardSquare: React.FC<BoardSquareProps> = ({
  coords,
  square,
  activeSquareCoords,
  setActiveSquareCoords,
  wordDirection,
  setWordDirection,
  letters,
  boardState
}) => {
  const [x, y] = coords

  // 1. Safely extract scoreMultiplier from passed square prop or boardState
  const scoreMultiplier: string =
    square?.scoreMultiplier ?? boardState?.[y]?.[x]?.scoreMultiplier ?? ''

  // 2. Loose equality check (==) to safely handle string vs number coordinate types,
  // plus fallback check for object format ({ x, y })
  const isActive = Array.isArray(activeSquareCoords)
    ? Number(activeSquareCoords[0]) === Number(x) && Number(activeSquareCoords[1]) === Number(y)
    : // TODO: review
      activeSquareCoords?.[1] === x && activeSquareCoords?.[0] === y

  // 3. Determine animation or standard static background
  const flashClass = isActive ? getFlashClass(scoreMultiplier) : ''
  const bgClass = flashClass ? flashClass : getMultiplierBg(scoreMultiplier)

  return (
    <button
      tabIndex={-1}
      className={`
        ${baseStyle}
        ${bgClass}
        ${square?.isFocused ? 'focused' : 'unfocused'} 
        ${square?.letter === '' || !square?.letter ? 'cursor-pointer' : 'cursor-default'} 
      `}
      onMouseDown={() => {
        if (letters?.length === 0) {
          if (x !== activeSquareCoords?.[0] || y !== activeSquareCoords?.[1]) {
            setWordDirection('')
          }
          if (boardState?.[y]?.[x]?.letter === '') {
            setActiveSquareCoords(coords)
          }
        }
      }}
    >
      <Arrow square={square} wordDirection={wordDirection} />
      {square?.letter && <Tile letter={square.letter} isBlank={square.isBlank} />}
    </button>
  )
}

export default BoardSquare

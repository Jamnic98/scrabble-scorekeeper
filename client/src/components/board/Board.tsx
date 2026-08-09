import React from 'react'

import type { Row, Square as SquareType } from '@scrabble/engine'
import { Square as BoardSquare } from '.'
import { useGame } from 'hooks'

export const Board: React.FC = () => {
  const { state, dispatch } = useGame()
  const { board, activeSquareCoords, wordDirection } = state

  return (
    <div id="board" className="float-left border-8 border-black">
      {board.map((row: Row, rowIndex: number) => (
        <div key={rowIndex} id="board-row" className="flex flex-nowrap">
          {row.map((square: SquareType, colIndex: number) => {
            const isFocused =
              activeSquareCoords?.row === rowIndex && activeSquareCoords?.col === colIndex

            return (
              <BoardSquare
                key={`${rowIndex}-${colIndex}`}
                square={square}
                coords={{ row: rowIndex, col: colIndex }}
                isFocused={isFocused}
                wordDirection={wordDirection}
                setWordDirection={(dir) => dispatch({ type: 'SET_WORD_DIRECTION', direction: dir })}
                onSelectSquare={(coords) => dispatch({ type: 'SELECT_SQUARE', coords })}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Board

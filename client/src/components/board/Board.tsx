import { useGame } from 'context'
import { Square as BoardSquare } from '.'
import type { Row, Square } from '@scrabble/engine'

export const Board = () => {
  const {
    state: { board }
  } = useGame()

  return (
    <div id="board" className="border-8 border-black float-left">
      {board.map((row: Row, rowIndex: number) => (
        <div key={rowIndex} id="board-row">
          {row.map((square: Square, colIndex: number) => {
            return <BoardSquare key={rowIndex * 15 + colIndex} />
            // return (
            //   <BoardSquare
            //     key={y * 15 + x}
            //     coords={{ x, y }}
            //     square={square}
            //     wordDirection={wordDirection}
            //     setWordDirection={setWordDirection}
            //     activeSquareCoords={activeSquareCoords}
            //     setActiveSquareCoords={setActiveSquareCoords}
            //     letters={letters}
            //     boardState={boardState}
            //   />
            // )
          })}
        </div>
      ))}
    </div>
  )
}

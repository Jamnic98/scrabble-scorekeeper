import { useEffect } from 'react'

import { BoardSquare } from 'components'
import { scoreMultiplierArrays } from 'utils/constants'
import type {
  BoardState,
  Coords,
  Row,
  ScoreMultiplier,
  Square,
  Word,
  WordDirection
} from 'types/global'

// TODO: move
// returns a row's point multipliers as an array of strings
const getRowScoreMultipliers = (rowIndex: number): ScoreMultiplier[] => {
  switch (rowIndex) {
    case 0:
    case 14:
      return scoreMultiplierArrays[0]
    case 1:
    case 13:
      return scoreMultiplierArrays[1]
    case 2:
    case 12:
      return scoreMultiplierArrays[2]
    case 3:
    case 11:
      return scoreMultiplierArrays[3]
    case 4:
    case 10:
      return scoreMultiplierArrays[4]
    case 5:
    case 9:
      return scoreMultiplierArrays[5]
    case 6:
    case 8:
      return scoreMultiplierArrays[6]
    case 7:
      return scoreMultiplierArrays[7]
  }
  return []
}

export interface BoardProps {
  boardState: BoardState
  setBoardState: React.Dispatch<React.SetStateAction<BoardState>>
  activeSquareCoords: Coords
  setActiveSquareCoords: React.Dispatch<React.SetStateAction<Coords>>
  wordDirection: WordDirection
  setWordDirection: React.Dispatch<React.SetStateAction<WordDirection>>
  letters: Word
}

const Board: React.FC<BoardProps> = ({
  boardState,
  setBoardState,
  activeSquareCoords,
  setActiveSquareCoords,
  wordDirection,
  setWordDirection,
  letters
}) => {
  // Returns an array of Square objects for a given row index
  const createRowOfSquares = (rowIndex: number): Square[] => {
    const multipliers = getRowScoreMultipliers(rowIndex) ?? []

    return multipliers.map((scoreMultiplier) => ({
      letter: '',
      scoreMultiplier,
      isBlank: false,
      isFocused: false
    }))
  }

  useEffect(() => {
    // Generates 15 rows cleanly without standard array hole/undefined issues
    const board = Array.from({ length: 15 }, (_, rowIndex) => createRowOfSquares(rowIndex))

    setBoardState(board)
  }, [setBoardState])

  return (
    <div id="board" className="border-8 border-black float-left">
      {boardState.map((row: Row, y: number) => (
        <div key={y} id="board-row">
          {row.map((square: Square, x: number) => {
            return (
              <BoardSquare
                key={y * 15 + x}
                coords={{ x, y }}
                square={square}
                wordDirection={wordDirection}
                setWordDirection={setWordDirection}
                activeSquareCoords={activeSquareCoords}
                setActiveSquareCoords={setActiveSquareCoords}
                letters={letters}
                boardState={boardState}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default Board

import React, { useEffect } from "react"
import { BoardSquare } from "./board-square"
import "./board.css"

export interface BoardProps {
  boardState: any
  setBoardState: any
  activeSquareCoords: any
  setActiveSquareCoords: any
  wordDirection: any
  setWordDirection: any
  letters: any
}

export const Board: React.FC<BoardProps> = ({
  boardState,
  setBoardState,
  activeSquareCoords,
  setActiveSquareCoords,
  wordDirection,
  setWordDirection,
  letters
}) => {
  // when component mounts, create the starting board UI
  useEffect(() => setBoardState(createStartingBoard()), [])

  const scoreMultiplierArrays = [
    ["tw", "", "", "dl", "", "", "", "tw", "", "", "", "dl", "", "", "tw"],
    ["", "dw", "", "", "", "tl", "", "", "", "tl", "", "", "", "dw", ""],
    ["", "", "dw", "", "", "", "dl", "", "dl", "", "", "", "dw", "", ""],
    ["dl", "", "", "dw", "", "", "", "dl", "", "", "", "dw", "", "", "dl"],
    ["", "", "", "", "dw", "", "", "", "", "", "dw", "", "", "", ""],
    ["", "tl", "", "", "", "tl", "", "", "", "tl", "", "", "", "tl", ""],
    ["", "", "dl", "", "", "", "dl", "", "dl", "", "", "", "dl", "", ""],
    ["tw", "", "", "dl", "", "", "", "dw", "", "", "", "dl", "", "", "tw"]
  ]

  // returns a 15 x 15 array of the game board with each square as an object
  const createStartingBoard = () => {
    return new Array(15).fill(null).map((_row, rowIndex) => {
      return createRowOfSquares(rowIndex)
    })
  }

  // returns an array of Square objects from the score multiplier arrays
  const createRowOfSquares = (rowIndex: number) => {
    return getRowScoreMultipliers(rowIndex)?.map((_scoreMultiplier) => {
      return {
        letter: "",
        scoreMultiplier: _scoreMultiplier,
        isBlank: false,
        isFocused: false
      }
    })
  }

  // returns a row's point multipliers as an array of strings
  const getRowScoreMultipliers = (rowIndex) => {
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
  }

  return (
    <div id='board'>
      {boardState.map((row, y) => (
        <div key={y} id='board-row'>
          {row.map((square, x) => {
            console.log(row )
            return (
              <BoardSquare
                key={y * 15 + x}
                coords={[x, y]}
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

import React from "react"
import Tile from "../tile/tile"
import "./board-square.css"

function BoardSquare({ coords, square, activeSquareCoords, setActiveSquareCoords,
  wordDirection, setWordDirection, letters, boardState }) {

  const setArrow = () => {
    if (wordDirection === "") {
      return null;
    } else if (square.letter === "" && square.isFocused) {
      return <span className={`${wordDirection} arrow small`} ></span>;
    }
  }

  return (
    <button
      tabIndex="-1"
      className={`
        ${square.scoreMultiplier} 
        ${square.isFocused ? "focused" : "unfocused"} 
        ${square.letter === "" ? "empty" : "occupied"} board-square`
      }
      onMouseDown={() => {
        if (letters.length === 0) {
          if (coords[0] !== activeSquareCoords[0] || coords[1] !== activeSquareCoords[1]) {
            setWordDirection("")
          }
          if (boardState[coords[1]][coords[0]].letter === "") {
            setActiveSquareCoords(coords)
          }
        }
      }
      }
    >{setArrow()}
      <Tile square={square} />
    </button>
  )
}

export default BoardSquare

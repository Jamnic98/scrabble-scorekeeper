import React from 'react'
import { ArrowRight, ArrowDown, SkipForward, Undo2 } from 'lucide-react'

import { type Player, Tile } from 'components'
import type { Coords, WordDirection } from 'types/global'

export interface SideBarProps {
  wordDirection: WordDirection
  handleRightArrow: any
  handleDownArrow: any
  letters: any
  setLetters: any
  activeSquareCoords: any
  setActiveSquareCoords: React.Dispatch<Coords>
  increaseSkipCount: any
  generalReset: any
  setBoardState: any
  lastBoardState: any
  setLastBoardState: any
  turnCount: number
  setTurnCount: React.Dispatch<React.SetStateAction<number>>
  players: Player[]
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>
  getCurrentPlayer: (players: Player[]) => Player
  skipCount: number
  setSkipCount: React.Dispatch<React.SetStateAction<number>>
  remainingLetters: any
  setRemainingLetters: any
}

export const SideBar: React.FC<SideBarProps> = ({
  wordDirection,
  handleRightArrow,
  handleDownArrow,
  letters,
  setLetters,
  activeSquareCoords,
  setActiveSquareCoords,
  increaseSkipCount,
  generalReset,
  setBoardState,
  lastBoardState,
  setLastBoardState,
  turnCount,
  setTurnCount,
  players,
  setPlayers,
  getCurrentPlayer,
  skipCount,
  setSkipCount,
  remainingLetters,
  setRemainingLetters
}) => {
  const handleUndoButton = () => {
    if (lastBoardState.length <= 1) {
      setBoardState(lastBoardState[lastBoardState.length - 1])
    } else {
      const lbs = lastBoardState[lastBoardState.length - 2]
      setLastBoardState(lastBoardState.slice(0, lastBoardState.length - 1))
      setBoardState(lbs)
    }

    const updatedPlayers = undoLastPlayerScore()
    setPlayers(updatedPlayers)

    const lettersAdded = getLettersAdded()
    addTiles(lettersAdded)

    setActiveSquareCoords([-1, -1])
    setLetters([])
    setTurnCount(turnCount - 1)
  }

  const undoLastPlayerScore = () => {
    const currentPlayerIndex = players.indexOf(getCurrentPlayer(players))
    const previousPlayerIndex =
      currentPlayerIndex === 0 ? players.length - 1 : currentPlayerIndex - 1

    const updatedPlayers = players.map((player: Player, playerIndex: number) => {
      player.isCurrentPlayer = playerIndex === previousPlayerIndex
      if (player.isCurrentPlayer) {
        player.pointsPerMove = updatePlayerPoints(player.pointsPerMove)
      }
      return player
    })
    return updatedPlayers
  }

  const getLettersAdded = () => {
    const previousBoardState = lastBoardState[lastBoardState.length - 1]
    const ppBS = lastBoardState[lastBoardState.length - 2]
    let lettersAdded: any[] = []
    previousBoardState.map((row: any, rowIndex: number) => {
      return row.map((square: any, squareIndex: number) => {
        const { letter } = ppBS[rowIndex][squareIndex]
        if (square.letter !== letter) {
          lettersAdded.push(square)
        }
      })
    })
    return lettersAdded
  }

  const updatePlayerPoints = (playerPoints: any) => {
    let nullIndex = playerPoints.indexOf(null)
    if (nullIndex === -1) {
      nullIndex = playerPoints.length
    }

    const updatedPoints = playerPoints.map((points: any, pointsIndex: number) => {
      if (pointsIndex === nullIndex - 1) {
        if (points === 0) {
          setSkipCount(skipCount - 1)
        }
        return null
      } else return points
    })
    return updatedPoints
  }

  const addTiles = (lettersAdded: any) => {
    const lettersRemaining = { ...remainingLetters }
    lettersAdded.map((letterObj: any) => {
      if (letterObj.isBlank) {
        lettersRemaining[' '] += 1
      } else {
        lettersRemaining[letterObj.letter] += 1
      }
    })
    setRemainingLetters(lettersRemaining)
  }

  return (
    <div
      id="side-bar"
      className="flex flex-col justify-between h-146.5 w-52 p-2 bg-neutral-400 border-r-8 border-t-8 border-b-8 border-black shadow-inner"
    >
      <div id="arrows" className="flex flex-row gap-1">
        <button
          onMouseDown={(e) => handleDownArrow(e)}
          className="flex items-center justify-center py-2.5 w-1/2 bg-[rgb(255,218,163)] border-2 border-black rounded-md cursor-pointer hover:brightness-95 transition disabled:opacity-30 disabled:cursor-default disabled:hover:brightness-100"
          disabled={
            wordDirection === 'down' || letters.length > 0 || activeSquareCoords.length === 0
          }
        >
          <ArrowDown size={18} strokeWidth={2.5} />
        </button>

        <button
          onMouseDown={(e) => handleRightArrow(e)}
          className="flex items-center justify-center py-2.5 w-1/2 bg-[rgb(255,218,163)] border-2 border-black rounded-md cursor-pointer hover:brightness-95 transition disabled:opacity-30 disabled:cursor-default disabled:hover:brightness-100"
          disabled={
            wordDirection === 'right' || letters.length > 0 || activeSquareCoords.length === 0
          }
        >
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex flex-row flex-wrap gap-2 justify-center items-center ">
        {Object.entries(remainingLetters).map(([letter, count]: any, index) => (
          <div key={index} className="flex flex-col justify-center items-center">
            <div>
              <Tile letter={letter} unavailable={count === 0} />
            </div>
            <span className={`text-xs font-bold ${count === 0 ? 'invisible' : ''}`}>{count}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-row gap-1">
        <button
          id="undo-button"
          onMouseUp={() => {
            handleUndoButton()
          }}
          disabled={letters.length > 0 || turnCount === 0}
          className="flex items-center justify-center gap-1 py-2.5 w-1/2 uppercase text-sm font-bold tracking-wide bg-[rgb(255,218,163)] border-2 border-black rounded-md cursor-pointer hover:brightness-95 transition disabled:opacity-30 disabled:cursor-default disabled:hover:brightness-100"
        >
          <Undo2 size={16} strokeWidth={2.5} />
          Undo
        </button>
        <button
          id="skip-button"
          onMouseUp={() => {
            increaseSkipCount()
            generalReset()
          }}
          disabled={letters.length > 0}
          className="flex items-center justify-center gap-1 py-2.5 w-1/2 uppercase text-sm font-bold tracking-wide bg-[rgb(255,218,163)] border-2 border-black rounded-md cursor-pointer hover:brightness-95 transition disabled:opacity-30 disabled:cursor-default disabled:hover:brightness-100"
        >
          <SkipForward size={16} strokeWidth={2.5} />
          Skip
        </button>
      </div>
    </div>
  )
}

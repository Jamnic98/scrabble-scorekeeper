import React, { useEffect, useState } from "react"
import { PlayerEntryWidget } from "./components/player/player-entry-widget"
import { BoardWidget } from "./components/board/board-widget"
import Table from "./components/table/table"
import "./App.css"

function App() {
  const [lastTurnCount, setLastTurnCount] = useState(0)
  const [turnCount, setTurnCount] = useState(0)
  const [turnScore, setTurnScore] = useState(0)
  const [players, setPlayers]: any = useState([
    { name: "A", pointsPerMove: Array(20).fill(null), isCurrentPlayer: true },
    { name: "B", pointsPerMove: Array(20).fill(null), isCurrentPlayer: false },
    { name: "C", pointsPerMove: Array(20).fill(null), isCurrentPlayer: false },
    { name: "D", pointsPerMove: Array(20).fill(null), isCurrentPlayer: false }
  ])

  useEffect(() => {
    if (turnCount > lastTurnCount) {
      setPlayers(updatePlayerScore())
      setLastTurnCount(lastTurnCount + 1)
      setTurnScore(0)
    } else {
      setLastTurnCount(lastTurnCount - 1)
    }
  }, [turnCount])

  const updatePlayerScore = () => {
    const currentPlayer = getCurrentPlayer()
    const currentPlayerIndex = players.indexOf(currentPlayer)
    const nextPlayerIndex =
      currentPlayerIndex === players.length - 1 ? 0 : currentPlayerIndex + 1
    const updatedPlayers = players.map((player, playerIndex) => {
      if (player.isCurrentPlayer) {
        player.pointsPerMove = addPoints(player.pointsPerMove)
      }
      player.isCurrentPlayer = playerIndex === nextPlayerIndex
      return player
    })

    const lastPlayersPoints =
      updatedPlayers[updatedPlayers.length - 1].pointsPerMove
    if (lastPlayersPoints[lastPlayersPoints.length - 1] !== null) {
      // TODO: fix argument
      return extendPointsArray(/* updatedPlayers */)
    } else {
      return updatedPlayers
    }
  }

  // returns the player who's turn it is to move
  const getCurrentPlayer = () => {
    for (const player of players) {
      if (player.isCurrentPlayer) {
        return player
      }
    }
  }

  const addPoints = (playerPoints) => {
    const nullIndex = playerPoints.indexOf(null)
    return playerPoints.map((points, pointsIndex) => {
      if (nullIndex === pointsIndex) {
        return turnScore
      } else {
        return points
      }
    })
  }

  const extendPointsArray = () => {
    return players.map((player) => {
      player.pointsPerMove = [...player.pointsPerMove, null]
      return player
    })
  }

  return (
    <div>
      <h1 id='main-title'>Scrabble Scorekeeper</h1>
      <div id='main-content'>
        <PlayerEntryWidget players={players} setPlayers={setPlayers} />
        <BoardWidget
          players={players}
          setPlayers={setPlayers}
          getCurrentPlayer={getCurrentPlayer}
          turnCount={turnCount}
          setTurnCount={setTurnCount}
          setTurnScore={setTurnScore}
        />
        <Table players={players} />
      </div>
    </div>
  )
}

export default App

import { useEffect, useState } from 'react'

import { BoardWidget, PlayerEntryWidget, Player, Table } from 'components'

export const App = () => {
  const [lastTurnCount, setLastTurnCount] = useState(0)
  const [turnCount, setTurnCount] = useState(0)
  const [turnScore, setTurnScore] = useState(0)
  const [players, setPlayers] = useState<Player[]>([
    { name: 'A', pointsPerMove: Array(20).fill(null), isCurrentPlayer: true },
    { name: 'B', pointsPerMove: Array(20).fill(null), isCurrentPlayer: false }
    // { name: 'C', pointsPerMove: Array(20).fill(null), isCurrentPlayer: false },
    // { name: 'D', pointsPerMove: Array(20).fill(null), isCurrentPlayer: false },
  ])

  useEffect(() => {
    if (turnCount > lastTurnCount) {
      setPlayers(updatePlayerScore())
      setLastTurnCount((lastTurnCount) => lastTurnCount + 1)
      setTurnScore(0)
    } else {
      setLastTurnCount((lastTurnCount) => lastTurnCount - 1)
    }
  }, [turnCount])

  const updatePlayerScore = () => {
    const currentPlayer = getCurrentPlayer()
    const currentPlayerIndex = players.indexOf(currentPlayer)
    const nextPlayerIndex = currentPlayerIndex === players.length - 1 ? 0 : currentPlayerIndex + 1

    const updatedPlayers = players.map((player, playerIndex) => {
      if (player.isCurrentPlayer) {
        player.pointsPerMove = addPoints(player.pointsPerMove)
      }
      player.isCurrentPlayer = playerIndex === nextPlayerIndex
      return player
    })

    const lastPlayersPoints = updatedPlayers[updatedPlayers.length - 1].pointsPerMove

    return lastPlayersPoints[lastPlayersPoints.length - 1] !== null
      ? extendPointsArray()
      : updatedPlayers
  }

  const getCurrentPlayer = () => players.filter((player) => player.isCurrentPlayer)[0]

  const addPoints = (playerPoints: (number | null)[]) => {
    const nullIndex = playerPoints.indexOf(null)
    return playerPoints.map((points, pointsIndex) =>
      nullIndex === pointsIndex ? turnScore : points
    )
  }

  const extendPointsArray = () => {
    return players.map((player) => {
      player.pointsPerMove = [...player.pointsPerMove, -1]
      return player
    })
  }

  return (
    <div className="min-h-screen bg-gray-700">
      {players.length ? (
        <div className="flex flex-row flex-wrap gap-4 p-8">
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
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-3xl font-semibold">Scrabble Scorekeeper</h1>
          <PlayerEntryWidget setPlayers={setPlayers} />
        </div>
      )}
    </div>
  )
}

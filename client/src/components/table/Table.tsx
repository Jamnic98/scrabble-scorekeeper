import React from 'react'

import { Column } from '.'
import { useGame } from 'hooks'

const TABLE_WIDTH = 460

export const Table: React.FC = () => {
  const { state } = useGame()
  const { players, activePlayerIndex } = state

  const playerCount = players?.length ?? 0
  if (playerCount === 0) return null

  const columnWidth = TABLE_WIDTH / playerCount

  return (
    <div
      id="table"
      className="flex min-w-115 flex-nowrap border-8 border-black bg-neutral-50 shadow-md"
    >
      {players.map((player, index) => (
        <Column
          key={player.id ?? index}
          player={player}
          isCurrentPlayer={index === activePlayerIndex}
          columnWidth={columnWidth}
        />
      ))}
    </div>
  )
}

export default Table

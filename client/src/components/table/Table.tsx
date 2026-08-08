import React, { useEffect, useRef } from 'react'

import { Column } from '.'
import { useGame } from 'hooks'

const TABLE_WIDTH = 460

export const Table: React.FC = () => {
  const { state } = useGame()
  const { players, activePlayerIndex } = state
  const containerRef = useRef<HTMLDivElement>(null)

  const playerCount = players?.length ?? 0
  if (playerCount === 0) return null

  const columnWidth = TABLE_WIDTH / playerCount

  const maxTurns = Math.max(0, ...players.map((player) => player.turnScores?.length ?? 0))

  const totalRows = Math.max(15, maxTurns + 1)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [totalRows, maxTurns])

  return (
    <div
      ref={containerRef}
      id="table"
      className="
        flex max-h-146 min-w-115 overflow-y-auto border-8 border-black bg-neutral-50 shadow-md scroll-smooth
        
        /* 🎨 Firefox standard thin scrollbar */
        scrollbar-thin 
        [scrollbar-color:#a3a3a3_transparent]

        /* 🎨 WebKit (Chrome, Safari, Edge) sleek scrollbar */
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-neutral-400
        hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600
      "
    >
      {players.map((player, index) => (
        <Column
          key={player.id ?? index}
          player={player}
          isCurrentPlayer={index === activePlayerIndex}
          columnWidth={columnWidth}
          totalRows={totalRows}
        />
      ))}
    </div>
  )
}

export default Table

import React, { useEffect, useRef, useState } from 'react'

import { Column, MoveModal } from 'components'
import { useGame } from 'hooks'
import type { MoveHistoryItem } from '@scrabble/engine'

const TABLE_WIDTH = 460

export const Table: React.FC = () => {
  const { state } = useGame()
  const { players, activePlayerIndex } = state
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeMoveData, setActiveMoveData] = useState<{
    move: MoveHistoryItem
    turnIndex: number
    playerName: string
  } | null>(null)

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

  const handleOpenBreakdown = (playerId: string, playerName: string, turnIndex: number) => {
    const playerHistory = state.history.filter(
      (h) => h.playerId === playerId && h.actionType === 'PLAY_WORD'
    )
    const move = playerHistory[turnIndex]
    if (!move) return

    setActiveMoveData({ move, turnIndex, playerName })
  }

  return (
    <>
      <div
        ref={containerRef}
        id="table"
        className="
          flex max-h-146 min-w-115 overflow-y-auto border-8 border-black bg-neutral-50 shadow-md scroll-smooth
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-gray-400
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-gray-500
        "
      >
        {players.map((player, index) => (
          <Column
            key={player.id ?? index}
            player={player}
            isCurrentPlayer={index === activePlayerIndex}
            columnWidth={columnWidth}
            totalRows={totalRows}
            onCellClick={(turnIndex) => handleOpenBreakdown(player.id, player.name, turnIndex)}
          />
        ))}
      </div>

      <MoveModal
        isOpen={!!activeMoveData}
        onClose={() => setActiveMoveData(null)}
        moveData={activeMoveData}
        boardState={state.board}
      />
    </>
  )
}

export default Table

import React, { useMemo } from 'react'
import type { Player } from '@scrabble/engine'
import { useGame } from 'hooks'

export interface ColumnProps {
  player: Player
  isCurrentPlayer: boolean
  columnWidth: number
  totalRows: number
}

export const Column: React.FC<ColumnProps> = ({
  player,
  isCurrentPlayer,
  columnWidth,
  totalRows
}) => {
  const { state } = useGame()
  const moves: number[] = player.turnScores ?? []

  const cumulativeScores = useMemo(() => {
    let runningTotal = 0
    return moves.map((score) => {
      runningTotal += Number(score) || 0
      return runningTotal
    })
  }, [moves])

  const isCompleted = state.status === 'COMPLETED'

  return (
    <table
      style={{ width: columnWidth }}
      className="inline-table content-center items-center border-collapse border border-black text-center text-2xl font-bold"
    >
      {/* Pinned top header during scroll */}
      <thead className="sticky top-0 z-10">
        <tr className="h-[1.2em]">
          <th
            colSpan={2}
            className={`h-[1em] max-w-[5em] border border-black text-center text-xl transition-colors ${
              !isCompleted && isCurrentPlayer ? 'bg-yellow-300' : 'bg-neutral-200'
            }`}
          >
            {player.name}
            {isCompleted && player.isWinner && ' 🏆'}
          </th>
        </tr>
        <tr className="h-[1.2em]">
          <th className="h-[1em] max-w-[5em] border border-black bg-neutral-100 text-center text-base">
            Turn
          </th>
          <th className="h-[1em] max-w-[5em] border border-black bg-neutral-100 text-center text-base">
            Sum
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: totalRows }).map((_, turnIndex) => {
          const points = moves[turnIndex]
          const cumulativeScore = cumulativeScores[turnIndex]
          const hasPlayed = points !== undefined && points !== null

          return (
            <tr key={turnIndex} className="h-[1.2em]">
              <td className="h-[1em] max-w-[5em] border border-black bg-[rgb(224,255,224)] text-center text-base">
                {hasPlayed ? points : ''}
              </td>
              <td className="h-[1em] max-w-[5em] border border-black bg-[rgb(160,229,160)] text-center text-base">
                {hasPlayed ? cumulativeScore : ''}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

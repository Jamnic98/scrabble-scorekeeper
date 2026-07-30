import React from 'react'
import type { Player } from '@scrabble/engine'

export interface ColumnProps {
  player: Player
  isCurrentPlayer: boolean
  columnWidth: number
  /** Number of blank turn rows to render in advance (default: 15) */
  minRows?: number
}

export const Column: React.FC<ColumnProps> = ({
  player,
  isCurrentPlayer,
  columnWidth,
  minRows = 15
}) => {
  // Extract move scores or fallback to empty array
  const moves: number[] = player.turnScores ?? []

  // Ensure table displays at least `minRows` rows or expands if game goes longer
  const totalRowsCount = Math.max(minRows, moves.length)

  // Calculate cumulative score up to a given turn index
  const getCumulativeScore = (turnIndex: number): number | null => {
    if (turnIndex >= moves.length) return null
    let sum = 0
    for (let i = 0; i <= turnIndex; i++) {
      const score = moves[i]
      if (score === null || score === undefined) return null
      sum += score
    }
    return sum
  }

  return (
    <table
      style={{ width: columnWidth }}
      className="inline-table content-center items-center border-collapse border border-black text-center text-2xl font-bold"
    >
      <thead>
        <tr className="h-[1.2em]">
          <th
            colSpan={2}
            className={`h-[1em] max-w-[5em] border border-black text-center text-xl transition-colors ${
              isCurrentPlayer ? 'bg-yellow-300' : 'bg-neutral-200'
            }`}
          >
            {player.name}
          </th>
        </tr>
        <tr className="h-[1.2em]">
          <th className="h-[1em] max-w-[5em] border border-black text-center text-base bg-neutral-100">
            Turn
          </th>
          <th className="h-[1em] max-w-[5em] border border-black text-center text-base bg-neutral-100">
            Sum
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: totalRowsCount }).map((_, turnIndex) => {
          const points = moves[turnIndex]
          const cumulativeScore = getCumulativeScore(turnIndex)
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

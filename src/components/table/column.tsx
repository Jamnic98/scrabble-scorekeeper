import React from 'react'
import { Player } from '../../App'
import './column.css'

export interface ColumnProps {
  player: Player
  playerCount: number
}

export const Column: React.FC<ColumnProps> = ({ player, playerCount }) => {
  const getCumulativeScore = (pointsIndex: number) => {
    const nullIndex = player.pointsPerMove.indexOf(null)
    return nullIndex > pointsIndex || nullIndex === -1
      ? player.pointsPerMove
          .slice(0, ++pointsIndex)
          .reduce((a, b) => (a !== null && b !== null ? a + b : null), 0)
      : null
  }

  const setTableRow = () => {
    return player.pointsPerMove.map((points, pointsIndex) => (
      <tr key={pointsIndex}>
        <td className='left-column'>{points}</td>
        <td className='right-column'>{getCumulativeScore(pointsIndex)}</td>
      </tr>
    ))
  }

  return (
    <table style={{ width: 460 / playerCount }}>
      <thead>
        <tr>
          <th
            className={`${
              player.isCurrentPlayer ? 'highlighted' : ''
            } main-column-title`}
            colSpan={2}
          >
            {player.name}
          </th>
        </tr>
        <tr>
          <th className='sub-column-title'>Turn</th>
          <th className='sub-column-title'>Sum</th>
        </tr>
      </thead>
      <tbody>{setTableRow()}</tbody>
    </table>
  )
}

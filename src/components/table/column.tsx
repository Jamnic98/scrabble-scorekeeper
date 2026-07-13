import { type Player } from '../../App'

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
      <tr key={pointsIndex} className="h-[1.2em]">
        <td className="max-w-[5em] h-[1em] border border-black text-center text-base bg-[rgb(224,255,224)]">
          {points}
        </td>
        <td className="max-w-[5em] h-[1em] border border-black text-center text-base bg-[rgb(160,229,160)]">
          {getCumulativeScore(pointsIndex)}
        </td>
      </tr>
    ))
  }

  return (
    <table
      style={{ width: 460 / playerCount }}
      className="border border-black border-collapse inline-table content-center items-center text-center text-2xl font-bold"
    >
      <thead>
        <tr className="h-[1.2em]">
          <th
            className={`${
              player.isCurrentPlayer ? 'bg-yellow-300' : ''
            } max-w-[5em] h-[1em] border border-black text-center text-xl`}
            colSpan={2}
          >
            {player.name}
          </th>
        </tr>
        <tr className="h-[1.2em]">
          <th className="max-w-[5em] h-[1em] border border-black text-center text-base">Turn</th>
          <th className="max-w-[5em] h-[1em] border border-black text-center text-base">Sum</th>
        </tr>
      </thead>
      <tbody>{setTableRow()}</tbody>
    </table>
  )
}

import { Column } from './column'
import { type Player } from '../../App'

export interface TableProps {
  players: Player[]
}

export const Table: React.FC<TableProps> = ({ players }) => {
  const playerCount = players.length

  return (
    playerCount > 0 && (
      <div id="table" className="min-w-115 inline-block">
        {players.map((player, index) => (
          <Column key={index} player={player} playerCount={playerCount} />
        ))}
      </div>
    )
  )
}

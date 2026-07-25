import { Column, type Player } from 'components'

export interface TableProps {
  players: Player[]
}

const TABLE_WIDTH = 460

const Table: React.FC<TableProps> = ({ players }) => {
  const playerCount = players.length
  const columnWidth = TABLE_WIDTH / playerCount

  return (
    playerCount > 0 && (
      <div id="table" className="min-w-115 bg-neutral-50 border-8 flex flex-nowrap">
        {players.map((player, index) => (
          <Column key={index} player={player} columnWidth={columnWidth} />
        ))}
      </div>
    )
  )
}

export default Table

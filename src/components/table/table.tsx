import React from 'react'
import { Column } from './column'
import { Player } from '../../App'
import './table.css'

export interface TableProps {
  players: Player[]
}

export const Table: React.FC<TableProps> = ({ players }) => {
  const playerCount = players.length
  return playerCount > 0 ? (
    <div id='table'>
      {players.map((player, index) => (
        <Column key={index} player={player} playerCount={playerCount} />
      ))}
    </div>
  ) : null
}

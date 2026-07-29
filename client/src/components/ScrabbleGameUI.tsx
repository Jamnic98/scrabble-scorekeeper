import React from 'react'

import { Board, Controls, PlayerEntry, Table } from 'components'
import { useGame } from 'context'
import { usePreventArrowScroll } from 'hooks'

export const ScrabbleGameUI: React.FC = () => {
  usePreventArrowScroll()

  const { state } = useGame()

  if (state.status === 'LOBBY') return <PlayerEntry />

  return (
    <div className="flex flex-row flex-wrap gap-4 p-8">
      <Board />
      <Controls />
      {/* <Table players={state.players} /> */}
    </div>
  )
}

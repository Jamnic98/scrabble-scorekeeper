import React from 'react'

import { useDictionary, useGame } from 'hooks'
import { Board, Controls, PlayerEntry, Table } from 'components'
import { usePreventArrowScroll } from 'hooks'

export const ScrabbleGameUI: React.FC = () => {
  const { state, dispatch } = useGame()
  const { dictionary } = useDictionary()
  const {
    activePlayerIndex,
    activeSquareCoords,
    board,
    remainingLetters,
    placements,
    players,
    wordDirection
  } = state

  // Retrieve active player's rack
  const activePlayer = players?.[activePlayerIndex]
  const rack = activePlayer?.rack || []

  // Function to handle submitting the turn
  const handleSubmitTurn = () => {
    // Pass your dictionary object/set if required by SUBMIT_TURN action payload
    dispatch({ type: 'SUBMIT_TURN', dictionary })
    dispatch({ type: 'CLEAR_PLACEMENTS' })
  }

  // Global keydown handler for Arrow keys, Spacebar, Typing, and Backspace
  usePreventArrowScroll({
    enabled: true,
    activeSquareCoords,
    wordDirection,
    rack,
    remainingLetters,
    board,
    placements,
    numRows: board?.length || 15,
    numCols: board?.[0]?.length || 15,
    onSelectSquare: (coords) => dispatch({ type: 'SELECT_SQUARE', coords }),
    onSetDirection: (direction) => dispatch({ type: 'SET_WORD_DIRECTION', direction }),
    onPlaceTile: (placement) => dispatch({ type: 'PLACE_TILE', placement }),
    onRemoveTile: ({ row, col }) => dispatch({ type: 'REMOVE_TILE', row, col }),
    onSubmitTurn: handleSubmitTurn
  })

  if (state.status === 'LOBBY') return <PlayerEntry />

  return (
    <div className="flex flex-wrap gap-4 p-4">
      <div className="flex-none">
        <Board />
        <Controls
          // TODO: get activeSquareCoords and wordDirection from useGame state
          activeSquareCoords={activeSquareCoords}
          wordDirection={wordDirection}
          setWordDirection={(direction) => dispatch({ type: 'SET_WORD_DIRECTION', direction })}
          onUndo={() => dispatch({ type: 'UNDO_MOVE', playerId: activePlayer.id })}
          onSkip={() => dispatch({ type: 'PASS_TURN', playerId: activePlayer.id })}
        />
      </div>
      <Table />
    </div>
  )
}

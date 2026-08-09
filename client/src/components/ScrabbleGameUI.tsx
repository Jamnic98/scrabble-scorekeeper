import React from 'react'

import { useDictionary, useGame, usePreventArrowScroll } from 'hooks'
import { Board, Controls, PlayerEntry, Table } from 'components'

export const ScrabbleGameUI: React.FC = () => {
  const {
    state: {
      activePlayerIndex,
      activeSquareCoords,
      board,
      remainingLetters,
      placements,
      players,
      wordDirection,
      errorMessage,
      status
    },
    dispatch
  } = useGame()
  const { dictionary, isLoaded } = useDictionary()

  errorMessage && console.log(errorMessage)

  // Retrieve active player's rack
  const activePlayer = players?.[activePlayerIndex]
  const rack = activePlayer?.rack || []

  // Function to handle submitting the turn
  const handleSubmitTurn = () => {
    if (!isLoaded) {
      alert('Dictionary is still loading...')
      return
    }
    // Pass your dictionary object/set if required by SUBMIT_TURN action payload
    dispatch({ type: 'SUBMIT_TURN', dictionary })
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

  if (status === 'LOBBY') return <PlayerEntry />

  return (
    <div className="flex flex-wrap gap-4 p-4">
      <div className="flex-none">
        <Board />
        <Controls
          activeSquareCoords={activeSquareCoords}
          wordDirection={wordDirection}
          setWordDirection={(direction) => dispatch({ type: 'SET_WORD_DIRECTION', direction })}
          onUndo={() => {
            dispatch({ type: 'SELECT_SQUARE', coords: null })
            dispatch({ type: 'UNDO_MOVE', playerId: activePlayer.id })
          }}
          onSkip={() => {
            dispatch({ type: 'SELECT_SQUARE', coords: null })
            dispatch({ type: 'SKIP_TURN', playerId: activePlayer.id })
          }}
        />
      </div>
      <Table />
    </div>
  )
}

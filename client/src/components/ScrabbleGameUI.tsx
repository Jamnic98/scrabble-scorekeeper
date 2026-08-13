import React, { useEffect, useRef } from 'react'

import { useDictionary, useGame, usePreventArrowScroll } from 'hooks'
import { Board, Controls, PlayerEntry, Table } from 'components'

export const ScrabbleGameUI: React.FC = () => {
  const { state, dispatch } = useGame()
  const { dictionary, isLoaded } = useDictionary()
  const hasSavedRef = useRef(false)

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
    if (!isLoaded) {
      alert('Dictionary is still loading...')
      return
    }
    dispatch({ type: 'SUBMIT_TURN', dictionary })
  }

  // 💾 Save completed game to the backend once, when status flips to COMPLETED
  useEffect(() => {
    if (state.status !== 'COMPLETED' || hasSavedRef.current) return

    if (import.meta.env.NETLIFY) return

    hasSavedRef.current = true

    const saveGame = async () => {
      try {
        const response = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state)
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null)
          console.error('Failed to save game:', errorBody?.error ?? response.statusText)
          return
        }

        const result = await response.json()
        console.log('Game saved:', result.id)
      } catch (err) {
        console.error('Failed to save game:', err)
      }
    }

    saveGame()
  }, [state.status])

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

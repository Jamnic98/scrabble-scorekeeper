import { useEffect } from 'react'

import {
  type WordDirection,
  type Tile,
  type TilePlacement,
  type LetterCounts,
  getLetterPoints
} from '@scrabble/engine'
import { Coords } from 'types/global'
import { useGame } from 'hooks'

interface BoardKeyboardControlsProps {
  enabled?: boolean
  activeSquareCoords: Coords | null
  wordDirection: WordDirection
  rack: Tile[]
  remainingLetters: LetterCounts
  board: any[][]
  placements: TilePlacement[]
  numRows?: number
  numCols?: number
  onSelectSquare: (coords: Coords | null) => void
  onSetDirection: (dir: WordDirection) => void
  onPlaceTile: (placement: TilePlacement) => void
  onRemoveTile: (coords: { row: number; col: number }) => void
  onSubmitTurn?: () => void
  errorMessage: string | null
}

export function usePreventArrowScroll({
  enabled = true,
  activeSquareCoords,
  wordDirection,
  rack = [],
  remainingLetters,
  board,
  placements = [],
  numRows = 15,
  numCols = 15,
  onSelectSquare,
  onSetDirection,
  onPlaceTile,
  onRemoveTile,
  onSubmitTurn
}: BoardKeyboardControlsProps) {
  const { dispatch } = useGame()

  useEffect(() => {
    if (!enabled || !activeSquareCoords) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events inside inputs/textareas
      const activeElement = document.activeElement
      const isTypingInput =
        activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement

      if (isTypingInput) return

      const { row, col } = activeSquareCoords

      // Move along explicit direction vector regardless of active wordDirection state
      const getCoordsInDirection = (
        r: number,
        c: number,
        targetDir: WordDirection,
        delta: number
      ): Coords | null => {
        const nextR = targetDir === 'vertical' ? r + delta : r
        const nextC = targetDir === 'horizontal' ? c + delta : c

        if (nextR >= 0 && nextR < numRows && nextC >= 0 && nextC < numCols) {
          return { row: nextR, col: nextC }
        }
        return null
      }

      // Check if a square is occupied by either a committed board tile OR a pending placement
      const isSquareOccupied = (r: number, c: number) => {
        const hasBoardTile = Boolean(board[r]?.[c]?.tile)
        const hasPendingPlacement = placements.some((p) => p.row === r && p.col === c)
        return hasBoardTile || hasPendingPlacement
      }

      // Find the next empty square skipping past existing committed board tiles AND pending placements
      const getNextEmptySquare = (r: number, c: number): Coords | null => {
        let currR = wordDirection === 'vertical' ? r + 1 : r
        let currC = wordDirection === 'horizontal' ? c + 1 : c

        while (currR >= 0 && currR < numRows && currC >= 0 && currC < numCols) {
          if (!isSquareOccupied(currR, currC)) {
            return { row: currR, col: currC }
          }
          currR = wordDirection === 'vertical' ? currR + 1 : currR
          currC = wordDirection === 'horizontal' ? currC + 1 : currC
        }
        return null
      }

      // --- 1. ARROW KEYS & NAVIGATION ---
      switch (e.key) {
        // TODO: fix
        /* case 'ArrowLeft': {
          e.preventDefault()
          if (wordDirection !== 'horizontal') {
            onSetDirection('horizontal')
          }
          const next = getCoordsInDirection(row, col, 'horizontal', -1)
          if (next) onSelectSquare(next)
          return
        } */
        //
        case 'ArrowRight': {
          e.preventDefault()
          if (placements.length > 0) {
            return
          }
          if (wordDirection !== 'horizontal') {
            onSetDirection('horizontal')
            return
          }
          // const next = getCoordsInDirection(row, col, 'horizontal', 1)
          // if (next) onSelectSquare(next)
          return
        }
        case 'ArrowDown': {
          e.preventDefault()
          if (placements.length > 0) {
            return
          }
          if (wordDirection !== 'vertical') {
            onSetDirection('vertical')
            return
          }
          // TODO: fix
          // const next = getCoordsInDirection(row, col, 'vertical', 1)
          // if (next) onSelectSquare(next)
          return
        }
        // TODO: fix
        /*         case 'ArrowUp': {
          e.preventDefault()
          if (wordDirection !== 'vertical') {
            onSetDirection('vertical')
          }
          const next = getCoordsInDirection(row, col, 'vertical', -1)
          if (next) onSelectSquare(next)
          return
        } */
        case 'Enter': {
          e.preventDefault()
          if (placements.length > 0) {
            onSubmitTurn?.()
          }
          return
        }
        case 'Escape': {
          e.preventDefault()
          onSelectSquare(null)
          onSetDirection(null)
          if (placements.length > 0) {
            dispatch({ type: 'CLEAR_PLACEMENTS' })
          }
          return
        }
        case 'Backspace': {
          e.preventDefault()
          if (placements.length === 0) {
            dispatch({ type: 'CLEAR_PLACEMENTS' })
            return
          }

          const hasCurrentPlacement = placements.some((p) => p.row === row && p.col === col)

          if (hasCurrentPlacement) {
            // 1. Remove tile under current cursor
            onRemoveTile({ row, col })
          }

          // 2. Walk backward past permanent board tiles to find the previous NEW placement
          let prev: Coords | null = getCoordsInDirection(row, col, wordDirection, -1)

          while (prev !== null) {
            const isNewTile = placements.some((p) => p.row === prev!.row && p.col === prev!.col)

            if (isNewTile) {
              // If current square didn't have a placement, remove this previous one
              if (!hasCurrentPlacement) {
                onRemoveTile(prev)
              }
              onSelectSquare(prev)
              return
            }

            // Keep stepping backward past permanent board tiles
            prev = getCoordsInDirection(prev.row, prev.col, wordDirection, -1)
          }

          // 3. Fallback when prev becomes null (edge of board or no more new placements behind):
          // If we just deleted the very first placed tile of this turn, keep focus on current square
          // If no placements remain, reset selection state completely
          if (placements.length <= 1 && hasCurrentPlacement) {
            onSelectSquare(null)
            onSetDirection(null)
          }

          return
        }
      }

      // --- 2. LETTER & BLANK TILE INPUT ---
      const isSpace = e.key === ' '
      const isLetter = /^[a-zA-Z]$/.test(e.key)

      if (isSpace || isLetter) {
        e.preventDefault()

        if (placements.length === 7 || (placements.length === 1 && wordDirection === null)) {
          return
        }

        let chosenLetter = ''
        let isBlankTile = false

        if (isSpace) {
          // Trigger prompt for blank tile letter
          const input = window.prompt('Enter the letter to represent with your blank tile (A-Z):')
          if (!input) return // User cancelled or entered empty text

          const sanitized = input.trim().toUpperCase()
          if (!/^[A-Z]$/.test(sanitized)) {
            alert('Please enter a single valid letter (A-Z).')
            return
          }
          chosenLetter = sanitized
          isBlankTile = true
        } else {
          chosenLetter = e.key.toUpperCase()

          // Skip if no remaining letters left in bag/distribution
          if (remainingLetters[e.key] === 0) {
            return
          }
        }

        // 1. If active square has a committed board tile, advance to next empty square
        let targetRow = row
        let targetCol = col

        if (board[row]?.[col]?.tile) {
          const nextSquare = getNextEmptySquare(row, col)
          if (nextSquare) {
            targetRow = nextSquare.row
            targetCol = nextSquare.col
          } else {
            return // Reached edge of board
          }
        }

        // 2. Find matching tile from unplaced rack tiles
        const isTilePlaced = (tId: string) =>
          placements.some((p: any) => p.tileId === tId || p.tile?.id === tId)

        const unplacedRackTiles = (rack || []).filter((t: any) => !isTilePlaced(t.id || t.tileId))

        const matched = isBlankTile
          ? unplacedRackTiles.find((t: any) => t.isBlank || t.letter === ' ' || !t.letter)
          : unplacedRackTiles.find(
              (t: any) =>
                (typeof t === 'string' && t.toUpperCase() === chosenLetter) ||
                t.letter?.toUpperCase() === chosenLetter ||
                t.char?.toUpperCase() === chosenLetter
            ) || unplacedRackTiles.find((t: any) => t.isBlank)

        // 3. Construct Tile payload
        let tileToPlace: Tile

        if (matched) {
          tileToPlace =
            typeof matched === 'string'
              ? ({
                  id: `tile-${chosenLetter}-${Date.now()}`,
                  letter: chosenLetter,
                  points: isBlankTile ? 0 : getLetterPoints(chosenLetter),
                  isBlank: isBlankTile
                } as Tile)
              : {
                  ...matched,
                  letter: chosenLetter,
                  points: isBlankTile ? 0 : (matched.points ?? getLetterPoints(chosenLetter)),
                  isBlank: isBlankTile || Boolean(matched.isBlank)
                }
        } else {
          // Fallback tile structure
          tileToPlace = {
            id: `tile-${targetRow}-${targetCol}-${chosenLetter}-${Date.now()}`,
            letter: chosenLetter,
            points: isBlankTile ? 0 : getLetterPoints(chosenLetter),
            isBlank: isBlankTile
          } as Tile
        }

        // 4. Dispatch placement to board
        onPlaceTile({
          row: targetRow,
          col: targetCol,
          tile: tileToPlace
        })

        // 5. Advance cursor to next available square
        const nextSquare = getNextEmptySquare(targetRow, targetCol)
        if (nextSquare) {
          onSelectSquare(nextSquare)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    enabled,
    activeSquareCoords,
    wordDirection,
    rack,
    board,
    placements,
    numRows,
    numCols,
    onSelectSquare,
    onSetDirection,
    onPlaceTile,
    onRemoveTile,
    onSubmitTurn
  ])
}

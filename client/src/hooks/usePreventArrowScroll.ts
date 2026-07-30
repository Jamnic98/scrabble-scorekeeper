import { useEffect } from 'react'

import type { WordDirection, Tile, TilePlacement, LetterCounts } from '@scrabble/engine'
import { Coords } from 'types/global'

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
            onSelectSquare(null)
            onSetDirection(null)
          }
          return
        }
        case 'Escape': {
          e.preventDefault()
          onSelectSquare(null)
          onSetDirection(null)
          return
        }
        case 'Backspace': {
          e.preventDefault()
          if (placements.length === 0) {
            onSelectSquare(null)
            onSetDirection(null)
            return
          }

          const hasCurrentPlacement = placements.some((p) => p.row === row && p.col === col)

          if (hasCurrentPlacement) {
            onRemoveTile({ row, col })
          } else {
            const prevCoords = getCoordsInDirection(row, col, wordDirection, -1)
            if (prevCoords) {
              const hasPrevPlacement = placements.some(
                (p) => p.row === prevCoords.row && p.col === prevCoords.col
              )
              if (hasPrevPlacement) {
                onRemoveTile(prevCoords)
              }
              onSelectSquare(prevCoords)
            }
          }
          return
        }
      }

      // --- 2. LETTER TYPING (A-Z) ---
      const typedChar = e.key.toUpperCase()
      if (/^[A-Z]$/.test(typedChar)) {
        e.preventDefault()

        // Skip if no remaining tile
        if (remainingLetters[e.key] === 0) {
          return
        }
        if (placements.length === 7) {
          return
        }

        if (placements.length === 1 && wordDirection === null) {
          return
        }

        // 1. If active square already has a committed board tile, advance cursor to the next empty square first
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

        // 2. Check if matching tile is in active player rack
        const isTilePlaced = (tId: string) =>
          placements.some((p: any) => p.tileId === tId || p.tile?.id === tId)

        const unplacedRackTiles = (rack || []).filter((t: any) => !isTilePlaced(t.id || t.tileId))

        const matched =
          unplacedRackTiles.find(
            (t: any) =>
              (typeof t === 'string' && t.toUpperCase() === typedChar) ||
              t.letter?.toUpperCase() === typedChar ||
              t.char?.toUpperCase() === typedChar
          ) || unplacedRackTiles.find((t: any) => t.isBlank || t.letter === ' ' || !t.letter)

        // 3. Construct Tile payload (with fallback if not found in rack)
        let tileToPlace: Tile

        if (matched) {
          tileToPlace =
            typeof matched === 'string'
              ? ({ id: `tile-${typedChar}-${Date.now()}`, letter: typedChar } as Tile)
              : matched.isBlank
                ? { ...matched, letter: typedChar }
                : matched
        } else {
          // Fallback tile so typing never silently fails
          tileToPlace = {
            id: `tile-${targetRow}-${targetCol}-${typedChar}-${Date.now()}`,
            letter: typedChar
          } as Tile
        }

        // 4. Dispatch placement to the current/target square
        onPlaceTile({
          row: targetRow,
          col: targetCol,
          tile: tileToPlace
        })

        // 5. Advance cursor to the next available empty square
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

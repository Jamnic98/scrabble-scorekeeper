import React, { useEffect, useRef } from 'react'

import { getLetterPoints, LetterCounts, type Tile as TileModel } from '@scrabble/engine'
import { Tile } from 'components'
import { useGame } from 'hooks'

export interface RackProps {
  /** Array of tiles currently on the rack */
  tiles: TileModel[]
  /** Maximum slots on the rack (default: 7) */
  maxTiles?: number
  /** Enables keyboard input and tile removal */
  editable?: boolean
  /** Callback fired when tiles are added or removed in editable mode */
  onChange?: (tiles: TileModel[]) => void
  /** Currently selected tile index (for highlight during play) */
  selectedIndex?: number | null
  /** Click callback for a specific tile */
  onTileClick?: (tile: TileModel, index: number) => void
  className?: string
}

const Rack: React.FC<RackProps> = ({
  tiles,
  maxTiles = 7,
  editable = false,
  onChange,
  selectedIndex,
  onTileClick,
  className = ''
}) => {
  const rackRef = useRef<HTMLDivElement>(null)
  const { state } = useGame()

  // 🎹 Handle physical keyboard input when in `editable` mode
  useEffect(() => {
    if (!editable || !onChange) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing into standard input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return

      // Handle Tile Removal
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        onChange(tiles.slice(0, -1))
        return
      }

      const char = e.key.toUpperCase()
      const isBlank = e.key === ' ' || e.key === '?'
      const isLetter = /^[A-Z]$/.test(char)

      if ((isLetter || isBlank) && tiles.length < maxTiles) {
        const letterToVerify = isBlank ? ' ' : char

        // 1. Copy the remaining letter counts into the local pool
        const availablePool: Record<string, number> = {}
        const remainingLettersMap: LetterCounts = state?.remainingLetters ?? {}

        for (const [letter, count] of Object.entries(remainingLettersMap)) {
          const key = letter.toUpperCase()
          availablePool[key] = count
        }

        // 2. Subtract tiles already added to this rack input
        for (const existingTile of tiles) {
          const key = (existingTile.isBlank ? ' ' : existingTile.letter).toUpperCase()
          if (availablePool[key]) {
            availablePool[key] -= 1
          }
        }

        // 3. Check if requested tile is available
        const countRemainingForChar = availablePool[letterToVerify] ?? 0
        if (countRemainingForChar <= 0) {
          // Block input if tile isn't available in remaining letters
          return
        }

        e.preventDefault()
        const points = getLetterPoints(letterToVerify, isBlank)

        const newTile: TileModel = {
          id: `rack-input-${letterToVerify}-${Date.now()}-${Math.random()}`,
          letter: letterToVerify,
          points,
          isBlank
        }

        onChange([...tiles, newTile])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editable, onChange, tiles, maxTiles, state?.remainingLetters])

  // Click a tile to remove it (in editable mode) or select it
  const handleTileClick = (tile: TileModel, index: number) => {
    if (editable && onChange) {
      const nextTiles = [...tiles]
      nextTiles.splice(index, 1)
      onChange(nextTiles)
    } else if (onTileClick) {
      onTileClick(tile, index)
    }
  }

  // Create fixed slots for visual rack consistency
  const filledSlots = Array.from({ length: maxTiles }).map((_, index) => tiles[index] ?? null)

  return (
    <div
      ref={rackRef}
      tabIndex={editable ? 0 : -1}
      className={`relative flex items-center justify-center gap-1.5 rounded-lg border-4 border-[#5c3a1e] bg-[#8b5a2b] p-3 shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`}
    >
      {/* Visual Wooden Rack Shelf Base */}
      <div className="absolute inset-x-0 bottom-0 h-2 bg-[#422813]/60 rounded-b-sm" />

      {filledSlots.map((tile, index) => (
        <div
          key={tile?.id ?? `empty-slot-${index}`}
          className="relative flex items-center justify-center w-10 h-10"
        >
          {tile ? (
            <Tile
              tile={tile}
              className={`w-10 h-10 transition-transform ${
                selectedIndex === index ? '-translate-y-2 ring-2 ring-yellow-400' : ''
              }`}
              onClick={() => handleTileClick(tile, index)}
            />
          ) : (
            /* Empty rack slot placeholder */
            <div className="w-10 h-10 rounded-sm border-2 border-dashed border-[#5c3a1e]/50 bg-[#6d441f]/30" />
          )}
        </div>
      ))}
    </div>
  )
}

export default Rack

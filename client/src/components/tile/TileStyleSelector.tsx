import React from 'react'
import { Tile } from 'components'
import { getLetterValue } from 'utils'

type TileStyle = 'mono' | 'serif' | 'sans'

const TILE_STYLE_OPTIONS: { value: TileStyle; label: string }[] = [
  { value: 'mono', label: 'Mono' },
  { value: 'serif', label: 'Serif' },
  { value: 'sans', label: 'Sans' }
]

export interface TileStyleSelectorProps {
  selected: TileStyle
  onChange: (style: TileStyle) => void
}

export const TileStyleSelector: React.FC<TileStyleSelectorProps> = ({ selected, onChange }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">Tile Style</p>
      <div className="flex gap-3">
        {TILE_STYLE_OPTIONS.map((option) => {
          const isSelected = selected === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="flex flex-col items-center gap-1.5 rounded-lg p-2 cursor-pointer"
            >
              <Tile
                tile={{
                  id: `preview-${option.value}`,
                  letter: 'Q',
                  points: getLetterValue('Q'),
                  isBlank: false
                }}
                style={option.value}
                unavailable={!isSelected}
                className="w-9.5 h-9.5"
              />
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  isSelected ? 'text-amber-700' : 'text-neutral-500'
                }`}
              >
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TileStyleSelector

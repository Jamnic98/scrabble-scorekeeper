import React, { useRef, useState } from 'react'
import { type Player } from '../../App'
import { capatalizeText } from '../../utils/helpers'

export interface PlayerEntryWidgetProps {
  setPlayers: (players: Player[]) => void
}

export const PlayerEntryWidget: React.FC<PlayerEntryWidgetProps> = ({ setPlayers }) => {
  const PPM_SIZE = 18
  const nameInputRef = useRef<HTMLInputElement | null>(null)
  const [playerNames, setPlayerNames] = useState<string[]>([])

  const handleGenerateButton = () => {
    const numberOfPlayers = playerNames.length
    if (2 <= numberOfPlayers && numberOfPlayers <= 4) {
      setPlayers(
        playerNames.map((playerName, index: number) => {
          return {
            name: playerName,
            pointsPerMove: Array(PPM_SIZE).fill(null),
            isCurrentPlayer: index === 0,
          }
        })
      )
    } else {
      alert('Not enough players.')
    }
  }

  const handleAddPlayer = () => {
    const playerName = nameInputRef.current?.value ?? ''
    if (playerName.trim() === '') return
    if (isPlayerNameValid(playerName)) {
      addNameToPlayerNames(playerName)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddPlayer()
    }
  }

  const addNameToPlayerNames = (name: string) => {
    switch (playerNames.length) {
      case 0:
      case 1:
      case 2:
      case 3:
        setPlayerNames((prevNames) => {
          const newNames = [...prevNames, name.trim()]
          if (null !== nameInputRef.current) {
            nameInputRef.current.value = ''
          }
          return newNames
        })
        break
      default:
        alert('4 players maximum.')
    }
  }

  const handleRemovePlayer = (indexToRemove: number) => {
    setPlayerNames((prevNames) => prevNames.filter((_, index) => index !== indexToRemove))
  }

  const isPlayerNameValid = (playerName: string) => {
    const captalizedPlayerName = capatalizeText(playerName.trim())
    if (playerNames.includes(captalizedPlayerName)) {
      alert(`Player name '${captalizedPlayerName}' taken.`)
      return false
    }
    return true
  }

  return (
    <div
      id="player-entry-widget"
      className="flex flex-col gap-5 max-w-sm p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Add players</h1>
        <p className="text-sm text-gray-500 mt-0.5">Enter names in turn order</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Player name"
          onKeyDown={handleKeyPress}
          ref={nameInputRef}
          className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
        />
        <button
          onClick={handleAddPlayer}
          className="shrink-0 px-4 text-sm font-semibold text-gray-900 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
        >
          Enter
        </button>
      </div>

      {playerNames.length > 0 && (
        <ol className="flex flex-col gap-2">
          {playerNames.map((name: string, index: number) => (
            <li
              key={index}
              className="flex items-center gap-3 text-sm text-gray-800 bg-gray-50 rounded-lg pl-3 pr-2 py-2"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-xs font-medium shrink-0">
                {index + 1}
              </span>
              <span className="flex-1">{name}</span>
              <button
                onClick={() => handleRemovePlayer(index)}
                aria-label={`Remove ${name}`}
                className="flex items-center justify-center w-5 h-5 rounded-full text-gray-400 cursor-pointer hover:bg-gray-200 hover:text-gray-700 transition-colors shrink-0"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}

      <button
        id="generate-table-button"
        onClick={handleGenerateButton}
        className="uppercase text-sm font-semibold tracking-wide bg-gray-900 text-white rounded-lg py-2.5 cursor-pointer hover:bg-gray-700 transition-colors"
      >
        Generate
      </button>
    </div>
  )
}

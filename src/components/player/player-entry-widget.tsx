import React, { useRef, useState } from 'react'
import { type Player } from '../../App'
import { capatalizeText } from '../../utils/helpers'
import './player-entry-widget.css'

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // is enter key pressed
    if (e.key === 'Enter') {
      const playerName = e.currentTarget.value
      if (isPlayerNameValid(playerName)) {
        addNameToPlayerNames(playerName)
      }
    }
  }

  const addNameToPlayerNames = (name: string) => {
    switch (playerNames.length) {
      case 0:
      case 1:
      case 2:
      case 3:
        // Use functional form of setPlayerNames to ensure the latest state
        setPlayerNames((prevNames) => {
          const newNames = [...prevNames, capatalizeText(name.trim())]
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

  const isPlayerNameValid = (playerName: string) => {
    const captalizedPlayerName = capatalizeText(playerName.trim())
    if (playerNames.includes(captalizedPlayerName)) {
      alert(`Player name '${captalizedPlayerName}' taken.`)
      return false
    }
    return true
  }

  return (
    <div id="player-entry-widget">
      <h1>
        <u>
          <b>Enter players in turn order:</b>
        </u>
      </h1>
      <label>
        Name:
        <input type="text" onKeyDown={handleKeyPress} ref={nameInputRef} />
      </label>
      <br />
      <br />
      <h2>
        <u>Players:</u>
      </h2>
      <ol>
        {playerNames.map((name: string, index: number) => (
          <li key={index}>{name}</li>
        ))}
      </ol>
      <button id="generate-table-button" className="btn" onClick={handleGenerateButton}>
        GENERATE
        <br />
      </button>
    </div>
  )
}

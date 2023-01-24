import React, { useRef, useState } from 'react'
import './player-entry-widget.css'

interface RefProps {
  value: string | null
}

export interface PlayerEntryWidgetProps {
  players: any
  setPlayers: any
}

export const PlayerEntryWidget: React.FC<PlayerEntryWidgetProps> = ({
  players,
  setPlayers
}) => {
  const PPM_SIZE = 18
  const nameInputRef = useRef<RefProps>({ value: '' })
  const [playerNames, setPlayerNames]: any[] = useState([])

  const handleGenerateButton = () => {
    const numberOfPlayers = playerNames.length
    if (2 <= numberOfPlayers && numberOfPlayers <= 4) {
      setPlayers(
        playerNames.map((playerName: string, index: number) => {
          return {
            name: playerName,
            pointsPerMove: Array(PPM_SIZE).fill(null),
            isCurrentPlayer: index === 0
          }
        })
      )
    } else {
      alert('Not enough players.')
    }
  }

  const handleKeyPress = (e) => {
    // is enter key pressed
    if (e.keyCode === 13) {
      const playerName = e.target.value
      if (isPlayerNameValid(playerName)) {
        addNameToPlayerNames(playerName)
      }
    }
  }

  const addNameToPlayerNames = (playerName) => {
    switch (playerNames.length) {
      case 0:
      case 1:
      case 2:
      case 3:
        setPlayerNames([...playerNames, capatalizeText(playerName.trim())])
        break
      default:
        alert('4 players maximum.')
    }

    nameInputRef.current.value = ''
  }

  const isPlayerNameValid = (playerName) => {
    const captalizedPlayerName = capatalizeText(playerName.trim())
    if (playerNames.includes(captalizedPlayerName)) {
      alert(`Player name '${captalizedPlayerName}' taken.`)
      return false
    }

    // regex to match words with spaces between
    const re = /^[a-zA-Z]+([a-zA-Z]+)*$/
    if (re.test(playerName)) {
      return true
    } else {
      alert(`'${playerName}' is not a valid player name.`)
      return false
    }
  }

  const capatalizeText = (text) => {
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return players.length === 0 ? (
    <div id='player-entry-widget'>
      <h1>
        <u>
          <b>Enter players in turn order:</b>
        </u>
      </h1>
      <label>
        Name:
        <input
          id='name-input'
          type='text'
          onKeyUp={(e) => handleKeyPress(e)}
          // TODO:: fix
          // ref={nameInputRef}
        />
      </label>
      <br />
      <br />
      <h2>
        <u>Players:</u>
      </h2>
      <ol>
        {playerNames.map((name, index) => {
          return <li key={index}>{name}</li>
        })}
      </ol>
      <button
        id='generate-table-button'
        className='btn'
        onClick={() => handleGenerateButton()}
      >
        GENERATE
        <br />
      </button>
    </div>
  ) : null
}

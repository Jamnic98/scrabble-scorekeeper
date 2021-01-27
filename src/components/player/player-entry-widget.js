import React, { useRef, useState } from "react"
import "./player-entry-widget.css"

function PlayerEntryWidget({ players, setPlayers }) {

  const PPM_SIZE = 18;
  const nameInputRef = useRef()
  const [playerNames, setPlayerNames] = useState([])

  const handleGenerateButton = () => {
    const numberOfPlayers = playerNames.length
    if (2 <= numberOfPlayers && numberOfPlayers <= 4) {
      setPlayers(playerNames.map((_name, i) => {
        return {
          name: _name,
          pointsPerMove: Array(PPM_SIZE).fill(null),
          isCurrentPlayer: i === 0,
        };
      }))
    } else {
      alert("Not enough players.")
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
      case 0: case 1: case 2: case 3:
        setPlayerNames([...playerNames, capatalizeText(playerName.trim())])
        break;
      default:
        alert("4 players maximum.")
    }
    nameInputRef.current.value = ""
  }

  const isPlayerNameValid = (playerName) => {
    const captalizedPlayerName = capatalizeText(playerName.trim())
    if (playerNames.includes(captalizedPlayerName)) {
      alert(`Player name '${captalizedPlayerName}' taken.`)
      return false;
    }

    // regex to match words with spaces between
    const re = /^[a-zA-Z]+([a-zA-Z]+)*$/
    if (re.test(playerName)) {
      return true;
    } else {
      alert(`'${playerName}' is not a valid player name.`)
      return false;
    }
  }

  const capatalizeText = (text) => {
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const setOutput = () => {
    if (players.length === 0) {
      return (
        <div id="player-entry-widget">
          <h1>
            <u><b>Enter players in turn order:</b></u>
          </h1>
          <label>
            Name:
            <input
              id="name-input"
              type="text"
              onKeyUp={(e) => handleKeyPress(e)}
              maxLength="6"
              ref={nameInputRef}
            />
          </label>
          <br />
          <br />
          <h2>
            <u>Players:</u>
          </h2>
          <ol>{playerNames.map((name, index) => {
            return <li key={index}>{name}</li>;
          })}
          </ol>
          <button
            id="generate-table-button"
            className="btn"
            onClick={() => handleGenerateButton()}
          >
            GENERATE<br />
          </button>
        </div>
      );
    } else {
      return null;
    }
  }

  return setOutput();
}

export default PlayerEntryWidget

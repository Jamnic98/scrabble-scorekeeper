import React, { useEffect } from "react"
import Column from "./column"
import "./table.css"

function Table({ players }) {

  const setOutput = () => {
    const numberOfPlayers = players.length
    if (numberOfPlayers > 0) {
      return (
        <div id="table">
          {players.map((player, index) => (
            <Column
              key={index}
              player={player}
              numberOfPlayers={numberOfPlayers}
            />
          ))}
        </div>
      );
    } else {
      return null;
    }
  }

  return setOutput();
}

export default Table

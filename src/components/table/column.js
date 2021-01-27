import React from "react"
import "./column.css"

function Column({ player, numberOfPlayers }) {

  const getCumulativeScore = (pointsIndex) => {
    const nullIndex = player.pointsPerMove.indexOf(null)
    if (nullIndex > pointsIndex || nullIndex === -1) {
      // sum points
      return player.pointsPerMove.slice(0, ++pointsIndex).reduce((a, b) => a + b, 0);
    } else {
      return null;
    }
  }

  const setTableRow = () => {
    return player.pointsPerMove.map((points, pointsIndex) =>
      <tr key={pointsIndex}>
        <td className="left-column">{points}</td>
        <td className="right-column">{getCumulativeScore(pointsIndex)}</td>
      </tr>
    );
  }

  return (
    <table style={{ width: 460 / numberOfPlayers }}>
      <thead>
        <tr>
          <th className={`${player.isCurrentPlayer ? "highlighted" : ""} main-column-title`} colSpan="2">
            {player.name}
          </th>
        </tr>
        <tr>
          <th className="sub-column-title">Turn</th>
          <th className="sub-column-title">Sum</th>
        </tr>
      </thead>
      <tbody>
        {setTableRow()}
      </tbody>
    </table>
  );
}

export default Column

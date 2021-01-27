import React from "react"
import "./side-bar.css"

function SideBar({ wordDirection, handleRightArrow,
    handleDownArrow, letters, setLetters,
    activeSquareCoords, setActiveSquareCoords,
    increaseNumberOfSkips, generalReset,
    setBoardState, lastBoardState, setLastBoardState,
    turnCount, setTurnCount,
    players, setPlayers, getCurrentPlayer,
    skipCount, setSkipCount,
    remainingLetters, setRemainingLetters,
}) {

    const handleUndoButton = () => {

        if (lastBoardState.length <= 1) {
            setBoardState(lastBoardState[lastBoardState.length - 1])
        } else {
            const lbs = lastBoardState[lastBoardState.length - 2]
            setLastBoardState(lastBoardState.slice(0, lastBoardState.length - 1))
            setBoardState(lbs)
        }

        const updatedPlayers = undoLastPlayerScore()
        setPlayers(updatedPlayers)

        const lettersAdded = getLettersAdded()
        addTiles(lettersAdded)

        setActiveSquareCoords([])
        setLetters([])
        setTurnCount(turnCount - 1)
    }

    const undoLastPlayerScore = () => {
        const currentPlayerIndex = players.indexOf(getCurrentPlayer(players))
        const previousPlayerIndex = currentPlayerIndex === 0 ? players.length - 1 : currentPlayerIndex - 1

        const updatedPlayers = players.map((player, playerIndex) => {
            player.isCurrentPlayer = playerIndex === previousPlayerIndex
            if (player.isCurrentPlayer) {
                player.pointsPerMove = updatePlayerPoints(player.pointsPerMove)
            }
            return player;
        })
        return updatedPlayers;
    }

    const getLettersAdded = () => {
        const previousBoardState = lastBoardState[lastBoardState.length - 1]
        const ppBS = lastBoardState[lastBoardState.length - 2]
        let lettersAdded = []
        previousBoardState.map((row, rowIndex) => {
            return row.map((square, squareIndex) => {
                const l = ppBS[rowIndex][squareIndex].letter
                if (square.letter !== l) {
                    lettersAdded.push(square)
                }
            });
        })
        return lettersAdded;
    }

    const updatePlayerPoints = (playerPoints) => {
        let nullIndex = playerPoints.indexOf(null)
        if (nullIndex === -1) {
            nullIndex = playerPoints.length
        }

        const updatedPoints = playerPoints.map((points, pointsIndex) => {
            if (pointsIndex === nullIndex - 1) {
                if (points === 0) {
                    setSkipCount(skipCount - 1)
                }
                return null;
            } else return points;
        })
        return updatedPoints;
    }

    const addTiles = (lettersAdded) => {
        const lettersRemaining = { ...remainingLetters }
        lettersAdded.map((letterObj) => {
            if (letterObj.isBlank) {
                lettersRemaining[" "] += 1
            } else {
                lettersRemaining[letterObj.letter] += 1
            }
        })
        setRemainingLetters(lettersRemaining)
    }

    return (
        <div id="side-bar">
            <div id="arrows">
                <button
                    onMouseDown={(e) => handleRightArrow(e)}
                    className="btn"
                    disabled={wordDirection === "right" || letters.length > 0 || activeSquareCoords.length === 0}>
                    <div id="right-arrow" className="right"></div>
                </button>
                <br />
                <button
                    onMouseDown={(e) => handleDownArrow(e)}
                    className="btn"
                    disabled={wordDirection === "down" || letters.length > 0 || activeSquareCoords.length === 0}>
                    <div id="down-arrow" className="down"></div>
                </button>
            </div>
            <br />
            <button id="skip-button" className="btn" disabled={letters.length > 0} onMouseUp={() => {
                increaseNumberOfSkips()
                generalReset()
            }}>
                <b>SKIP<br />TURN</b>
            </button>
            <br />
            <button id="undo-button" className="btn" disabled={letters.length > 0 || turnCount === 0} onMouseUp={() => {
                handleUndoButton()
            }}>
                <b>UNDO<br />LAST<br />MOVE</b>
            </button>
        </div>
    );
}

export default SideBar

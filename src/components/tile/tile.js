import React from 'react'
import "./tile.css"

function Tile({ square }) {

    const getLetterValue = (letter) => {
        switch (letter.toLowerCase()) {
            case 'a': case 'e': case 'i': case 'l': case 'n': case 'o': case 'r': case 's': case 't': case 'u':
                return 1;
            case 'd': case 'g':
                return 2;
            case 'b': case 'c': case 'm': case 'p':
                return 3;
            case 'f': case 'h': case 'v': case 'w': case 'y':
                return 4;
            case 'k':
                return 5;
            case 'j': case 'x':
                return 8;
            case 'q': case 'z':
                return 10;
            case ' ':
                return 0;
            default:
                return null;
        }
    }

    const setOutput = () => {
        const { letter, isBlank } = square
        if (letter !== "") {
            return (
                <div className="tile">
                    <div className="tile-letter">{letter.toUpperCase()}</div>
                    <div className="tile-value">{(isBlank) ? null : getLetterValue(letter)}</div>
                </div>
            );
        } else {
            return null;
        }
    }

    return setOutput();
}

export default Tile

import React from "react";
import "./tile.css";

export interface TileProps {
  letter: string;
  isBlank: boolean;
}

const getLetterValue = (letter: string) => {
  const lowerCaseLetter = letter.toLowerCase();
  if (
    ["a", "e", "i", "l", "n", "o", "r", "s", "t", "u"].includes(lowerCaseLetter)
  ) {
    return 1;
  } else if (["d", "g"].includes(lowerCaseLetter)) {
    return 2;
  } else if (["b", "c", "m", "p"].includes(lowerCaseLetter)) {
    return 3;
  } else if (["f", "h", "v", "w", "y"].includes(lowerCaseLetter)) {
    return 4;
  } else if ("k" === lowerCaseLetter) {
    return 5;
  } else if (["j", "x"].includes(lowerCaseLetter)) {
    return 8;
  } else if (["q", "z"].includes(lowerCaseLetter)) {
    return 10;
  } else if (" " === lowerCaseLetter) {
    return 0;
  } else {
    return -1;
  }
};

export const Tile = ({ letter, isBlank }: TileProps) => {
  return letter !== "" ? (
    <div className="tile">
      <div className="tile-letter">{letter.toUpperCase()}</div>
      <div className="tile-value">
        {/* display digit */}
        {isBlank ? null : getLetterValue(letter)}
      </div>
    </div>
  ) : null;
};

// import type { Word } from "./types";
// import { LETTER_DISTRIBUTION } from "./constants";

// export function calculateWordScore(word: Word, multipliers = {}) {
//   // Pure function: no React dependencies, 100% unit-testable!
//   let wordScore = 0;
//   let wordMultiplier = 1;

//   for (let i = 0; i < word.length; i++) {
//     const letter = word[i].letter.toUpperCase();
//     let letterScore = LETTER_DISTRIBUTION[letter].value || 0;

//     // Apply letter multipliers (e.g., Double Letter, Triple Letter)
//     if (multipliers.letterMultipliers?.[i]) {
//       letterScore *= multipliers.letterMultipliers[i];
//     }
//     wordScore += letterScore;
//   }

//   // Apply word multipliers (e.g., Double Word, Triple Word)
//   if (multipliers.wordMultiplier) {
//     wordScore *= multipliers.wordMultiplier;
//   }

//   // Bingo bonus (using all 7 tiles)
//   if (word.length >= 7) {
//     wordScore += 50;
//   }

//   return wordScore;
// }

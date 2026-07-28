// import { calculateWordScore } from "./scrabbleLogic";
import type { GameAction, GameState /* Player */ } from './types'

export const initialGameState: GameState = {
  players: [
    { name: 'Player 1', turnScores: [] },
    { name: 'Player 2', turnScores: [] }
  ],
  activePlayerIndex: 0,
  history: [],
  roomCode: '',
  board: []
}

export function gameReducer(state: GameState, action: GameAction) {
  switch (action.type) {
    /*     case "SUBMIT_WORD": {
      const { word, multipliers } = action.payload;
      const score = calculateWordScore(word, multipliers);
      const currentPlayer = state.players[state.activePlayerIndex];

      const updatedPlayers = state.players.map((p, idx) =>
        idx === state.activePlayerIndex ? { ...p, score: p.score + score } : p,
      );

      return {
        ...state,
        players: updatedPlayers,
        activePlayerIndex: (state.activePlayerIndex + 1) % state.players.length,
        history: [
          ...state.history,
          { player: currentPlayer.name, word, score, timestamp: Date.now() },
        ],
      };
    } */

    /* case "UNDO_LAST_TURN": {
      if (state.history.length === 0) return state;
      const lastTurn = state.history[state.history.length - 1];
      const prevPlayerIndex =
        (state.activePlayerIndex - 1 + state.players.length) %
        state.players.length;

      return {
        ...state,
        activePlayerIndex: prevPlayerIndex,
        history: state.history.slice(0, -1),
        players: state.players.map((p, idx) =>
          idx === prevPlayerIndex
            ? { ...p, score: p.score - lastTurn.score }
            : p,
        ),
      };
    } */

    default:
      return state
  }
}

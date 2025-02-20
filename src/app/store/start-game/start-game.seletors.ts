import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './start-game.reducer';

export const START_GAME_STATE_NAME = 'start-game';

export const selectGameState = createFeatureSelector<GameState>(
    START_GAME_STATE_NAME,
);

// export const selectGameCode = createSelector(
//     selectGameState,
//     (state) => state.gameCode,
// );

export const selectGameId = createSelector(
    selectGameState,
    (state) => state.games.map((game) => game.gameId), // Adjusted for multiple games
);

export const selectStartGameLoading = createSelector(
    selectGameState,
    (state) => state.loading,
);

export const selectSelectionsError = createSelector(
    selectGameState,
    (state) => state.error,
);

export const selectGameUrl = createSelector(selectGameState, (state) =>
    state.games.length > 0 ? state.games[0].gameCode : '',
);

export const selectUserGames = createSelector(
    selectGameState,
    (state) => state.games,
);

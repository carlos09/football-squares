import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './start-game.reducer';
export const START_GAME_STATE_NAME = 'start-game';

export const selectGameState = createFeatureSelector<GameState>(START_GAME_STATE_NAME);

export const selectGameId = createSelector(
    selectGameState,
  (state) => state.gameId
);

export const selectStartGameLoading = createSelector(
    selectGameState,
  (state) => state.loading
);

export const selectSelectionsError = createSelector(
    selectGameState,
  (state) => state.error
);

export const selectUserId = createSelector(
    selectGameState,
    (state) => {
        console.log('selectGameState state: ', state.userId);
        return state.userId}
  );
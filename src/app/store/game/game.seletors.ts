import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './game.reducer';
import { selectSelectionsState } from '../selections/selections.selectors';

export const GAME_STATE_NAME = 'game';

export const selectGameState =
    createFeatureSelector<GameState>(GAME_STATE_NAME);

export const selectGameCode = createSelector(
    selectGameState,
    (state) => state.gameCode,
);

export const selectGameId = createSelector(
    selectGameState,
    (state) => state.gameId ?? '',
);

export const selectRoleId = createSelector(
    selectGameState,
    (state) => state.roleId,
);

export const selectGameLoading = createSelector(
    selectGameState,
    (state) => state.loading,
);

export const selectGameError = createSelector(
    selectGameState,
    (state) => state.error,
);

export const selectGameUrl = createSelector(
    selectGameState,
    (state) => state.gameCode ?? '',
);

// export const selectGameWithSelections = createSelector(
//     selectGameState, // Selects the current game
//     selectSelectionsState, // Selects the selected squares
//     (gameState, selectionState) => ({
//         ...gameState,
//         selectedSquares: selectionState.selectedSquareIds,
//     }),
// );

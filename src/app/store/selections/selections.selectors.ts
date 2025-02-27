import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SelectionsState } from './selections.reducer';
import { selectGameState } from '../game/game.seletors';
export const SELECTIONS_STATE_NAME = 'selections';

export const selectSelectionsState = createFeatureSelector<SelectionsState>(
    SELECTIONS_STATE_NAME,
);

export const selectSelectedSquareIds = createSelector(
    selectSelectionsState,
    (state) => state?.selectedSquareIds || [],
);

export const selectSelectionsLoading = createSelector(
    selectSelectionsState,
    (state) => state.loading,
);

export const selectSelectionsError = createSelector(
    selectSelectionsState,
    (state) => state.error,
);

export const selectSelectedSquares = createSelector(
    selectSelectionsState,
    (state) => state.selectedSquareIds,
);

// Combine game details with selected squares
export const selectGameWithSelections = createSelector(
    selectGameState,
    selectSelectionsState,
    (game, selectedSquares) => ({
        ...game,
        selectedSquares,
    }),
);

export const selectHasChanges = createSelector(
    selectSelectionsState,
    (selection) => selection.hasChanges,
);

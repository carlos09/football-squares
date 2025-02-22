import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SelectionsState } from './selections.reducer';
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

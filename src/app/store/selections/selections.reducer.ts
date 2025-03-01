import { createReducer, on } from '@ngrx/store';
import * as SelectionsActions from './selections.actions';

export interface SelectionsState {
    selectedSquareIds: number[];
    hasChanges: boolean;
    loading: boolean;
    error: any;
}

export const initialState: SelectionsState = {
    selectedSquareIds: [],
    hasChanges: false,
    loading: false,
    error: null,
};

export const selectionsReducer = createReducer(
    initialState,
    on(SelectionsActions.loadSelections, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(SelectionsActions.loadSelectionsSuccess, (state, { selections }) => ({
        ...state,
        selectedSquareIds: selections,
        loading: false,
    })),
    on(SelectionsActions.loadSelectionsFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false,
    })),

    on(SelectionsActions.fetchSelectedSquares, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(
        SelectionsActions.fetchSelectedSquaresSuccess,
        (state, { selectedSquareIds }) => ({
            ...state,
            selectedSquareIds: Array.isArray(selectedSquareIds)
                ? selectedSquareIds.map((id) => Number(id))
                : [], // Default to an empty array if invalid
            loading: false,
            error: null,
        }),
    ),

    on(SelectionsActions.fetchSelectedSquaresFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
    on(
        SelectionsActions.updateSelectedSquares,
        (state, { selectedSquareIds }) => {
            const hasChanges =
                JSON.stringify(state.selectedSquareIds) !==
                JSON.stringify(selectedSquareIds);
            return {
                ...state,
                selectedSquareIds,
                hasChanges: hasChanges,
            };
        },
    ),

    on(SelectionsActions.saveSelectedSquares, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(SelectionsActions.saveSelectedSquaresSuccess, (state) => ({
        ...state,
        selectedSquareIds: [],
        hasChanges: false,
        loading: false,
        error: null, // Reset errors on success
    })),

    on(SelectionsActions.saveSelectedSquaresFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error, // Store the error message
    })),
);

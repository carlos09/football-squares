import { createAction, props } from '@ngrx/store';

export const loadSelections = createAction(
    '[Selections Component] Load Selections',
    props<{ userId: string; gameId: string }>(),
);

export const loadSelectionsSuccess = createAction(
    '[Selections API] Load Selections Success',
    props<{ selections: number[] }>(),
);

export const loadSelectionsFailure = createAction(
    '[Selections API] Load Selections Failure',
    props<{ error: any }>(),
);

export const saveSelectedSquares = createAction(
    '[Selections Component] Save Squares Selection',
    props<{
        gameId: string | null;
        userId: string | undefined;
        selectedSquareIds: number[];
    }>(),
);

export const saveSelectedSquaresSuccess = createAction(
    '[Selections API] Save Squares Selection Success',
);

export const saveSelectedSquaresFailure = createAction(
    '[Selections API] Save Squares Selection Failure',
    props<{ error: any }>(),
);

export const fetchSelectedSquares = createAction(
    '[Selection] Fetch Selected Squares',
    props<{ gameId: string | null; userId: string | undefined }>(),
);

// Success case
export const fetchSelectedSquaresSuccess = createAction(
    '[Selection] Fetch Selected Squares Success',
    props<{ selectedSquareIds: number[] }>(),
);

// Failure case
export const fetchSelectedSquaresFailure = createAction(
    '[Selection] Fetch Selected Squares Failure',
    props<{ error: string }>(),
);

export const updateSelectedSquares = createAction(
    '[Selections Component] Update Selected Squares',
    props<{ selectedSquareIds: number[] }>(),
);

export const checkForHasChanges = createAction(
    '[Selections Component] Check for Has Changes in Fetched Squares & Squares Selected',
);

export const clearSelections = createAction(
    '[Selections Component] Clear Square Selections',
);

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
    props<{ gameId: string; userId: string; selectedSquareIds: number[] }>(),
);

export const saveSelectedSquaresSuccess = createAction(
    '[Selections API] Save Squares Selection Success',
    props<{ userId: string }>(),
);

export const saveSelectedSquaresFailure = createAction(
    '[Selections API] Save Squares Selection Failure',
    props<{ error: any }>(),
);

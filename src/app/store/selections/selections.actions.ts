import { createAction, props } from '@ngrx/store';

export const loadSelections = createAction(
  '[Selections] Load Selections',
  props<{ userId: string }>()
);

export const loadSelectionsSuccess = createAction(
  '[Selections] Load Selections Success',
  props<{ selections: number[] }>() // Store only square_ids
);

export const loadSelectionsFailure = createAction(
  '[Selections] Load Selections Failure',
  props<{ error: any }>()
);

import { createAction, props } from '@ngrx/store';

export const showSnackbar = createAction(
    '[Snackbar] Show Message',
    props<{ message: string; action?: string; duration?: number }>(),
);

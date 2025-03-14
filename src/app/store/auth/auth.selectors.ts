import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const AUTH_STATE_NAME = 'auth';

export const selectAuthState =
    createFeatureSelector<AuthState>(AUTH_STATE_NAME);

export const selectAuthUser = createSelector(
    selectAuthState,
    (state) => state.userId,
);

export const selectAuthToken = createSelector(
    selectAuthState,
    (state) => state.token,
);

export const selectIsAuthenticated = createSelector(
    selectAuthState,
    (state) => state.isAuthenticated,
);

import { createAction, props } from '@ngrx/store';

// Load auth state from localStorage
export const loadAuthFromStorage = createAction(
    '[Auth] Load Auth From Storage',
);

// Success: Auth state loaded
export const loadAuthSuccess = createAction(
    '[Auth] Load Auth Success',
    props<{
        token: string;
        userId: string;
    }>(),
);

// Failure: No auth data found
export const loadAuthFailure = createAction(
    '[Auth] Load Auth Failure',
    props<{ error: string }>(),
);

// Login
export const login = createAction(
    '[Auth] Login',
    props<{ username: string; password: string }>(),
);

export const loginSuccess = createAction(
    '[Auth] Login Success',
    props<{
        token: string;
        userId: string;
        username: string;
        roleId: number;
    }>(),
);

export const loginFailure = createAction(
    '[Auth] Login Failure',
    props<{ error: string }>(),
);

// Logout
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

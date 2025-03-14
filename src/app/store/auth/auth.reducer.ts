import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
    userId: string | null;
}

export const initialState: AuthState = {
    isAuthenticated: false,
    token: null,
    userId: null,
};

export const authReducer = createReducer(
    initialState,
    on(AuthActions.loadAuthSuccess, (state, { token, userId }) => ({
        ...state,
        isAuthenticated: true,
        token,
        userId,
    })),
    on(AuthActions.loadAuthFailure, () => initialState),
    on(
        AuthActions.loginSuccess,
        (state, { token, userId, username, roleId }) => {
            console.log('userID', userId);
            return {
                ...state,
                isAuthenticated: true,
                token,
                userId,
                username,
                roleId,
            };
        },
    ),

    on(AuthActions.loginFailure, (state, { error }) => ({
        ...state,
        isAuthenticated: false,
        token: null,
        error,
    })),
    on(AuthActions.logoutSuccess, () => initialState),
);

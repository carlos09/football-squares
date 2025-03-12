import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { Game } from 'src/app/models/game.model';

export interface UserState {
    userId: string;
    username: string;
    // token: string | null;
    // isAuthenticated: boolean;
    roleId?: any;
    games: Game[];
    loading: boolean;
    error: string | null;
}

export const initialState: UserState = {
    userId: '',
    username: '',
    // token: null,
    // isAuthenticated: false,
    roleId: null,
    games: [],
    loading: false,
    error: null,
};

export const userReducer = createReducer(
    initialState,
    on(UserActions.createUser, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(
        UserActions.createUserSuccess,
        (state, { userId, username, roleId }) => ({
            ...state,
            loading: false,
            userId,
            username,
            roleId,
            error: null,
        }),
    ),
    on(UserActions.createUserFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
    on(UserActions.fetchUserSuccess, (state, { user, games }) => ({
        ...state,
        userId: user.userId,
        username: user.username,
        roleId: user.roleId,
        games,
        error: null,
    })),
    // on(
    //     UserActions.loginSuccess,
    //     (state, { userId, username, token, roleId }) => ({
    //         ...state,
    //         userId,
    //         username,
    //         token,
    //         roleId,
    //         isAuthenticated: true,
    //         error: null,
    //     }),
    // ),

    // on(UserActions.loginFailure, (state, { error }) => ({
    //     ...state,
    //     isAuthenticated: false,
    //     token: null,
    //     error,
    // })),

    on(UserActions.logout, () => ({
        ...initialState,
    })),
);

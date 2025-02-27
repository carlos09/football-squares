import { createReducer, on } from '@ngrx/store';
import {
    createUser,
    createUserSuccess,
    createUserFailure,
    fetchUser,
    fetchUserSuccess,
    fetchUserFailure,
} from './user.actions';
import { Game } from 'src/app/models/game.model';

export interface UserState {
    userId: string;
    username: string;
    roleId?: any;
    games: Game[];
    loading: boolean;
    error: string | null;
}

export const initialState: UserState = {
    userId: '',
    username: '',
    roleId: null,
    games: [],
    loading: false,
    error: null,
};

export const userReducer = createReducer(
    initialState,

    on(createUser, (state) => ({
        ...state,
        createUserSuccess: false,
        createUserError: null,
        loading: true,
        error: null,
    })),

    on(createUserSuccess, (state, { userId, username, roleId }) => ({
        ...state,
        loading: false,
        userId,
        username,
        roleId,
        games: [],
        error: null,
    })),

    on(createUserFailure, (state, { error }) => ({
        ...state,
        createUserSuccess: false,
        loading: false,
        error,
    })),
    on(fetchUser, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(fetchUserSuccess, (state, { user, games }) => {
        const newState: UserState = {
            ...state,
            userId: user.userId,
            username: user.username,
            roleId: user.roleId,
            games,
            error: null,
        };

        return newState;
    }),

    on(fetchUserFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
);

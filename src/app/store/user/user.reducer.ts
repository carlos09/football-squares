import { createReducer, on } from '@ngrx/store';
import {
    createUser,
    createUserSuccess,
    createUserFailure,
    fetchUser,
    fetchUserSuccess,
    fetchUserFailure,
} from './user.actions';
import { User } from 'src/app/models/userinfo.model';
import { Game } from 'src/app/models/game.model';

export interface UserState {
    user: User | null;
    games: Game[];
    loading: boolean;
    error: string | null;
}

export const initialState: UserState = {
    user: null,
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

    on(createUserSuccess, (state, { user }) => ({
        ...state,
        loading: false,
        user,
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
    on(fetchUserSuccess, (state, { user, games }) => ({
        ...state,
        user,
        games,
        loading: false,
    })),
    on(fetchUserFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
);

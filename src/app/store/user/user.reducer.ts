import { createReducer, on } from '@ngrx/store';
import {
    createUser,
    createUserSuccess,
    createUserFailure,
} from './user.actions';
import { User } from 'src/app/models/userinfo.model';

export interface UserState {
    user: { userId: string; username: string } | null;
    createUserSuccess: boolean;
    loading: boolean;
    error: string | null;
}

export const initialState: UserState = {
    user: null,
    createUserSuccess: false,
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
        createUserSuccess: true, // Indicate success
        createUserError: null, // Clear any previous errors
        error: null,
    })),

    on(createUserFailure, (state, { error }) => ({
        ...state,
        createUserSuccess: false,
        loading: false,
        error,
    })),
);

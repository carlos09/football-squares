import { createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions';
import { UserInfo } from 'src/app/models/userinfo.model';

export interface GameState {
    games: { gameId: string; gameCode: string; role: string }[];
    loading: boolean;
    error: any;
}

export const initialState: GameState = {
    games: [],
    loading: false,
    error: null,
};

export const gameReducer = createReducer(
    initialState,
    on(GameActions.generateGameCode, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(GameActions.generateGameCodeSuccess, (state, data) => ({
        ...state,
        gameCode: data.gameCode,
        loading: true,
        error: null,
    })),
    on(GameActions.createGame, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(GameActions.createGameSuccess, (state, { game }) => ({
        ...state,
        games: [...state.games, game],
        loading: false,
    })),
    on(GameActions.createGameFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false,
    })),
    on(GameActions.fetchUserGames, (state) => ({
        ...state,
        loading: true,
    })),

    on(GameActions.fetchUserGamesSuccess, (state, { games }) => ({
        ...state,
        games,
        loading: false,
        error: null,
    })),

    on(GameActions.fetchUserGamesFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
);

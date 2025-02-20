import { createReducer, on } from '@ngrx/store';
import * as StartGameActions from './start-game.actions';
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

export const startGameReducer = createReducer(
    initialState,
    on(StartGameActions.generateGameCode, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(StartGameActions.generateGameCodeSuccess, (state, data) => ({
        ...state,
        gameCode: data.gameCode,
        loading: true,
        error: null,
    })),
    on(StartGameActions.createGame, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),
    on(StartGameActions.createGameSuccess, (state, { game }) => ({
        ...state,
        games: [...state.games, game],
        loading: false,
    })),
    on(StartGameActions.createGameFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false,
    })),
    on(StartGameActions.fetchUserGames, (state) => ({
        ...state,
        loading: true,
    })),

    on(StartGameActions.fetchUserGamesSuccess, (state, { games }) => ({
        ...state,
        games,
        loading: false,
        error: null,
    })),

    on(StartGameActions.fetchUserGamesFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error,
    })),
);

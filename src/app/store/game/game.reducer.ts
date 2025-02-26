import { createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions';

export interface GameState {
    gameId: string | null;
    gameCode: string | null;
    roleId: number | null;
    loading: boolean;
    error: any;
}

export const initialState: GameState = {
    gameId: null,
    gameCode: null,
    roleId: null,
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

    on(GameActions.generateGameCodeSuccess, (state, { gameCode }) => ({
        ...state,
        gameCode,
        loading: false, // Fix: should be false after success
        error: null,
    })),

    on(GameActions.createGame, (state) => ({
        ...state,
        loading: true,
        error: null,
    })),

    on(
        GameActions.createGameSuccess,
        (state, { gameId, gameCode, roleId }) => ({
            ...state,
            gameId,
            gameCode,
            roleId,
            loading: false,
        }),
    ),

    on(GameActions.createGameFailure, (state, { error }) => ({
        ...state,
        error,
        loading: false,
    })),

    on(GameActions.fetchGame, GameActions.getGameInfo, (state) => ({
        ...state,
        loading: true,
    })),

    on(GameActions.fetchGameSuccess, (state, { game }) => {
        console.log('REDUCER game: ', game);
        return {
            ...state,
            gameId: game.id,
            gameCode: game.gameCode,
            roleId: game.roleId ?? null,
            loading: false,
            error: null,
        };
    }),
    on(
        GameActions.fetchGameFailure,
        GameActions.getGameInfoFailure,
        (state, { error }) => ({
            ...state,
            loading: false,
            error,
        }),
    ),
    on(
        GameActions.getGameInfoSuccess,
        (state, { gameId, gameCode, roleId }) => {
            console.log(
                `gameId: ${gameId}, gameCode: ${gameCode}, roleId: ${roleId}`,
            );
            return {
                ...state,
                gameId,
                gameCode,
                roleId,
                loading: false,
                error: null,
            };
        },
    ),
);

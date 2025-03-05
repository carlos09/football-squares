import { createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions';
import { Player } from 'src/app/models/player.model';
import { SquareSelection } from 'src/app/models/square-selection.model';

export interface GameState {
    gameId: string | null;
    gameCode: string | null;
    roleId: number | null;
    players: Player[];
    selections: SquareSelection[];
    loading: boolean;
    error: any;
}

export const initialState: GameState = {
    gameId: null,
    gameCode: null,
    roleId: null,
    players: [],
    selections: [],
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

    on(
        GameActions.fetchGame,
        GameActions.getGameInfo,
        GameActions.getGameId,
        (state) => ({
            ...state,
            loading: true,
        }),
    ),

    on(GameActions.fetchGameSuccess, (state, { game }) => ({
        ...state,
        gameId: game.id,
        gameCode: game.gameCode,
        roleId: game.roleId,
        players: game.players,
        selections: game.selections,
        loading: false,
        error: null,
    })),
    on(
        GameActions.fetchGameFailure,
        GameActions.getGameInfoFailure,
        GameActions.getGameIdFailure,
        (state, { error }) => ({
            ...state,
            loading: false,
            error,
        }),
    ),
    on(
        GameActions.getGameInfoSuccess,
        (state, { gameId, gameCode, roleId }) => {
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

    on(
        GameActions.createGameSuccess,
        GameActions.getGameIdSuccess,
        (state, { gameId }) => ({
            ...state,
            gameId,
            loading: false,
        }),
    ),
    on(GameActions.clearCurrentGame, (state) => ({
        ...state,
        gameCode: null,
        gameId: null,
        players: [],
        selections: [],
        roleId: null,
        loading: false,
        error: null,
    })),

    on(GameActions.updatePlayerPaymentStatus, (state, { userId, hasPaid }) => {
        return {
            ...state,
            players: state.players.map((player) =>
                player.id === userId ? { ...player, hasPaid } : player,
            ),
        };
    }),
);

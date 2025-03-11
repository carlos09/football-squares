import { createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions';
import { Player } from 'src/app/models/player.model';
import { SquareSelection } from 'src/app/models/square-selection.model';
import { Score } from 'src/app/models/game-scoring.model';
import { GameSettings } from 'src/app/models/game-settings.model';

export interface GameState {
    gameId: string | null;
    gameCode: string | null;
    gameHasStarted: boolean;
    players: Player[];
    selections: SquareSelection[];
    settings: GameSettings;
    haveNumbersBeenGenerated: boolean;
    scoring: Score[];
    loading: boolean;
    error: any;
}

export const initialState: GameState = {
    gameId: null,
    gameCode: null,
    gameHasStarted: false,
    players: [],
    selections: [],
    settings: {
        homeTeam: '',
        awayTeam: '',
        gameStartTime: '',
        pricePerSquare: 0,
    },
    haveNumbersBeenGenerated: false,
    scoring: [
        {
            isLive: false,
            homeTeam: 0,
            awayTeam: 0,
            winner: '',
            hasEnded: false,
        }, // Q1
        {
            isLive: false,
            homeTeam: 0,
            awayTeam: 0,
            winner: '',
            hasEnded: false,
        }, // Q2
        {
            isLive: false,
            homeTeam: 0,
            awayTeam: 0,
            winner: '',
            hasEnded: false,
        }, // Q3
        {
            isLive: false,
            homeTeam: 0,
            awayTeam: 0,
            winner: '',
            hasEnded: false,
        }, // Q4
    ],
    loading: false,
    error: null,
};

export const gameReducer = createReducer(
    initialState,

    on(
        GameActions.generateGameCode,
        GameActions.createGame,
        GameActions.saveGameSettings,
        GameActions.startGame,
        GameActions.updateScore,
        (state) => ({
            ...state,
            loading: true,
            error: null,
        }),
    ),

    on(GameActions.generateGameCodeSuccess, (state, { gameCode }) => ({
        ...state,
        gameCode,
        loading: false,
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
    on(GameActions.startGameSuccess, (state, { hasStarted }) => {
        console.log('hasStarted: ', hasStarted);
        let updatedScoring = state.scoring.map((quarter, index) => ({
            ...quarter,
            isLive: false,
        }));

        if (hasStarted) {
            const liveQuarterIndex = updatedScoring.findIndex(
                (q) => q.homeTeam === 0 && q.awayTeam === 0,
            );

            if (liveQuarterIndex !== -1) {
                updatedScoring[liveQuarterIndex] = {
                    ...updatedScoring[liveQuarterIndex],
                    isLive: true,
                };
            }
        }

        return {
            ...state,
            gameHasStarted: hasStarted,
            scoring: updatedScoring,
            loading: false,
            error: null,
        };
    }),

    on(
        GameActions.fetchGame,
        GameActions.getGameInfo,
        GameActions.getGameId,
        (state) => ({
            ...state,
            loading: true,
        }),
    ),

    on(GameActions.fetchGameSuccess, (state, { game }) => {
        return {
            ...state,
            gameId: game.gameId as any,
            gameCode: game.gameCode,
            roleId: game.roleId,
            players: game.players,
            selections: game.selections,
            settings: {
                homeTeam: game.settings.homeTeam,
                awayTeam: game.settings.awayTeam,
                pricePerSquare: game.settings.pricePerSquare,
            },
            gameHasStarted: game.hasStarted,
            scoring: game.scoring,
            loading: false,
            error: null,
        };
    }),

    on(GameActions.saveGameSettingsSuccess, (state, settings) => {
        return {
            ...state,
            settings: {
                homeTeam: settings.homeTeam,
                awayTeam: settings.awayTeam,
                pricePerSquare: settings.pricePerSquare,
            },
            loading: false,
            error: null,
        };
    }),
    on(
        GameActions.fetchGameFailure,
        GameActions.getGameInfoFailure,
        GameActions.getGameIdFailure,
        GameActions.saveGameSettingsFailure,
        GameActions.createGameFailure,
        GameActions.startGameFailure,
        GameActions.updateScoreFailure,
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
    on(GameActions.generateSquaresNumbers, (state, action) => ({
        ...state,
        haveNumbersBeenGenerated: action.haveNumbersBeenGenerated,
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
    on(GameActions.updateScoreSuccess, (state, { quarterUpdate }) => {
        return {
            ...state,
            scoring: quarterUpdate,
            loading: false,
            error: null,
        };
    }),
);

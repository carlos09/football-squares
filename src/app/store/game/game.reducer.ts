import { createReducer, on } from '@ngrx/store';
import * as GameActions from './game.actions';
import { Player } from 'src/app/models/player.model';
import { SquareSelection } from 'src/app/models/square-selection.model';
import { Score } from 'src/app/models/game-scoring.model';
import { GameSettings } from 'src/app/models/game-settings.model';

export interface GameState {
    gameId: string | null;
    gameCode: string | null;
    roleId: number | null;
    gameHasStarted: boolean;
    players: Player[];
    selections: SquareSelection[];
    settings: GameSettings;
    haveNumbersBeenGenerated: boolean;
    axisNumbers: {
        xAxis: any;
        yAxis: any;
    };
    scoring: Score[];
    loading: boolean;
    error: any;
}

export const initialState: GameState = {
    gameId: null,
    gameCode: null,
    roleId: null,
    gameHasStarted: false,
    players: [],
    selections: [],
    settings: {
        homeTeam: '',
        awayTeam: '',
        gameStartTime: '',
        pricePerSquare: 0,
        payouts: {
            q1: 20,
            q2: 20,
            q3: 20,
            q4: 40,
        },
    },
    haveNumbersBeenGenerated: false,
    axisNumbers: {
        xAxis: Array(10).fill(0),
        yAxis: Array(10).fill(0),
    },
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
        GameActions.saveAxisNumbers,
        GameActions.updateQuarterWinnerSuccess,
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
                payouts: game.settings.payouts,
            },
            axisNumbers: {
                xAxis: game.xAxisNumbers ?? Array(10).fill(0),
                yAxis: game.yAxisNumbers ?? Array(10).fill(0),
            },
            haveNumbersBeenGenerated:
                Array.isArray(game.xAxisNumbers) &&
                game.xAxisNumbers.length > 0 &&
                Array.isArray(game.yAxisNumbers) &&
                game.yAxisNumbers.length > 0,
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
                payouts: settings.payouts,
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
        GameActions.updateQuarterWinnerFailure,
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
    on(GameActions.saveAxisNumbersSuccess, (state, { axisNumbers }) => ({
        ...state,
        haveNumbersBeenGenerated: true,
        axisNumbers: {
            xAxis: axisNumbers.xAxisNumbers,
            yAxis: axisNumbers.yAxisNumbers,
        },
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
    on(GameActions.updateScoreSuccess, (state, { quarterUpdate }) => ({
        ...state,
        scoring: quarterUpdate,
        loading: false,
        error: null,
    })),
    on(
        GameActions.updateQuarterWinnerSuccess,
        (state, { quarter, winner }) => ({
            ...state,
            scoring: state.scoring.map((q, index) =>
                index === quarter - 1 ? { ...q, winner } : q,
            ),
        }),
    ),
);

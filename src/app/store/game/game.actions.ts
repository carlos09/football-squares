import { createAction, props } from '@ngrx/store';
import { Game } from 'src/app/models/game.model';

export const generateGameCode = createAction(
    '[Generate Game Code Component] Generate Game Code',
);

export const generateGameCodeSuccess = createAction(
    '[Generate Game Code API] Generate Game Code Success',
    props<{ gameCode: string }>(),
);

export const generateGameCodeFailure = createAction(
    '[Generate Game Code API] Generate Game Code Failure',
    props<{ error: any }>(),
);

export const createGame = createAction(
    '[Create Game] Create New Game',
    props<{ userId: string }>(),
);

export const createGameSuccess = createAction(
    '[Create Game API] Create New Game Success',
    props<{
        gameId: string;
        gameCode: string;
        adminUserId: string;
        roleId: number;
    }>(),
);

export const createGameFailure = createAction(
    '[Create Game API] Create New Game Failure',
    props<{ error: any }>(),
);

export const setGameIdCred = createAction(
    '[Set Game Cred] Set Game Creds GameId',
    props<{ gameId: string }>(),
);

export const setUserIdCred = createAction(
    '[Set Game Cred] Set Game Creds UserId',
    props<{ userId: string }>(),
);

export const fetchGame = createAction(
    '[Game] Fetch Game',
    props<{ userId: string; gameId: string }>(),
);

export const fetchGameSuccess = createAction(
    '[Game] Fetch  Game Success',
    props<{
        game: Game;
    }>(),
);

export const fetchGameFailure = createAction(
    '[Game] Fetch  Game Failure',
    props<{ error: string }>(),
);

export const getGameInfo = createAction(
    '[Game Component] Get Game Info',
    props<{ gameId: string }>(),
);

export const getGameInfoSuccess = createAction(
    '[Game API] Get Game Info Success',
    props<{
        gameId: string;
        gameCode: string;
        roleId: number;
    }>(),
);

export const getGameInfoFailure = createAction(
    '[Game API] Get Game Info Failure',
    props<{ error: string }>(),
);

export const getGameId = createAction(
    '[Game Component] Get Game Id',
    props<{ gameCode: string }>(),
);

export const getGameIdSuccess = createAction(
    '[Game API] Get Game Id Success',
    props<{
        gameId: string;
    }>(),
);

export const getGameIdFailure = createAction(
    '[Game API] Get Game Id Failure',
    props<{ error: string }>(),
);

export const clearCurrentGame = createAction(
    '[Game Component] Clear Current Game',
);

export const updatePlayerPaymentStatus = createAction(
    '[Game] Update Player Payment Status',
    props<{ userId: string; hasPaid: boolean }>(),
);

export const updatePlayerPaymentStatusSuccess = createAction(
    '[Game] Update Player Payment Status Success',
);

export const updatePlayerPaymentFailure = createAction(
    '[Game API] Update Player Payment Status Failure',
    props<{ error: any }>(),
);

export const saveGameSettings = createAction(
    '[Game Component] Save Game Settings',
    props<{
        gameId: string;
        homeTeam: string;
        awayTeam: string;
        pricePerSquare: number;
    }>(),
);

export const saveGameSettingsSuccess = createAction(
    '[Game API] Save Game Settings Success',
    props<{
        homeTeam: string;
        awayTeam: string;
        pricePerSquare: number;
    }>(),
);

export const saveGameSettingsFailure = createAction(
    '[Game API] Save Game Settings Failure',
    props<{ error: string }>(),
);

export const generateSquaresNumbers = createAction(
    '[Game Component] Square Numbers Generated',
    props<{ haveNumbersBeenGenerated: boolean }>(),
);

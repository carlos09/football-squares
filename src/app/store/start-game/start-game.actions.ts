import { createAction, props } from '@ngrx/store';

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
    props<{ game: { gameId: string; gameCode: string; role: string } }>(),
    // props<{ gameId: string; url_id: string }>(),
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

export const fetchUserGames = createAction(
    '[Game] Fetch User Games',
    props<{ userId: string }>(),
);

export const fetchUserGamesSuccess = createAction(
    '[Game] Fetch User Games Success',
    props<{ games: { gameId: string; gameCode: string; role: string }[] }>(),
);

export const fetchUserGamesFailure = createAction(
    '[Game] Fetch User Games Failure',
    props<{ error: string }>(),
);

import { createAction, props } from '@ngrx/store';

export const createGame = createAction(
  '[Create Game] Load Selections'
);

export const createGameSuccess = createAction(
  '[Create Game API] Create Game Success',
  props<{ gameId: string, url_id: string }>()
);

export const createGameFailure = createAction(
  '[Create Game API] Create Game Failure',
  props<{ error: any }>()
);

export const setGameIdCred = createAction(
    '[Set Game Cred] Set Game Creds GameId',
    props<{ gameId: string }>()
);

export const setUserIdCred = createAction(
    '[Set Game Cred] Set Game Creds UserId',
    props<{ userId: string }>()
);

export const fetchUser = createAction(
    '[Fetch User] Fetch User',
    props<{ userId: string }>()
  );
  
  export const fetchUserSuccess = createAction(
    '[Fetch User API] Fetch User Success',
    props<{ username: string }>()
  );
  
  export const fetchUserFailure = createAction(
    '[Fetch User API] Fetch User Failure',
    props<{ error: any }>()
  );

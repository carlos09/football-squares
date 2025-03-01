import { createAction, props } from '@ngrx/store';
import { Game } from 'src/app/models/game.model';
import { User } from 'src/app/models/userinfo.model';

export const createUser = createAction(
    '[Create User] Create User Component',
    props<{ username: string; password: string; gameId?: string }>(),
);

export const createUserSuccess = createAction(
    '[Create User API] Create User Success',
    props<{ userId: string; username: string; roleId: number }>(),
);

export const createUserFailure = createAction(
    '[Create User API] Create User Failure',
    props<{ error: any }>(),
);

export const fetchUser = createAction(
    '[Fetch User] Fetch User',
    props<{ userId: string }>(),
);

export const fetchUserSuccess = createAction(
    '[Fetch User API] Fetch User Success',
    props<{ user: User; games: Game[] }>(),
);

export const fetchUserFailure = createAction(
    '[Fetch User API] Fetch User Failure',
    props<{ error: any }>(),
);

import { createAction, props } from '@ngrx/store';
import { User } from 'src/app/models/userinfo.model';

export const createUser = createAction(
    '[Create User] Create User Component',
    props<{ username: string; password: string }>(),
);

export const createUserSuccess = createAction(
    '[Create User API] Create User Success',
    props<{ user: { userId: string; username: string } }>(),
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
    props<{ userId: string; username: string }>(),
);

export const fetchUserFailure = createAction(
    '[Fetch User API] Fetch User Failure',
    props<{ error: any }>(),
);

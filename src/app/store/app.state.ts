import { ActionReducerMap } from '@ngrx/store';
import { SelectionsEffects } from './selections/selections.effects';
import {
    selectionsReducer,
    SelectionsState,
} from './selections/selections.reducer';
import { SELECTIONS_STATE_NAME } from './selections/selections.selectors';
import { GameEffects } from './game/game.effects';
import { GameState, gameReducer } from './game/game.reducer';
import { GAME_STATE_NAME } from './game/game.seletors';
import { SnackbarEffects } from './shared/shared.effects';
import { userReducer, UserState } from './user/user.reducer';
import { USER_STATE_NAME } from './user/user.selectors';
import { UserEffects } from './user/user.effects';
import { authReducer, AuthState } from './auth/auth.reducer';
import { AUTH_STATE_NAME } from './auth/auth.selectors';
import { AuthEffects } from './auth/auth.effects';

export interface AppState {
    [SELECTIONS_STATE_NAME]: SelectionsState;
    [GAME_STATE_NAME]: GameState;
    [USER_STATE_NAME]: UserState;
    [AUTH_STATE_NAME]: AuthState;
}

export const appReducer: ActionReducerMap<AppState> = {
    [SELECTIONS_STATE_NAME]: selectionsReducer,
    [GAME_STATE_NAME]: gameReducer,
    [USER_STATE_NAME]: userReducer,
    [AUTH_STATE_NAME]: authReducer,
};

export const appEffects = [
    SelectionsEffects,
    GameEffects,
    SnackbarEffects,
    UserEffects,
    AuthEffects,
];

import { ActionReducerMap } from '@ngrx/store';
import { SelectionsEffects } from './selections/selections.effects';
import {
    selectionsReducer,
    SelectionsState,
} from './selections/selections.reducer';
import { SELECTIONS_STATE_NAME } from './selections/selections.selectors';
import { StartGameEffects } from './start-game/start-game.effects';
import { GameState, startGameReducer } from './start-game/start-game.reducer';
import { START_GAME_STATE_NAME } from './start-game/start-game.seletors';
import { SnackbarEffects } from './shared/shared.effects';
import { userReducer, UserState } from './user/user.reducer';
import { USER_STATE_NAME } from './user/user.selectors';
import { UserEffects } from './user/user.effects';

export interface AppState {
    [SELECTIONS_STATE_NAME]: SelectionsState;
    [START_GAME_STATE_NAME]: GameState;
    [USER_STATE_NAME]: UserState;
}

export const appReducer: ActionReducerMap<AppState> = {
    [SELECTIONS_STATE_NAME]: selectionsReducer,
    [START_GAME_STATE_NAME]: startGameReducer,
    [USER_STATE_NAME]: userReducer,
};

export const appEffects = [
    SelectionsEffects,
    StartGameEffects,
    SnackbarEffects,
    UserEffects,
];

import { ActionReducerMap } from '@ngrx/store';
import { SelectionsEffects } from './selections/selections.effects';
import {
    SelectionsReducer,
    SelectionsState,
} from './selections/selections.reducer';
import { SELECTIONS_STATE_NAME } from './selections/selections.selectors';
import { StartGameEffects } from './start-game/start-game.effects';
import { GameState, StartGameReducer } from './start-game/start-game.reducer';
import { START_GAME_STATE_NAME } from './start-game/start-game.seletors';
import { SnackbarEffects } from './shared/shared.effects';

export interface AppState {
    [SELECTIONS_STATE_NAME]: SelectionsState;
    [START_GAME_STATE_NAME]: GameState;
}

export const appReducer: ActionReducerMap<AppState> = {
    [SELECTIONS_STATE_NAME]: SelectionsReducer,
    [START_GAME_STATE_NAME]: StartGameReducer,
};

export const appEffects = [
    SelectionsEffects,
    StartGameEffects,
    SnackbarEffects,
];

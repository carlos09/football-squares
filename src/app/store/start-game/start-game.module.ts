import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { startGameReducer } from './start-game.reducer';
import { StartGameEffects } from './start-game.effects';
import { START_GAME_STATE_NAME } from './start-game.seletors';

@NgModule({
    imports: [
        StoreModule.forFeature(START_GAME_STATE_NAME, startGameReducer),
        EffectsModule.forFeature([StartGameEffects]),
    ],
})
export class StartGameModule {}

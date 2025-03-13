import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { gameReducer } from './game.reducer';
import { GameEffects } from './game.effects';
import { GAME_STATE_NAME } from './game.selectors';

@NgModule({
    imports: [
        StoreModule.forFeature(GAME_STATE_NAME, gameReducer),
        EffectsModule.forFeature([GameEffects]),
    ],
})
export class GameModule {}

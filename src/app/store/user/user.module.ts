import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { userReducer } from './user.reducer';
import { USER_STATE_NAME } from './user.selectors';
import { UserEffects } from './user.effects';

@NgModule({
    imports: [
        StoreModule.forFeature(USER_STATE_NAME, userReducer),
        EffectsModule.forFeature([UserEffects]),
    ],
    providers: [UserEffects],
})
export class SelectionsModule {}

import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { selectionsReducer } from './selections.reducer';
import { SelectionsEffects } from './selections.effects';
import { SELECTIONS_STATE_NAME } from './selections.selectors';

@NgModule({
    imports: [
        StoreModule.forFeature(SELECTIONS_STATE_NAME, selectionsReducer),
        EffectsModule.forFeature([SelectionsEffects]),
    ],
    providers: [SelectionsEffects], // <-- Ensure this is included
})
export class SelectionsModule {}

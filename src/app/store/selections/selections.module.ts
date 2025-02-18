import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SelectionsReducer } from './selections.reducer';
import { SelectionsEffects } from './selections.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('selections', SelectionsReducer),
    EffectsModule.forFeature([SelectionsEffects])
  ],
  providers: [SelectionsEffects] // <-- Ensure this is included
})
export class SelectionsModule {}

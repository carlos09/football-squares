import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as SelectionsActions from './selections.actions';
import { SquareSelection } from '../../models/square-selection.model';

@Injectable()
export class SelectionsEffects {
  loadSelections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SelectionsActions.loadSelections),
      mergeMap(({ userId }) =>
        this.gameService.getUserSelections(userId).pipe(
          map((selections) => SelectionsActions.loadSelectionsSuccess({ selections: selections.map((s: SquareSelection) => s.square_id) })),
          catchError((error) => of(SelectionsActions.loadSelectionsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private gameService: GameService) {}
}

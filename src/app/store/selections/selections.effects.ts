import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as SelectionsActions from './selections.actions';
import * as StartGameActions from '../start-game/start-game.actions';
import { SquareSelection } from '../../models/square-selection.model';

@Injectable()
export class SelectionsEffects {
  loadSelections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StartGameActions.fetchUser),
      mergeMap(({ userId }) =>
        this.gameService.getUserSelections(userId).pipe(
          map((res) => {
            console.log('squre selections: ', res);
            return SelectionsActions.loadSelectionsSuccess({ selections: res.selections.map((s: SquareSelection) => s.square_id) })}),
          catchError((error) => of(SelectionsActions.loadSelectionsFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private gameService: GameService) {}
}

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap, withLatestFrom } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as SelectionsActions from './selections.actions';
import { SquareSelection } from '../../models/square-selection.model';
import { Store } from '@ngrx/store';
import { showSnackbar } from '../shared/shared.actions';

@Injectable()
export class SelectionsEffects {
    loadSelections$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SelectionsActions.loadSelections),
            mergeMap(({ userId, gameId }) =>
                this.gameService.getUserSelections(userId, gameId).pipe(
                    map((res) => {
                        console.log('square selections: ', res);
                        return SelectionsActions.loadSelectionsSuccess({
                            selections: res.selections.map(
                                (s: SquareSelection) => s.square_id,
                            ),
                        });
                    }),
                    catchError((error) =>
                        of(SelectionsActions.loadSelectionsFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    saveSquaresSelections$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SelectionsActions.saveSelectedSquares),
            mergeMap(({ gameId, userId, selectedSquareIds }) => {
                return this.gameService
                    .saveSquareSelections(gameId, userId, selectedSquareIds)
                    .pipe(
                        map(() => {
                            console.log('Selections saved successfully');
                            return SelectionsActions.saveSelectedSquaresSuccess(
                                { userId },
                            );
                        }),
                        tap(() => {
                            this._store.dispatch(
                                showSnackbar({
                                    message: 'Selections saved successfully!',
                                    duration: 3000,
                                }),
                            );
                        }),
                        catchError((error) =>
                            of(
                                SelectionsActions.saveSelectedSquaresFailure({
                                    error,
                                }),
                                showSnackbar({
                                    message: 'Failed to save selections',
                                    duration: 3000,
                                }),
                            ),
                        ),
                    );
            }),
        ),
    );

    constructor(
        private actions$: Actions,
        private gameService: GameService,
        private _store: Store,
    ) {}
}

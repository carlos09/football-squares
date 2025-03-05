import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as SelectionsActions from './selections.actions';
import * as GameActions from '../game/game.actions';
import { Store } from '@ngrx/store';
import { showSnackbar } from '../shared/shared.actions';

@Injectable()
export class SelectionsEffects {
    fetchSelectedSquares$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SelectionsActions.fetchSelectedSquares),
            switchMap(({ gameId, userId }) =>
                this.gameService.getUserSelections(gameId, userId).pipe(
                    map((response) =>
                        SelectionsActions.fetchSelectedSquaresSuccess({
                            selectedSquareIds: response.selections.map(
                                (s) => s.square_id,
                            ),
                        }),
                    ),
                    catchError((error) =>
                        of(
                            SelectionsActions.fetchSelectedSquaresFailure({
                                error: error.message,
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    saveSquaresSelections$ = createEffect(() =>
        this.actions$.pipe(
            ofType(SelectionsActions.saveSelectedSquares),
            mergeMap(({ gameId, userId, selectedSquareIds }) =>
                this.gameService
                    .saveSquareSelections(gameId, userId, selectedSquareIds)
                    .pipe(
                        switchMap(() => [
                            SelectionsActions.saveSelectedSquaresSuccess(),
                            SelectionsActions.fetchSelectedSquares({
                                gameId,
                                userId,
                            }),
                            GameActions.fetchGame({
                                userId: userId as any,
                                gameId: gameId as any,
                            }),
                        ]),
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
                    ),
            ),
        ),
    );

    constructor(
        private actions$: Actions,
        private gameService: GameService,
        private _store: Store,
    ) {}
}

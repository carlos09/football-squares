import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, withLatestFrom } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as SelectionsActions from './selections.actions';
import * as StartGameActions from '../start-game/start-game.actions';
import { SquareSelection } from '../../models/square-selection.model';
import { Store } from '@ngrx/store';
import { selectGameId, selectUserId } from '../start-game/start-game.seletors';

@Injectable()
export class SelectionsEffects {
    loadSelections$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                SelectionsActions.loadSelections,
                SelectionsActions.saveSelectedSquaresSuccess,
            ),
            mergeMap(({ userId }) =>
                this.gameService.getUserSelections(userId).pipe(
                    map((res) => {
                        console.log('squre selections: ', res);
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
            withLatestFrom(
                this._store.select(selectGameId),
                this._store.select(selectUserId),
            ),
            mergeMap(([{ selectedSquareIds }, gameId, userId]) => {
                if (!gameId || !userId) {
                    return of(
                        SelectionsActions.loadSelectionsFailure({
                            error: 'Missing gameId or userId',
                        }),
                    );
                }

                return this.gameService
                    .saveSquareSelections(gameId, userId, selectedSquareIds)
                    .pipe(
                        map(() => {
                            console.log('Selections saved successfully');
                            return SelectionsActions.saveSelectedSquaresSuccess(
                                { userId },
                            );
                        }),
                        catchError((error) =>
                            of(
                                SelectionsActions.saveSelectedSquaresFailure({
                                    error,
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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap, withLatestFrom } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as SelectionsActions from './selections.actions';
import { SquareSelection } from '../../models/square-selection.model';
import { Store } from '@ngrx/store';
import { selectGameId } from '../start-game/start-game.seletors';
import { showSnackbar } from '../shared/shared.actions';
import { selectUserId } from '../user/user.selectors';

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
    // saveSquaresSelections$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(SelectionsActions.saveSelectedSquares),
    //         withLatestFrom(
    //             this._store.select(selectGameId),
    //             this._store.select(selectUserId),
    //         ),
    //         mergeMap(([{ selectedSquareIds }, gameId, userId]) => {
    //             if (!gameId || !userId) {
    //                 return of(
    //                     SelectionsActions.loadSelectionsFailure({
    //                         error: 'Missing gameId or userId',
    //                     }),
    //                 );
    //             }

    //             return this.gameService
    //                 .saveSquareSelections(gameId, userId, selectedSquareIds)
    //                 .pipe(
    //                     map(() => {
    //                         console.log('Selections saved successfully');
    //                         return SelectionsActions.saveSelectedSquaresSuccess(
    //                             { userId },
    //                         );
    //                     }),
    //                     tap(() => {
    //                         this._store.dispatch(
    //                             showSnackbar({
    //                                 message: 'Selections saved successfully!',
    //                                 duration: 3000,
    //                             }),
    //                         );
    //                     }),
    //                     catchError((error) =>
    //                         of(
    //                             SelectionsActions.saveSelectedSquaresFailure({
    //                                 error,
    //                             }),
    //                             showSnackbar({
    //                                 message: 'Failed to save selections',
    //                                 duration: 3000,
    //                             }),
    //                         ),
    //                     ),
    //                 );
    //         }),
    //     ),
    // );

    constructor(
        private actions$: Actions,
        private gameService: GameService,
        private _store: Store,
    ) {}
}

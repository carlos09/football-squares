import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, mergeMap, withLatestFrom } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as UserActions from './user.actions';
import { Store } from '@ngrx/store';
import { selectGameId } from '../game/game.seletors';

@Injectable()
export class UserEffects {
    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.createUser),
            switchMap(({ username, password, gameId }) =>
                this.gameService
                    .createUser(username, password, gameId) // gameId is already provided
                    .pipe(
                        switchMap((response) => [
                            UserActions.createUserSuccess({
                                userId: response?.userId,
                                username: response?.username,
                                roleId: response?.roleId ?? 2,
                                gameId: response?.gameId || null, // Ensure gameId is included if available
                            }),
                        ]),
                        catchError((error) => {
                            const errorMessage =
                                error?.error?.message ||
                                'An unknown error occurred.';
                            return of(
                                UserActions.createUserFailure({
                                    error: errorMessage,
                                }),
                            );
                        }),
                    ),
            ),
        ),
    );

    fetchUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.fetchUser),
            mergeMap(({ userId }) => {
                return this.gameService.getUserById(userId).pipe(
                    map((response) => {
                        return UserActions.fetchUserSuccess({
                            user: response.user,
                            games: response.games,
                        });
                    }),
                    catchError((error) =>
                        of(
                            UserActions.fetchUserFailure({
                                error: error.message,
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
        private store: Store,
    ) {}
}

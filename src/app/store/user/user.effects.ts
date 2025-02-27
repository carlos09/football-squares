import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, mergeMap } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as UserActions from './user.actions';

@Injectable()
export class UserEffects {
    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.createUser),
            switchMap(({ username, password }) =>
                this.gameService.createUser(username, password).pipe(
                    switchMap((response) => {
                        const createUserSuccessAction =
                            UserActions.createUserSuccess({
                                userId: response?.userId,
                                username: response?.username,
                                roleId: response?.roleId ?? 2,
                            });

                        return [
                            createUserSuccessAction,
                            // loadUserGamesAction
                        ];
                    }),
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

    constructor(private actions$: Actions, private gameService: GameService) {}
}

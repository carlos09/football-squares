import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as UserActions from './user.actions';

@Injectable()
export class UserEffects {
    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.createUser),
            switchMap(({ username, password }) =>
                this.gameService.createUser(username, password).pipe(
                    map((user) => UserActions.createUserSuccess({ user })),
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
            switchMap(({ userId }) =>
                this.gameService.getUser(userId).pipe(
                    // Ensure this method exists
                    map((user) =>
                        UserActions.fetchUserSuccess({
                            userId: user.userId,
                            username: user.username,
                        }),
                    ),
                    catchError((error) =>
                        of(
                            UserActions.fetchUserFailure({
                                error:
                                    error?.error?.message ||
                                    'Failed to fetch user',
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    constructor(private actions$: Actions, private gameService: GameService) {}
}

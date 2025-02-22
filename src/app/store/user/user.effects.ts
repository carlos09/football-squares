import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, mergeMap } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as UserActions from './user.actions';
import { User } from 'src/app/models/userinfo.model';

@Injectable()
export class UserEffects {
    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.createUser),
            switchMap(({ username, password }) =>
                this.gameService.createUser(username, password).pipe(
                    map((response) =>
                        UserActions.createUserSuccess({
                            user: {
                                userId: response?.userId,
                                username: response?.username,
                                password: '',
                                gameId: null,
                                roleId: null,
                            },
                        }),
                    ),
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
                console.log('go fetch user!', userId);
                return this.gameService.getUserById(userId).pipe(
                    map((response) => {
                        console.log('response::: ', response);
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

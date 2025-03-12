import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, mergeMap, withLatestFrom } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as UserActions from './user.actions';
import * as AuthActions from '../auth/auth.actions';
import { Store } from '@ngrx/store';
import { selectGameId } from '../game/game.seletors';
import { AuthService } from 'src/app/services/auth.service';

@Injectable()
export class UserEffects {
    createUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(UserActions.createUser),
            switchMap(({ username, password, gameId }) =>
                this.authService.register(username, password, gameId).pipe(
                    switchMap((response) => [
                        UserActions.createUserSuccess({
                            userId: response.userId,
                            username: response.username,
                            roleId: response.roleId ?? 2,
                            gameId: response.gameId || null,
                        }),
                        AuthActions.login({
                            username,
                            password,
                        }), // Automatically log in the user
                    ]),
                    catchError((error) =>
                        of(
                            UserActions.createUserFailure({
                                error: error.message,
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    // login$ = createEffect(() =>
    //     this.actions$.pipe(
    //         ofType(UserActions.login),
    //         switchMap(({ username, password }) =>
    //             this.authService.login(username, password).pipe(
    //                 map((response) =>
    //                     UserActions.loginSuccess({
    //                         userId: response.userId,
    //                         username: response.username,
    //                         token: response.token,
    //                         roleId: response.roleId,
    //                     }),
    //                 ),
    //                 catchError((error) =>
    //                     of(UserActions.loginFailure({ error: error.message })),
    //                 ),
    //             ),
    //         ),
    //     ),
    // );

    // logout$ = createEffect(
    //     () =>
    //         this.actions$.pipe(
    //             ofType(UserActions.logout),
    //             map(() => {
    //                 localStorage.removeItem('token');
    //                 localStorage.removeItem('userId');
    //             }),
    //         ),
    //     { dispatch: false },
    // );

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
        private authService: AuthService,
        private store: Store,
    ) {}
}

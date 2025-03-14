import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as AuthActions from './auth.actions';
import { tap, map, switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { of } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class AuthEffects {
    loadAuthFromLocalStorage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.loadAuthFromStorage),
            map(() => {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');

                if (token && userId) {
                    return AuthActions.loadAuthSuccess({
                        token,
                        userId,
                    });
                } else {
                    return AuthActions.loadAuthFailure({
                        error: 'Missing authentication data in localStorage',
                    });
                }
            }),
        ),
    );

    // Login effect
    login$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AuthActions.login),
            switchMap(({ username, password }) =>
                this.authService.login(username, password).pipe(
                    map((response) => {
                        const { token } = response;
                        const decodedToken: any = jwtDecode(token); // Decode token to get user details

                        return AuthActions.loginSuccess({
                            userId: decodedToken.userId,
                            username: decodedToken.username,
                            token: token,
                            roleId: decodedToken.roleId,
                        });
                    }),
                    catchError((error) =>
                        of(AuthActions.loginFailure({ error: error.message })),
                    ),
                ),
            ),
        ),
    );

    logout$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.logout),
                tap(() => {
                    this.authService.logout();
                    localStorage.removeItem('token');
                    localStorage.removeItem('gameId');
                    this.router.navigate(['/']);
                }),
            ),
        { dispatch: false },
    );

    persistAuth$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(AuthActions.loginSuccess),
                tap(({ token, userId }) => {
                    localStorage.setItem('token', token);
                    localStorage.setItem('userId', userId);
                }),
            ),
        { dispatch: false }, // No action is dispatched from this effect
    );

    constructor(
        private actions$: Actions,
        private authService: AuthService,
        private router: Router,
    ) {}
}

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as StartGameActions from './start-game.actions';

@Injectable()
export class StartGameEffects {
    fetchUser$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StartGameActions.fetchUser),
            switchMap(({ userId }) =>
                this.gameService.getUserById(userId).pipe(
                    map((response) =>
                        StartGameActions.fetchUserSuccess({
                            userId,
                            username: response.username,
                        }),
                    ),
                    catchError((error) =>
                        of(StartGameActions.fetchUserFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    createGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StartGameActions.createGame),
            switchMap(() =>
                this.gameService.createGame().pipe(
                    map((res) =>
                        StartGameActions.createGameSuccess({
                            gameId: res.gameId,
                            url_id: res.url_id,
                        }),
                    ),
                    catchError((error) =>
                        of(StartGameActions.createGameFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    constructor(private actions$: Actions, private gameService: GameService) {}
}

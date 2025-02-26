import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as GameActions from './game.actions';

@Injectable()
export class GameEffects {
    getGameCode$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.generateGameCode),
            switchMap(() =>
                this.gameService.createGameCode().pipe(
                    map((res) =>
                        GameActions.generateGameCodeSuccess({
                            gameCode: res.gameCode,
                        }),
                    ),
                    catchError((error) =>
                        of(GameActions.generateGameCodeFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    createGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.createGame),
            switchMap(({ userId }) =>
                this.gameService.createGame(userId).pipe(
                    map(({ gameId, gameCode, adminUserId, roleId }) => {
                        console.log(
                            `gameId: ${gameId}, gameCode: ${gameCode}, roleId: ${roleId}`,
                        );
                        return GameActions.createGameSuccess({
                            gameId,
                            gameCode,
                            adminUserId,
                            roleId,
                        });
                    }),
                    catchError((error) =>
                        of(GameActions.createGameFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    fetchUserGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.fetchGame),
            switchMap(({ userId, gameId }) =>
                this.gameService.getUserGame(userId, gameId).pipe(
                    map((game) => GameActions.fetchGameSuccess({ game })),
                    catchError((error) =>
                        of(
                            GameActions.fetchGameFailure({
                                error:
                                    error?.error?.message ||
                                    'Failed to fetch game',
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    constructor(private actions$: Actions, private gameService: GameService) {}
}

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, mergeMap } from 'rxjs';
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
                    map(
                        (game) =>
                            GameActions.createGameSuccess({
                                game,
                            }), // Fix variable reference
                    ),
                    catchError((error) =>
                        of(GameActions.createGameFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    fetchUserGames$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.fetchUserGames),
            mergeMap(({ userId }) =>
                this.gameService.getUserGames(userId).pipe(
                    map((games) =>
                        GameActions.fetchUserGamesSuccess({ games }),
                    ),
                    catchError((error) =>
                        of(
                            GameActions.fetchUserGamesFailure({
                                error:
                                    error?.error?.message ||
                                    'Failed to fetch user games',
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );
    constructor(private actions$: Actions, private gameService: GameService) {}
}

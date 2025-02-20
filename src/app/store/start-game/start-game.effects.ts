import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, mergeMap } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as StartGameActions from './start-game.actions';

@Injectable()
export class StartGameEffects {
    getGameCode$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StartGameActions.generateGameCode),
            switchMap(() =>
                this.gameService.createGameCode().pipe(
                    map((res) =>
                        StartGameActions.generateGameCodeSuccess({
                            gameCode: res.gameCode,
                        }),
                    ),
                    catchError((error) =>
                        of(StartGameActions.generateGameCodeFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    createGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StartGameActions.createGame),
            switchMap(({ userId }) =>
                this.gameService.createGame(userId).pipe(
                    map(
                        (game) =>
                            StartGameActions.createGameSuccess({
                                game,
                            }), // Fix variable reference
                    ),
                    catchError((error) =>
                        of(StartGameActions.createGameFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    fetchUserGames$ = createEffect(() =>
        this.actions$.pipe(
            ofType(StartGameActions.fetchUserGames),
            mergeMap(({ userId }) =>
                this.gameService.getUserGames(userId).pipe(
                    map((games) =>
                        StartGameActions.fetchUserGamesSuccess({ games }),
                    ),
                    catchError((error) =>
                        of(
                            StartGameActions.fetchUserGamesFailure({
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

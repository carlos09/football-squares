import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, mergeMap, withLatestFrom } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as GameActions from './game.actions';
import { selectUserId } from '../user/user.selectors';
import { selectGameId } from './game.selectors';
import { Store } from '@ngrx/store';

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
                    map(({ gameId, gameCode, adminUserId, roleId }) =>
                        GameActions.createGameSuccess({
                            gameId,
                            gameCode,
                            adminUserId,
                            roleId,
                        }),
                    ),
                    catchError((error) =>
                        of(GameActions.createGameFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    fetchGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.fetchGame),
            switchMap(({ userId, gameId }) =>
                this.gameService.getGame(userId, gameId).pipe(
                    map((game) => GameActions.fetchGameSuccess({ game })),
                    catchError((error) =>
                        of(GameActions.fetchGameFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    getGameId$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.getGameId),
            switchMap(({ gameCode }) =>
                this.gameService.getGameId(gameCode).pipe(
                    map((response) => {
                        console.log('RESPONSE: ', response);
                        return GameActions.getGameIdSuccess({
                            gameId: response.id,
                        });
                    }),
                    catchError((error) =>
                        of(
                            GameActions.getGameIdFailure({
                                error:
                                    error?.error?.message ||
                                    'Failed to fetch gameId',
                            }),
                        ),
                    ),
                ),
            ),
        ),
    );

    updatePaymentStatus$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.updatePlayerPaymentStatus),
            mergeMap(({ userId, hasPaid }) =>
                this.gameService.updatePaymentStatus(userId, hasPaid).pipe(
                    map(() => GameActions.updatePlayerPaymentStatusSuccess()),
                    catchError((error) =>
                        of(GameActions.updatePlayerPaymentFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    triggerFetchGameAfterPaymentUpdate$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.updatePlayerPaymentStatusSuccess),
            withLatestFrom(
                this.store.select(selectUserId),
                this.store.select(selectGameId),
            ),
            map(([_, userId, gameId]) => {
                if (!userId || !gameId) {
                    console.warn(
                        'UserId or GameId is missing, fetchGame action not dispatched.',
                    );
                    return { type: '[Game] Fetch Game Skipped' }; // No-op action
                }
                return GameActions.fetchGame({
                    userId: userId as string,
                    gameId: gameId as string,
                });
            }),
        ),
    );

    saveGameSettings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.saveGameSettings),
            switchMap(({ gameId, homeTeam, awayTeam, pricePerSquare }) =>
                this.gameService
                    .saveGameSettings(gameId, {
                        homeTeam,
                        awayTeam,
                        pricePerSquare,
                    })
                    .pipe(
                        map((resp) => {
                            console.log('SETTTING EFFECT: ', resp.settings);
                            return GameActions.saveGameSettingsSuccess({
                                homeTeam: resp.settings.homeTeam,
                                awayTeam: resp.settings.awayTeam,
                                pricePerSquare: resp.settings.pricePerSquare,
                            });
                        }),
                        catchError((error) =>
                            of(
                                GameActions.saveGameSettingsFailure({
                                    error:
                                        error.message ||
                                        'Failed to save game settings',
                                }),
                            ),
                        ),
                    ),
            ),
        ),
    );

    startGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.startGame),
            mergeMap(({ gameId }) =>
                this.gameService.startGame(gameId).pipe(
                    map((response) =>
                        GameActions.startGameSuccess({
                            hasStarted: response.hasStarted,
                        }),
                    ),
                    catchError((error) =>
                        of(GameActions.startGameFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    updateScore$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.updateScore),
            withLatestFrom(this.store.select(selectGameId)),
            mergeMap(
                ([{ scoreIndex, homeTeam, awayTeam, endQuarter }, gameId]) =>
                    this.gameService
                        .updateScore(
                            gameId,
                            scoreIndex + 1,
                            homeTeam,
                            awayTeam,
                            endQuarter,
                        )
                        .pipe(
                            map((resp) =>
                                GameActions.updateScoreSuccess({
                                    quarterUpdate: resp,
                                }),
                            ),
                            catchError((error) =>
                                of(GameActions.updateScoreFailure({ error })),
                            ),
                        ),
            ),
        ),
    );

    saveGeneratedAxisNumbers$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.saveAxisNumbers),
            withLatestFrom(this.store.select(selectGameId)),
            mergeMap(([{ xAxis, yAxis }, gameId]) =>
                this.gameService.saveAxisNumbers(gameId, xAxis, yAxis).pipe(
                    map((resp) => {
                        console.log('axis resp', resp);
                        return GameActions.saveAxisNumbersSuccess({
                            axisNumbers: resp,
                        });
                    }),
                    catchError((error) =>
                        of(GameActions.saveAxisNumbersFailure({ error })),
                    ),
                ),
            ),
        ),
    );

    updateQuarterWinner$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.updateQuarterWinner),
            mergeMap(({ gameId, quarter, winnerId }) =>
                this.gameService
                    .updateQuarterWinner(gameId, quarter, winnerId)
                    .pipe(
                        map((response) =>
                            GameActions.updateQuarterWinnerSuccess({
                                quarter: response.quarter,
                                winner: response.winner,
                            }),
                        ),
                        catchError((error) =>
                            of(
                                GameActions.updateQuarterWinnerFailure({
                                    error,
                                }),
                            ),
                        ),
                    ),
            ),
        ),
    );

    constructor(
        private actions$: Actions,
        private gameService: GameService,
        private store: Store,
    ) {}
}

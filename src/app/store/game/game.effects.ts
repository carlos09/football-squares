import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, of, mergeMap, withLatestFrom } from 'rxjs';
import { GameService } from '../../services/game.service';
import * as GameActions from './game.actions';
import { selectUserId } from '../user/user.selectors';
import { selectGameId } from './game.seletors';
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

    fetchGame$ = createEffect(() =>
        this.actions$.pipe(
            ofType(GameActions.fetchGame),
            switchMap(({ userId, gameId }) =>
                this.gameService.getGame(userId, gameId).pipe(
                    map((game) => {
                        console.log('game response ** ', game);
                        return GameActions.fetchGameSuccess({ game });
                    }),
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
                    map((response) =>
                        GameActions.getGameIdSuccess({
                            gameId: response.gameId,
                        }),
                    ),
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

    constructor(
        private actions$: Actions,
        private gameService: GameService,
        private store: Store,
    ) {}
}

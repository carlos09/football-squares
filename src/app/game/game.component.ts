import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfrimDialogComponent } from '../dialog/confrim-dialog/confrim-dialog.component';
import { Store } from '@ngrx/store';
import {
    loadSelections,
    saveSelectedSquares,
} from '../store/selections/selections.actions';
import { AppState } from '../store/app.state';
import {
    Observable,
    take,
    switchMap,
    map,
    Subscription,
    of,
    filter,
    EMPTY,
} from 'rxjs';
import { selectSelectedSquareIds } from '../store/selections/selections.selectors';
import {
    selectUser,
    selectUserAndCurrentGame,
} from '../store/user/user.selectors';
import { ActivatedRoute } from '@angular/router';
import * as UserActions from '../store/user/user.actions';
import { Game } from '../models/game.model';

@Component({
    selector: 'app-game',
    standalone: false,
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
    selectedSquares$: Observable<number[]>;
    gameId: string = '';
    userId: string | null = null;
    user: string | undefined = '';
    game: Game | null = null;

    private subscriptions = new Set<Subscription>();

    constructor(
        private dialog: MatDialog,
        private store: Store<AppState>,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        this.store
            .select(selectUser)
            .pipe(take(1))
            .subscribe((user) => {
                if (!user) {
                    const userId = localStorage.getItem('userId');
                    this.userId = userId;
                    if (userId) {
                        this.userId = userId;
                        this.store.dispatch(UserActions.fetchUser({ userId }));
                    }
                }
            });

        this.route.paramMap.subscribe((params) => {
            const gameCode = params.get('gameCode');

            if (gameCode) {
                this.getGameInfo(gameCode);
            }
        });
        this.selectedSquares$ = this.store.select(selectSelectedSquareIds);
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    getGameInfo(gameCode: string) {
        this.store
            .select(selectUserAndCurrentGame(gameCode))
            .pipe(
                filter(({ user }) => !!user),
                take(1),
            )
            .subscribe(({ user, currentGame }) => {
                this.user = user?.username;
                this.game = currentGame;
                this.loadSelections();
            });
    }

    loadSelections() {
        if (!this.userId || !this.game?.id) {
            return;
        }

        this.store.dispatch(
            loadSelections({
                userId: this.userId,
                gameId: this.game.id,
            }),
        );
    }

    updateSelectedCount(squares: number[]) {
        this.selectedSquares$ = of(squares);
    }

    finishSelection() {
        this.subscriptions.add(
            this.selectedSquares$
                .pipe(
                    take(1),
                    switchMap((selectedSquares) => {
                        const gameId = this.game?.id;
                        const userId = this.userId;

                        if (!gameId || !userId) {
                            console.error(
                                'Cannot save selections: Missing gameId or userId',
                            );
                            return EMPTY;
                        }

                        const squaresCount = selectedSquares.length;
                        const dialogRef = this.dialog.open(
                            ConfrimDialogComponent,
                            {
                                data: {
                                    title: 'Confirm Selection',
                                    message: `You have selected ${squaresCount} squares. Do you want to save?`,
                                },
                            },
                        );

                        return dialogRef.afterClosed().pipe(
                            take(1),
                            filter((confirmed) => confirmed),
                            map(() => ({
                                gameId,
                                userId,
                                selectedSquareIds: selectedSquares,
                            })),
                        );
                    }),
                )
                .subscribe(({ gameId, userId, selectedSquareIds }) => {
                    this.store.dispatch(
                        saveSelectedSquares({
                            gameId,
                            userId,
                            selectedSquareIds,
                        }),
                    );
                }),
        );
    }
}

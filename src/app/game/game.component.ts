import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfrimDialogComponent } from '../dialog/confrim-dialog/confrim-dialog.component';
import { Store } from '@ngrx/store';
import {
    loadSelections,
    saveSelectedSquares,
    updateSelectedSquares,
} from '../store/selections/selections.actions';
import { AppState } from '../store/app.state';
import {
    Observable,
    take,
    map,
    Subscription,
    filter,
    switchMap,
    EMPTY,
    of,
} from 'rxjs';
import {
    selectHasChanges,
    selectSelectedSquareIds,
} from '../store/selections/selections.selectors';
import {
    selectUser,
    selectUserAndCurrentGame,
    selectUserId,
} from '../store/user/user.selectors';
import { ActivatedRoute } from '@angular/router';
import * as UserActions from '../store/user/user.actions';
import * as GameActions from '../store/game/game.actions';
import * as selectionActions from '../store/selections/selections.actions';
import { Game } from '../models/game.model';
import { CreateUserDialogComponent } from '../dialog/create-user-dialog/create-user-dialog.component';
import {
    selectGameId,
    selectGameSettings,
    selectGameStateData,
    selectHaveNumbersBeenGenerated,
    selectUserSelectedSquares,
} from '../store/game/game.seletors';
import { Role } from '../enums/roles.enum';
import { SquareSelection } from '../models/square-selection.model';

@Component({
    selector: 'app-game',
    standalone: false,
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
    selectedSquares$: Observable<number[]>;
    gameUserSelections$: Observable<SquareSelection[]>;
    numbersGenerated$: Observable<boolean> = of(false);
    gameId: string | null;
    userId: string | null = null;
    user$: Observable<string>;
    game: Game | null = null;
    hasChanges$: Observable<boolean>;
    gameState$: Observable<any>;
    isGameAdmin = false;
    role = Role;
    xAxisNumbers = Array(10).fill(null);
    yAxisNumbers = Array(10).fill(null);
    // generated = false;

    private subscriptions = new Set<Subscription>();

    constructor(
        private dialog: MatDialog,
        private store: Store<AppState>,
        private route: ActivatedRoute,
    ) {}

    ngOnInit(): void {
        let gameCodeVar;
        this.route.paramMap
            .pipe(
                map((params) => params.get('gameCode')),
                filter(Boolean),
                take(1),
            )
            .subscribe((gameCode) => {
                gameCodeVar = gameCode;
                this.getGameInfo(gameCode);
            });

        this.gameId = localStorage.getItem('gameId');
        this.userId = localStorage.getItem('userId');
        this.selectedSquares$ = this.store.select(selectSelectedSquareIds);
        this.gameUserSelections$ = this.store.select(selectUserSelectedSquares);
        this.hasChanges$ = this.store.select(selectHasChanges);
        this.user$ = this.store.select(selectUser);
        this.store.dispatch(selectionActions.checkForHasChanges());
        this.gameState$ = this.store.select(selectGameStateData);
        this.numbersGenerated$ = this.store.select(
            selectHaveNumbersBeenGenerated,
        );

        console.log(
            `Initial state: gameId=${this.gameId}, userId=${this.userId}`,
        );

        if (!this.userId) {
            this.openCreateUserDialog();
        } else {
            this.store.dispatch(UserActions.fetchUser({ userId: this.userId }));
        }

        if (this.gameId && this.userId) {
            this.getGameDetails();
        } else {
            if (gameCodeVar) {
                this.store.dispatch(
                    GameActions.getGameId({ gameCode: gameCodeVar as any }),
                );
            }
        }

        this.subscriptions.add(
            this.store
                .select(selectUserId)
                .pipe(
                    filter((user) => !!user),
                    take(1),
                )
                .subscribe((userId) => {
                    this.userId = userId;
                }),
        );

        this.subscriptions.add(
            this.store
                .select(selectGameId)
                .pipe(
                    filter((gameId) => !!gameId),
                    take(1),
                )
                .subscribe((gameId) => {
                    this.gameId = gameId;
                    localStorage.setItem('gameId', gameId);
                }),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.store.dispatch(GameActions.clearCurrentGame());
        this.store.dispatch(selectionActions.clearSelections());
    }

    getGameDetails() {
        this.store.dispatch(
            GameActions.fetchGame({
                userId: this.userId as any,
                gameId: this.gameId as any,
            }),
        );
        this.store.dispatch(
            selectionActions.fetchSelectedSquares({
                gameId: this.gameId,
                userId: this.userId as any,
            }),
        );
    }

    getGameInfo(gameCode: string) {
        this.store
            .select(selectUserAndCurrentGame(gameCode))
            .pipe(
                filter(({ userId, currentGame }) => !!userId && !!currentGame),
                take(1),
            )
            .subscribe(({ userId, currentGame }) => {
                console.log('Fetched userId: ', userId);
                console.log('Fetched current game: ', currentGame);
                this.gameId = currentGame?.id as any;
                localStorage.setItem('gameId', this.gameId as any);

                this.userId = userId || localStorage.getItem('userId');
                this.game = currentGame;
                // this.gameId = currentGame?.id;

                console.log('Updated game info: ', this.game);

                this.loadSelections();
            });
    }

    loadSelections() {
        if (!this.userId || !this.gameId) {
            console.warn('Skipping loadSelections: Missing userId or gameId');
            return;
        }

        this.store.dispatch(
            loadSelections({
                userId: this.userId,
                gameId: this.gameId,
            }),
        );
    }

    openCreateUserDialog(): void {
        console.log('gameId to pass to create user: ', this.gameId);
        const dialogRef = this.dialog.open(CreateUserDialogComponent, {
            width: '400px',
            disableClose: true,
            data: { gameId: this.gameId },
        });

        dialogRef.afterClosed().subscribe((userId) => {
            console.log('** result: ', userId);
            if (userId) {
                console.log('User created with ID:', userId);
                localStorage.setItem('userId', userId);
                this.userId = userId;
                this.getGameDetails();
                this.store.dispatch(UserActions.fetchUser({ userId }));
            } else {
                console.error('User creation was canceled or failed.');
            }
        });
    }

    updateSelectedCount(squareIds: number[]) {
        this.store.dispatch(
            updateSelectedSquares({ selectedSquareIds: squareIds }),
        );
    }

    finishSelection() {
        this.selectedSquares$
            .pipe(
                take(1),
                switchMap((selectedSquareIds) => {
                    if (selectedSquareIds.length === 0) return EMPTY;

                    const dialogRef = this.dialog.open(ConfrimDialogComponent, {
                        data: {
                            title: 'Confirm Selection',
                            message: `You have selected ${selectedSquareIds.length} squares. Do you want to save?`,
                        },
                    });

                    return dialogRef.afterClosed().pipe(
                        take(1),
                        filter((confirmed) => confirmed),
                        map(() => selectedSquareIds),
                    );
                }),
            )
            .subscribe((selectedSquareIds) => {
                console.log('userId: ', this.userId);
                this.store.dispatch(
                    saveSelectedSquares({
                        gameId: this.gameId,
                        userId: this.userId as any,
                        selectedSquareIds,
                    }),
                );
            });
    }

    togglePaymentStatus(player: any, hasPaid: boolean) {
        this.store.dispatch(
            GameActions.updatePlayerPaymentStatus({
                userId: player.userId,
                hasPaid,
            }),
        );
    }

    generateAxisNumbers(): void {
        this.xAxisNumbers = this.shuffleArray(
            Array.from({ length: 10 }, (_, i) => i),
        );
        this.yAxisNumbers = this.shuffleArray(
            Array.from({ length: 10 }, (_, i) => i),
        );
        // this.generated = true;
        this.store.dispatch(
            GameActions.generateSquaresNumbers({
                haveNumbersBeenGenerated: true,
            }),
        );
    }

    // Utility function to shuffle an array using Fisher-Yates algorithm
    shuffleArray(array: number[]): number[] {
        return array
            .map((value) => ({ value, sort: Math.random() })) // Assign a random sort key
            .sort((a, b) => a.sort - b.sort) // Sort based on the random key
            .map(({ value }) => value); // Extract the shuffled values
    }

    gameSettingsSave(settings: any) {
        console.log('dispatch action!:', settings);
        this.store.dispatch(
            GameActions.saveGameSettings({
                gameId: this.gameId as any,
                homeTeam: settings.homeTeam,
                awayTeam: settings.awayTeam,
                pricePerSquare: settings.squarePrice,
            }),
        );
    }

    startGame() {
        this.store.dispatch(
            GameActions.startGame({ gameId: this.gameId as any }),
        );
    }
}

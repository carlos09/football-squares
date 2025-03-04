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
import { Player } from '../models/player.model';
import { CreateUserDialogComponent } from '../dialog/create-user-dialog/create-user-dialog.component';
import {
    selectGameId,
    selectGameStateData,
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
    gameId: string | null;
    userId: string | null = null;
    user$: Observable<string>;
    game: Game | null = null;
    hasChanges$: Observable<boolean>;
    gameState$: Observable<any>;
    isGameAdmin = false;
    role = Role;

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

        console.log(
            `Initial state: gameId=${this.gameId}, userId=${this.userId}`,
        );

        if (!this.userId) {
            console.log('No userId found, opening create user dialog');
            this.openCreateUserDialog();
        } else {
            console.log('UserId found in local storage:', this.userId);
            this.store.dispatch(UserActions.fetchUser({ userId: this.userId }));
        }

        if (this.gameId && this.userId) {
            console.log('GameId found in local storage:', this.gameId);
            this.getGameDetails();
        } else {
            console.log('gameCodeVar: ', gameCodeVar);
            if (gameCodeVar) {
                this.store.dispatch(
                    GameActions.getGameId({ gameCode: gameCodeVar as any }),
                );
            }
            console.log('No gameId found in local storage.');
        }

        // Update userId when fetched from store
        this.subscriptions.add(
            this.store
                .select(selectUserId)
                .pipe(
                    filter((user) => !!user),
                    take(1),
                )
                .subscribe((userId) => {
                    console.log('Updated userId from store:', userId);
                    this.userId = userId;
                }),
        );

        // Update gameId when fetched from store
        this.subscriptions.add(
            this.store
                .select(selectGameId)
                .pipe(
                    filter((gameId) => !!gameId),
                    take(1),
                )
                .subscribe((gameId) => {
                    console.log('Updated gameId from store:', gameId);
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
        console.log('this.gameId before fetch: ', this.gameId);

        this.store
            .select(selectUserAndCurrentGame(gameCode))
            .pipe(
                filter(({ userId, currentGame }) => !!userId && !!currentGame), // ✅ Check `userId` directly
                take(1),
            )
            .subscribe(({ userId, currentGame }) => {
                // ✅ Destructure updated properties
                console.log('Fetched userId: ', userId);
                console.log('Fetched current game: ', currentGame);
                this.gameId = currentGame?.id as any;
                localStorage.setItem('gameId', this.gameId as any);

                this.userId = userId || localStorage.getItem('userId'); // ✅ Direct access to `userId`
                // this.user = username; // ✅ Direct access to `username`
                this.game = currentGame;
                // this.gameId = currentGame?.id;

                console.log('Updated game info: ', this.game);

                this.loadSelections();
            });
    }

    loadSelections() {
        console.log('DO LOAD SELECTIONS!!!');
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
            disableClose: true, // Prevent closing without creating a user
            data: { gameId: this.gameId }, // Pass gameId to the dialog
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
                    if (selectedSquareIds.length === 0) return EMPTY; // Don't proceed if no squares are selected

                    const dialogRef = this.dialog.open(ConfrimDialogComponent, {
                        data: {
                            title: 'Confirm Selection',
                            message: `You have selected ${selectedSquareIds.length} squares. Do you want to save?`,
                        },
                    });

                    return dialogRef.afterClosed().pipe(
                        take(1),
                        filter((confirmed) => confirmed), // Proceed only if confirmed
                        map(() => selectedSquareIds),
                    );
                }),
            )
            .subscribe((selectedSquareIds) => {
                console.log('userId: ', this.userId);
                this.store.dispatch(
                    saveSelectedSquares({
                        gameId: this.gameId, // Ensure gameId is available
                        userId: this.userId as any, // Ensure user is set correctly
                        selectedSquareIds,
                    }),
                );
            });
    }

    togglePaymentStatus(player: any, hasPaid: boolean) {
        console.log('player: p, ', player);
        console.log('hasPaid: ', hasPaid);
        // if (!this.isGameAdmin) return; // Only allow game admin to toggle
        // player.hasPaid = !player.hasPaid;
        this.store.dispatch(
            GameActions.updatePlayerPaymentStatus({
                userId: player.userId,
                hasPaid,
            }),
        );

        // this.gameService.updatePlayerPaymentStatus(player.id, player.hasPaid).subscribe();
    }
}

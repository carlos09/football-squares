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
    tap,
} from 'rxjs';
import { selectSelectedSquareIds } from '../store/selections/selections.selectors';
import {
    selectGameAndUserIds,
    selectUserAndCurrentGame,
    selectUserId,
} from '../store/user/user.selectors';
import { ActivatedRoute } from '@angular/router';
import * as UserActions from '../store/user/user.actions';
import * as GameActions from '../store/game/game.actions';
import * as selectionActions from '../store/selections/selections.actions';
import { Game } from '../models/game.model';
import { CreateUserDialogComponent } from '../dialog/create-user-dialog/create-user-dialog.component';
import { selectGameId } from '../store/game/game.seletors';

@Component({
    selector: 'app-game',
    standalone: false,
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
    selectedSquares$: Observable<number[]>;
    gameId: string | null;
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
        this.gameId = localStorage.getItem('gameId');
        this.userId = localStorage.getItem('userId');

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

        if (this.gameId) {
            console.log('GameId found in local storage:', this.gameId);
            this.store.dispatch(
                GameActions.fetchGame({
                    userId: this.userId,
                    gameId: this.gameId,
                }),
            );
            this.store.dispatch(
                selectionActions.fetchSelectedSquares({ gameId: this.gameId }),
            );
        } else {
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
    }

    findUserByGameCode() {
        this.route.paramMap
            .pipe(
                map((params) => params.get('gameCode')),
                filter(Boolean),
                take(1),
            )
            .subscribe((gameCode) => {
                this.getGameInfo(gameCode);
            });
    }

    getGameInfo(gameCode: string) {
        console.log('this.gameId before fetch: ', this.gameId);

        this.store
            .select(selectUserAndCurrentGame(gameCode))
            .pipe(
                filter(({ userId, currentGame }) => !!userId && !!currentGame), // ✅ Check `userId` directly
                take(1),
            )
            .subscribe(({ userId, username, currentGame }) => {
                // ✅ Destructure updated properties
                console.log('Fetched userId: ', userId);
                console.log('Fetched username: ', username);
                console.log('Fetched current game: ', currentGame);

                this.userId = userId || localStorage.getItem('userId'); // ✅ Direct access to `userId`
                this.user = username; // ✅ Direct access to `username`
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
        const dialogRef = this.dialog.open(CreateUserDialogComponent, {
            width: '400px',
            disableClose: true, // Prevent closing without creating a user
        });

        dialogRef.afterClosed().subscribe((userId) => {
            console.log('** result: ', userId);
            if (userId) {
                console.log('User created with ID:', userId);
                localStorage.setItem('userId', userId);
                this.userId = userId;
                this.store.dispatch(UserActions.fetchUser({ userId }));
            } else {
                console.error('User creation was canceled or failed.');
            }
        });
    }

    updateSelectedCount(squares: number[]) {
        this.selectedSquares$ = of(squares);
    }

    finishSelection() {
        console.log(
            `FINISH SELECTION gameId=${this.gameId}, userId=${this.userId}`,
        );
        // this.subscriptions.add(
        //     this.selectedSquares$
        //         .pipe(
        //             take(1),
        //             switchMap((selectedSquares) =>
        //                 this.store
        //                     .select(
        //                         selectGameAndUserIds(
        //                             this.game?.game_code || '',
        //                         ),
        //                     )
        //                     .pipe(
        //                         filter(({ gameId }) => !!gameId),
        //                         take(1),
        //                         tap(({ gameId, userId }) => {
        //                             console.log(
        //                                 `Fetched from store: gameId=${gameId}, userId=${userId}`,
        //                             );
        //                         }),
        //                         filter(
        //                             ({ gameId, userId }) =>
        //                                 !!gameId && !!userId,
        //                         ), // Proceed only if both exist
        //                         map(({ gameId, userId }) => ({
        //                             gameId,
        //                             userId,
        //                             selectedSquares,
        //                         })),
        //                     ),
        //             ),
        //         )
        //         .subscribe(({ gameId, userId, selectedSquares }) => {
        //             const squaresCount = selectedSquares.length;
        //             const dialogRef = this.dialog.open(ConfrimDialogComponent, {
        //                 data: {
        //                     title: 'Confirm Selection',
        //                     message: `You have selected ${squaresCount} squares. Do you want to save?`,
        //                 },
        //             });
        //             dialogRef.afterClosed().subscribe((confirmed) => {
        //                 if (confirmed) {
        //                     this.store.dispatch(
        //                         saveSelectedSquares({
        //                             gameId,
        //                             userId,
        //                             selectedSquareIds: selectedSquares,
        //                         }),
        //                     );
        //                 }
        //             });
        //         }),
        // );
    }
}

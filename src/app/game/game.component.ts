import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from '../services/game.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialogComponent } from '../dialog/create-user-dialog/create-user-dialog.component';
import { ConfrimDialogComponent } from '../dialog/confrim-dialog/confrim-dialog.component';
import { Store, select } from '@ngrx/store';
// import { createGame, fetchUser } from '../store/start-game/start-game.actions';
import { selectGameId } from '../store/game/game.seletors';
import {
    loadSelections,
    saveSelectedSquares,
} from '../store/selections/selections.actions';
import { AppState } from '../store/app.state';
import {
    Observable,
    combineLatest,
    take,
    switchMap,
    map,
    Subscription,
    of,
} from 'rxjs';
import { UserInfo } from '../models/userinfo.model';
import { selectSelectedSquareIds } from '../store/selections/selections.selectors';
import { selectUserId } from '../store/user/user.selectors';

@Component({
    selector: 'app-game',
    standalone: false,
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit, OnDestroy {
    title = 'football-squares';
    selectedSquares$!: Observable<number[]>;
    gameId: string = '';
    username: string = '';
    userId: string = '';
    userInfo$!: Observable<UserInfo>;
    private subscriptions = new Set<Subscription>();

    constructor(
        private gameService: GameService,
        private dialog: MatDialog,
        private store: Store<AppState>,
    ) {}

    ngOnInit() {
        this.initializeGame();

        // Combine observables to avoid multiple subscriptions
        const gameId$ = this.store.pipe(select(selectGameId));
        const userId$ = this.store.pipe(select(selectUserId));

        // this.subscriptions.add(
        //     combineLatest([gameId$, userId$]).subscribe(([gameId, userId]) => {
        //         this.gameId = gameId;
        //         this.userId = userId;

        //         if (gameId) {
        //             localStorage.setItem('gameId', gameId);
        //         }
        //         if (userId) {
        //             this.loadSelections();
        //         }
        //     }),
        // );

        // this.userInfo$ = this.store.pipe(select(selectUserInfo));
        this.selectedSquares$ = this.store.pipe(
            select(selectSelectedSquareIds),
        );
    }

    ngOnDestroy() {
        // Unsubscribe to prevent memory leaks
        this.subscriptions.forEach((sub) => sub.unsubscribe());
    }

    initializeGame() {
        const storedUserId = localStorage.getItem('userId');
        const storedGameId = localStorage.getItem('gameId');
        console.log('storedGameId', storedGameId);
        if (!storedGameId) {
            // this.createNewGameAndPromptUser();
        } else {
            this.gameId = storedGameId;
            if (!storedUserId) {
                // this.openCreateUserDialog(this.gameId);
            } else {
                this.fetchGameDataByUserId(storedUserId, this.gameId);
            }
        }
    }

    loadSelections() {
        if (this.userId && this.gameId) {
            this.store.dispatch(loadSelections({ userId: this.userId }));
        }
    }

    // createNewGameAndPromptUser() {
    //     this.store.dispatch(createGame(this.userId));
    // }

    joinGame() {
        console.log('joinGame()');
        this.subscriptions.add(
            this.gameService
                .joinGame(this.gameId, this.username)
                .subscribe((response) => {
                    console.log('Joined Game:', response);
                }),
        );
    }

    updateSelectedCount(squares: number[]) {
        this.selectedSquares$ = of(squares);
    }

    // openCreateUserDialog(gameId: string) {
    //     const dialogRef = this.dialog.open(CreateUserDialogComponent, {
    //         width: '400px',
    //         disableClose: true,
    //         data: { gameId },
    //     });

    //     this.subscriptions.add(
    //         dialogRef.afterClosed().subscribe((result) => {
    //             if (result) {
    //                 localStorage.setItem('userId', result.user_id);
    //                 this.username = result.username;
    //             }
    //         }),
    //     );
    // }

    finishSelection() {
        this.subscriptions.add(
            this.selectedSquares$
                .pipe(
                    take(1),
                    switchMap((selectedSquares) => {
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
                            map((confirmed) => ({
                                confirmed,
                                selectedSquareIds: selectedSquares,
                            })),
                        );
                    }),
                )
                .subscribe(({ confirmed, selectedSquareIds }) => {
                    if (confirmed) {
                        this.store.dispatch(
                            saveSelectedSquares({ selectedSquareIds }),
                        );
                    }
                }),
        );
    }

    fetchGameDataByUserId(userId: string, gameId: string) {
        console.log('fetch user by id?');
        // this.store.dispatch(fetchUser({ userId, gameId }));
    }
}

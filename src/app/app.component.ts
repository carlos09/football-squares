import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialogComponent } from './dialog/create-user-dialog/create-user-dialog.component';
import { ConfrimDialogComponent } from './dialog/confrim-dialog/confrim-dialog.component';
import { Store } from '@ngrx/store';
import {
    createGame,
    fetchUser,
    setGameIdCred,
    setUserIdCred,
} from './store/start-game/start-game.actions';
import {
    selectGameId,
    selectUserId,
    selectUserInfo,
} from './store/start-game/start-game.seletors';
import {
    loadSelections,
    saveSelectedSquares,
} from './store/selections/selections.actions';
import { AppState } from './store/app.state';
import { environment } from 'src/environments/environment';
import {
    map,
    Observable,
    Observer,
    of,
    Operator,
    Subscription,
    switchMap,
    take,
} from 'rxjs';
import { UserInfo } from './models/userinfo.model';
import { selectSelectedSquareIds } from './store/selections/selections.selectors';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false,
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    title = 'football-squares';
    selectedSquares$!: Observable<number[]>;
    gameId: string = '';
    username: string = '';
    userId: string = '';
    userInfo$!: Observable<UserInfo>;

    constructor(
        private gameService: GameService,
        private dialog: MatDialog,
        private _store: Store<AppState>,
    ) {}

    ngOnInit() {
        let userId = localStorage.getItem('userId');
        let gameId = localStorage.getItem('gameId');

        if (!gameId) {
            this.createNewGameAndPromptUser();
        } else {
            this.gameId = gameId;
            if (!userId) {
                this.openCreateUserDialog(this.gameId);
            } else {
                this.fetchGameDataByUserId(userId, gameId);
            }
        }
        this._store.select(selectGameId).subscribe((gameId) => {
            this.gameId = gameId;
            if (this.gameId) {
                localStorage.setItem('gameId', this.gameId);
            }
        });
        this._store.select(selectUserId).subscribe((userId) => {
            this.userId = userId;
            this.loadSelections();
        });
        this.userInfo$ = this._store.select(selectUserInfo);
        this.selectedSquares$ = this._store.select(selectSelectedSquareIds);
    }

    loadSelections() {
        if (this.userId && this.gameId) {
            this._store.dispatch(loadSelections({ userId: this.userId }));
        }
    }

    createNewGameAndPromptUser() {
        this._store.dispatch(createGame());
    }

    joinGame() {
        console.log('joinGame()');
        this.gameService
            .joinGame(this.gameId, this.username)
            .subscribe((response) => {
                console.log('Joined Game:', response);
            });
    }

    updateSelectedCount(squares: number[]) {
        this.selectedSquares$ = of(squares);
    }

    openCreateUserDialog(gameId: string) {
        const dialogRef = this.dialog.open(CreateUserDialogComponent, {
            width: '400px',
            disableClose: true,
            data: { gameId },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                localStorage.setItem('userId', result.user_id);
                this.username = result.username;
            }
        });
    }

    finishSelection() {
        this.selectedSquares$
            .pipe(
                take(1),
                switchMap((selectedSquares) => {
                    const squaresCount = selectedSquares.length;

                    const dialogRef = this.dialog.open(ConfrimDialogComponent, {
                        data: {
                            title: 'Confirm Selection',
                            message: `You have selected ${squaresCount} squares. Do you want to save?`,
                        },
                    });

                    return dialogRef.afterClosed().pipe(
                        take(1), // Ensure we only take the first response and complete
                        map((confirmed) => ({
                            confirmed,
                            selectedSquareIds: selectedSquares,
                        })),
                    );
                }),
            )
            .subscribe(({ confirmed, selectedSquareIds }) => {
                if (confirmed) {
                    this._store.dispatch(
                        saveSelectedSquares({ selectedSquareIds }),
                    );
                }
            });
    }

    fetchGameDataByUserId(userId: string, gameId: string) {
        this._store.dispatch(fetchUser({ userId, gameId }));
    }
}

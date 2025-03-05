import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as startGameActions from '../store/game/game.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { filter, Observable, take } from 'rxjs';
// import { selectGameUrl } from '../store/game/game.seletors';
import { CreateUserDialogComponent } from '../dialog/create-user-dialog/create-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as userActions from '../store/user/user.actions';
import * as GameActions from '../store/game/game.actions';
import { Game } from '../models/game.model';
import { selectUser, selectUserGames } from '../store/user/user.selectors';
import { selectGameId, selectGameUrl } from '../store/game/game.seletors';

@Component({
    selector: 'app-landing',
    standalone: false,
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
    gameCode$!: Observable<string>;
    gameUrl$!: Observable<string>;
    games$!: Observable<Game[]>;
    userId: string | null = null;
    user$: Observable<string>;

    constructor(
        private router: Router,
        private store: Store<AppState>,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.gameUrl$ = this.store.select(selectGameUrl);
        this.games$ = this.store.select(selectUserGames);
        this.userId = localStorage.getItem('userId');
        this.user$ = this.store.select(selectUser);

        if (this.userId) {
            this.store.dispatch(userActions.fetchUser({ userId: this.userId }));
        }

        this.store
            .select(selectGameId)
            .pipe(
                filter((gameId) => !!gameId), // No destructuring needed
                take(1),
            )
            .subscribe((gameId) => {
                console.log('NOW HAVE GAMEID: ', gameId);
                localStorage.setItem('gameId', gameId);
            });

        this.store
            .select(selectGameUrl)
            .pipe(
                filter((gameCode) => !!gameCode), // Ensure gameCode is not null/undefined
                take(1), // Navigate only once when it's populated
            )
            .subscribe((gameCode) => {
                console.log('Navigating to game with gameCode:', gameCode);
                this.navigateToGame(gameCode);
            });
    }

    navigateToGame(gameCode: string) {
        console.log('gameId: ', gameCode);
        this.router.navigate(['/game', gameCode]);
    }

    createGame() {
        this.userId = localStorage.getItem('userId');

        if (this.userId) {
            this.store.dispatch(
                startGameActions.createGame({ userId: this.userId }),
            );
        } else {
            const dialogRef = this.dialog.open(CreateUserDialogComponent);

            dialogRef.afterClosed().subscribe((userId: string | null) => {
                if (userId) {
                    this.store.dispatch(
                        startGameActions.createGame({ userId }),
                    );
                }
            });
        }
    }

    clearLocalStorage() {
        localStorage.clear();
        console.log('Local storage cleared');
    }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as startGameActions from '../store/game/game.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { filter, Observable, take } from 'rxjs';
import { selectGameUrl } from '../store/game/game.seletors';
import { CreateUserDialogComponent } from '../dialog/create-user-dialog/create-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as userActions from '../store/user/user.actions';
import { Game } from '../models/game.model';
import { selectUserGames } from '../store/user/user.selectors';

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

    constructor(
        private router: Router,
        private store: Store<AppState>,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.gameUrl$ = this.store.select(selectGameUrl);
        this.games$ = this.store.select(selectUserGames);
        this.userId = localStorage.getItem('userId');

        if (this.userId) {
            this.store.dispatch(userActions.fetchUser({ userId: this.userId }));
        }

        this.gameUrl$.pipe(filter((url) => !!url)).subscribe((url) => {
            this.router.navigate([`/game/${url}`]);
        });
    }

    createGame() {
        this.userId = localStorage.getItem('userId');

        if (this.userId) {
            // User exists, create game directly
            this.store.dispatch(
                startGameActions.createGame({ userId: this.userId }),
            );
        } else {
            // Open Create User Dialog and proceed with game creation after success
            const dialogRef = this.dialog.open(CreateUserDialogComponent);

            dialogRef.afterClosed().subscribe((userId: string | null) => {
                console.log('closed now with: ', userId);
                if (userId) {
                    console.log('dispatch create game with', userId);
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

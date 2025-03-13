import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as startGameActions from '../store/game/game.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { filter, Observable, of, Subject, take, takeUntil } from 'rxjs';
import { CreateUserDialogComponent } from '../dialog/create-user-dialog/create-user-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as userActions from '../store/user/user.actions';
import { Game } from '../models/game.model';
import { selectUser, selectUserGames } from '../store/user/user.selectors';
import { selectGameUrl } from '../store/game/game.selectors';
import { LoginDialogComponent } from '../dialog/login-dialog/login-dialog.component';
import { selectIsAuthenticated } from '../store/auth/auth.selectors';
import * as AuthSelectors from 'src/app/store/auth/auth.selectors';

@Component({
    selector: 'app-landing',
    standalone: false,
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {
    gameUrl$!: Observable<string>;
    games$!: Observable<Game[]>;
    userId: string | null = null;
    user$: Observable<string>;
    isAuthenticated$: Observable<boolean> = of(false);
    private unsubscribe$ = new Subject<void>();

    constructor(
        private router: Router,
        private store: Store<AppState>,
        private dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.gameUrl$ = this.store.select(selectGameUrl);
        this.games$ = this.store.select(selectUserGames);
        this.user$ = this.store.select(selectUser);
        this.store
            .select(AuthSelectors.selectAuthUser)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((userId) => (this.userId = userId as any));
        this.isAuthenticated$ = this.store.select(selectIsAuthenticated);

        if (this.userId) {
            this.store.dispatch(userActions.fetchUser({ userId: this.userId }));
        }

        this.store
            .select(selectGameUrl)
            .pipe(
                filter((gameCode) => !!gameCode),
                take(1),
            )
            .subscribe((gameCode) => {
                this.navigateToGame(gameCode);
            });
    }

    navigateToGame(gameCode: string) {
        this.router.navigate(['/game', gameCode]);
    }

    createGame() {
        this.user$.pipe(take(1)).subscribe((userId) => {
            if (userId) {
                this.store.dispatch(startGameActions.createGame({ userId }));
            } else {
                const dialogRef = this.dialog.open(CreateUserDialogComponent);
                dialogRef
                    .afterClosed()
                    .subscribe((newUserId: string | null) => {
                        if (newUserId) {
                            this.store.dispatch(
                                startGameActions.createGame({
                                    userId: newUserId,
                                }),
                            );
                        }
                    });
            }
        });
    }

    login() {
        const dialogRef = this.dialog.open(LoginDialogComponent);

        dialogRef.afterClosed().subscribe((userId: string | null) => {
            console.log('login successful');
            this.store.dispatch(
                userActions.fetchUser({ userId: userId as any }),
            );
        });
    }

    clearLocalStorage() {
        localStorage.clear();
        console.log('Local storage cleared');
    }
}

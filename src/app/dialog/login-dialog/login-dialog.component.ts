import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import * as AuthActions from 'src/app/store/auth/auth.actions';
import * as AuthSelectors from 'src/app/store/auth/auth.selectors';

@Component({
    selector: 'app-login-dialog',
    standalone: false,
    templateUrl: './login-dialog.component.html',
    styleUrl: './login-dialog.component.scss',
})
export class LoginDialogComponent implements OnInit, OnDestroy {
    username = '';
    password = '';
    errorMessage = '';
    userId = '';
    private unsubscribe$ = new Subject<void>();

    constructor(
        private dialogRef: MatDialogRef<LoginDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { userId?: string },
        private store: Store,
    ) {}

    ngOnInit(): void {
        this.store
            .select(AuthSelectors.selectAuthUser)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((userId) => (this.userId = userId as any));
        this.store
            .select(AuthSelectors.selectIsAuthenticated)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((isAuthenticated) => {
                console.log('isAuth: ', isAuthenticated);
                if (isAuthenticated) {
                    this.dialogRef.close(this.userId);
                }
                // localStorage.setItem('userId', userId);
                // this.dialogRef.close(userId);
            });
    }

    login() {
        if (!this.username || !this.password) {
            this.errorMessage = 'Username and password are required.';
            return;
        }

        this.store.dispatch(
            AuthActions.login({
                username: this.username,
                password: this.password,
            }),
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

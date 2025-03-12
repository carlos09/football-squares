import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import * as AuthActions from 'src/app/store/auth/auth.actions';

@Component({
    selector: 'app-login-dialog',
    standalone: false,
    templateUrl: './login-dialog.component.html',
    styleUrl: './login-dialog.component.scss',
})
export class LoginDialogComponent implements OnDestroy {
    username = '';
    password = '';
    errorMessage = '';
    private unsubscribe$ = new Subject<void>();

    constructor(
        private dialogRef: MatDialogRef<LoginDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { userId?: string },
        private store: Store,
    ) {}

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

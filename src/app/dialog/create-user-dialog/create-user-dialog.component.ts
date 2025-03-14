import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as userSelectors from 'src/app/store/user/user.selectors';
import * as authSelectors from 'src/app/store/auth/auth.selectors';
import { createUser } from 'src/app/store/user/user.actions';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-create-user-dialog',
    standalone: false,
    templateUrl: './create-user-dialog.component.html',
    styleUrls: ['./create-user-dialog.component.scss'],
})
export class CreateUserDialogComponent implements OnInit, OnDestroy {
    username = '';
    password = '';
    errorMessage = '';
    private unsubscribe$ = new Subject<void>();

    constructor(
        private dialogRef: MatDialogRef<CreateUserDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { gameId?: string },
        private store: Store,
    ) {}

    ngOnInit(): void {
        this.store
            .select(userSelectors.selectCreateUserError)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((error) => {
                this.errorMessage = error || '';
            });

        this.store
            .select(userSelectors.selectUserId)
            .pipe(
                filter((userId) => !!userId),
                takeUntil(this.unsubscribe$),
            )
            .subscribe((userId) => {
                localStorage.setItem('userId', userId);
                this.dialogRef.close(userId);
            });

        this.store
            .select(authSelectors.selectAuthToken)
            .pipe(
                filter((token) => !!token),
                takeUntil(this.unsubscribe$),
            )
            .subscribe((token) => {
                localStorage.setItem('token', token as string);
            });
    }

    createUser() {
        if (!this.username || !this.password) {
            this.errorMessage = 'Username and password are required.';
            return;
        }

        this.store.dispatch(
            createUser({
                username: this.username,
                password: this.password,
                gameId: this.data?.gameId,
            }),
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

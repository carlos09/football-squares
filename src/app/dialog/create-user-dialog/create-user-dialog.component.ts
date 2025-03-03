import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import * as userSelectors from 'src/app/store/user/user.selectors';
import { createUser } from 'src/app/store/user/user.actions';
import { filter, Subject, takeUntil, tap } from 'rxjs';

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
        @Inject(MAT_DIALOG_DATA) public data: { gameId: string },
        private store: Store,
    ) {}

    ngOnInit(): void {
        // ✅ Listen for error messages
        this.store
            .select(userSelectors.selectCreateUserError)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((error) => {
                this.errorMessage = error || ''; // Show error if applicable
            });

        // ✅ Continuously listen for userId until it's available
        this.store
            .select(userSelectors.selectUserId)
            .pipe(
                tap((userId) => console.log('User from store:', userId)), // Debugging step
                filter((userId) => !!userId), // Ensure userId is valid
                takeUntil(this.unsubscribe$), // Keep listening until component is destroyed
            )
            .subscribe((userId) => {
                console.log('User ID received:', userId);
                localStorage.setItem('userId', userId); // Store userId
                this.dialogRef.close(userId); // Close dialog with userId
            });
    }

    createUser() {
        console.log(`Creating user - username: ${this.username}`);
        console.log('create user with gameId: ', this.data.gameId);

        if (!this.username || !this.password) {
            this.errorMessage = 'Username and password are required.';
            return;
        }

        this.store.dispatch(
            createUser({
                username: this.username,
                password: this.password,
                gameId: this.data.gameId,
            }),
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

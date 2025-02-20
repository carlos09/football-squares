import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '../../services/game.service';
import { Store } from '@ngrx/store';
import * as userSelectors from 'src/app/store/user/user.selectors';
import { createUser } from 'src/app/store/user/user.actions';
import { filter, Subject, take, takeUntil } from 'rxjs';

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
        private store: Store,
    ) {}

    ngOnInit(): void {
        this.store
            .select(userSelectors.selectCreateUserError)
            .subscribe((error) => {
                this.errorMessage = error || ''; // Show "Username already taken" if applicable
            });
        // this.store.select(selectCreateUserError).subscribe((error) => {
        //     this.errorMessage = error || ''; // Show "Username already taken" if applicable
        // });

        // this.store.select(selectCreateUserSuccess).subscribe((success) => {
        //     if (success) {
        //         console.log('success!');
        //         this.dialogRef.close();
        //     }
        // });

        this.store.select(userSelectors.selectUserState).subscribe((state) => {
            console.log('Full User State:', state);
        });

        this.store
            .select(userSelectors.selectCreatedUser)
            .pipe(
                filter((user) => !!user),
                take(1),
            )
            .subscribe((user) => {
                console.log('in here');
                if (user) {
                    console.log('made it in here', user);
                    localStorage.setItem('userId', user.userId); // Store userId
                    this.dialogRef.close(user.userId); // Close dialog and pass userId
                }
            });
    }

    createUser() {
        if (!this.username || !this.password) return;

        this.store.dispatch(
            createUser({ username: this.username, password: this.password }),
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}

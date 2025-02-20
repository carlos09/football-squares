import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, tap } from 'rxjs/operators';
import { showSnackbar } from './shared.actions';

@Injectable()
export class SnackbarEffects {
    constructor(private actions$: Actions, private snackBar: MatSnackBar) {}

    showSnackbar$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(showSnackbar),
                tap(({ message, action, duration }) => {
                    this.snackBar.open(message, action || 'OK', {
                        duration: duration || 3000,
                    });
                }),
            ),
        { dispatch: false },
    );
}

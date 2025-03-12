import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map } from 'rxjs';
import { selectAuthState, selectAuthUser } from '../store/auth/auth.selectors';
import { AuthState } from '../store/auth/auth.reducer';

@Injectable({
    providedIn: 'root',
})
export class AuthGuard implements CanActivate {
    constructor(
        private store: Store<{ AUTH_STATE_NAME: AuthState }>,
        private router: Router,
    ) {}

    canActivate() {
        return this.store.select(selectAuthState).pipe(
            map((authState) => {
                if (
                    authState.isAuthenticated ||
                    localStorage.getItem('token')
                ) {
                    return true;
                } else {
                    this.router.navigate(['/']);
                    return false;
                }
            }),
        );
    }
}

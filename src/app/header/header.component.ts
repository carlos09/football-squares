import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../store/app.state';
import { selectUser } from '../store/user/user.selectors';
import * as AuthActions from '../store/auth/auth.actions';

@Component({
    selector: 'app-header',
    standalone: false,
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
    user$: Observable<string>;
    isDropdownOpen = false;

    constructor(
        private store: Store<AppState>,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.user$ = this.store.select(selectUser);
    }

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    logout() {
        this.store.dispatch(AuthActions.logout());
        this.isDropdownOpen = false;
    }
}

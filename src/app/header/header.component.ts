import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../store/app.state';
import { selectUser } from '../store/user/user.selectors';

@Component({
    selector: 'app-header',
    standalone: false,
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
    user$: Observable<string>;

    constructor(
        private store: Store<AppState>,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.user$ = this.store.select(selectUser);
    }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { GameService } from './services/game.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialogComponent } from './dialog/create-user-dialog/create-user-dialog.component';
import { ConfrimDialogComponent } from './dialog/confrim-dialog/confrim-dialog.component';
import { Store, select } from '@ngrx/store';
import { createGame } from './store/game/game.actions';
import {
    selectGameId,
    // selectUserId,
    // selectUserInfo,
} from './store/game/game.seletors';
import {
    loadSelections,
    saveSelectedSquares,
} from './store/selections/selections.actions';
import { AppState } from './store/app.state';
import {
    Observable,
    of,
    combineLatest,
    take,
    switchMap,
    map,
    Subscription,
} from 'rxjs';
import { UserInfo } from './models/userinfo.model';
import { selectSelectedSquareIds } from './store/selections/selections.selectors';

@Component({
    selector: 'app-root',
    standalone: false,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    title = 'football-squares';
    ngOnInit(): void {
        console.log('game home page');
    }
}

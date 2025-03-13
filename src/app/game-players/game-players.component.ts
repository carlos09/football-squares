import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../store/app.state';
import { selectGameStateData } from '../store/game/game.selectors';
import { Role } from '../enums/roles.enum';
import * as GameActions from '../store/game/game.actions';

@Component({
    selector: 'app-game-players',
    standalone: false,
    templateUrl: './game-players.component.html',
    styleUrl: './game-players.component.scss',
})
export class GamePlayersComponent implements OnInit {
    gameState$: Observable<any>;
    role = Role;

    constructor(private store: Store<AppState>) {}

    ngOnInit(): void {
        this.gameState$ = this.store.select(selectGameStateData);
    }

    togglePaymentStatus(player: any, hasPaid: boolean) {
        this.store.dispatch(
            GameActions.updatePlayerPaymentStatus({
                userId: player.userId,
                hasPaid,
            }),
        );
    }
}

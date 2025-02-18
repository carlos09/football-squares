import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialogComponent } from './dialog/create-user-dialog/create-user-dialog.component';
import { ConfrimDialogComponent } from './dialog/confrim-dialog/confrim-dialog.component';
import { Store } from '@ngrx/store';
import { fetchUser, setGameIdCred, setUserIdCred } from './store/start-game/start-game.actions';
import { selectUserId, selectUserInfo } from './store/start-game/start-game.seletors';
import { loadSelections } from './store/selections/selections.actions';
import { AppState } from './store/app.state';
import { environment } from 'src/environments/environment';
import { Observable, Observer, Operator, Subscription } from 'rxjs';
import { UserInfo } from './models/userinfo.model';
import { selectSelectedSquareIds } from './store/selections/selections.selectors';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'football-squares';
  selectedSquares$!: Observable<number[]>;
  gameId: string = '';
  username: string = '';
  userId: string = '';
  userInfo$!: Observable<UserInfo>;


  constructor(
    private gameService: GameService,
    private dialog: MatDialog,
    private _store: Store<AppState>) {}

  ngOnInit() {
    let userId = localStorage.getItem('userId');
    let gameId = localStorage.getItem('gameId');

    if (!gameId) {
      this.createNewGameAndPromptUser();
    } else {
      this.gameId = gameId;
      this._store.dispatch(setGameIdCred({ gameId}));
      if (!userId) {
        this.openCreateUserDialog(this.gameId);
      } else {
        // console.log('local storage userId: ', userId);
        // this._store.dispatch(setUserIdCred({ userId}));
        this.fetchGameDataByUserId(userId);
      }
    }

    this._store.select(selectUserId).subscribe((userId) => {
      this.userId = userId;
    });
    this.userInfo$ = this._store.select(selectUserInfo);
    this.selectedSquares$ = this._store.select(selectSelectedSquareIds);
  }

  createNewGameAndPromptUser() {
    this.gameService.createGame().subscribe(response => {
      this.gameId = response.gameId;
      localStorage.setItem('gameId', this.gameId);

      
      if (response.url_id) {
        localStorage.setItem('urlId', response.url_id); // Save URL ID
      }
      
      this.openCreateUserDialog(this.gameId);
    });
  }
  

  createNewGame() {
    this.gameService.createGame().subscribe(response => {
      this.gameId = response.gameId;
    });
  }
  
  joinGame() {
    this.gameService.joinGame(this.gameId, this.username).subscribe(response => {
      console.log('Joined Game:', response);
    });
  }

  updateSelectedCount(squares: number[]) {
    console.log('selected squares: ', squares);
    // this.selectedSquares = squares;
  }

  openCreateUserDialog(gameId: string) {
    const dialogRef = this.dialog.open(CreateUserDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { gameId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('result: ', result);
        console.log('User created:', result);
        localStorage.setItem('userId', result.user_id);
        this.username = result.username;
      }
    });
  }


  finishSelection() {
    const dialogRef = this.dialog.open(ConfrimDialogComponent, {
      data: {
        title: 'Confirm Selection',
        message: `You have selected squares. Do you want to save?`
      }
    });
  
    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.confirmSquareSelections();
      }
    });
  }

  confirmSquareSelections() {
    const gameId = localStorage.getItem('gameId');
    const userId = localStorage.getItem('userId');

    // if (gameId && userId) {
    //   this.gameService.postSquareSelections(gameId, userId, Array.from(this.selectedSquares))
    //     .subscribe(response => {
    //       console.log('Selection saved successfully:', response);
    //     }, error => {
    //       console.error('Error saving selection:', error);
    //     });
    // } else {
    //   console.error('Missing gameId or userId');
    // }
}

  fetchGameDataByUserId(userId: string) {
    this._store.dispatch(fetchUser({ userId }));
  }  
}

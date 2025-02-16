import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserDialogComponent } from './dialog/create-user-dialog/create-user-dialog.component';
import { ConfrimDialogComponent } from './dialog/confrim-dialog/confrim-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'football-squares';
  selectedSquares: number[] = [];
  gameId: string = '';
  username: string = '';

  constructor(
    private gameService: GameService,
    private dialog: MatDialog) {}

  ngOnInit() {
    let userId = localStorage.getItem('userId');
    let gameId = localStorage.getItem('gameId');

    if (!gameId) {
      this.createNewGameAndPromptUser();
    } else {
      this.gameId = gameId;
      if (!userId) {
        this.openCreateUserDialog(this.gameId);
      } else {
        this.fetchUsername(userId);
        this.fetchSelections(userId);
      }
    }
  }

  createNewGameAndPromptUser() {
    this.gameService.createGame().subscribe(response => {
      console.log('response: ', response);
      this.gameId = response.gameId;
      localStorage.setItem('gameId', this.gameId);

      
      if (response.url_id) {
        localStorage.setItem('urlId', response.url_id); // Save URL ID
      }
  
      console.log('Game Created:', response);
      
      this.openCreateUserDialog(this.gameId);
    });
  }
  

  createNewGame() {
    this.gameService.createGame().subscribe(response => {
      this.gameId = response.gameId;
      console.log('Game Created:', response);
    });
  }
  
  joinGame() {
    this.gameService.joinGame(this.gameId, this.username).subscribe(response => {
      console.log('Joined Game:', response);
    });
  }

  updateSelectedCount(squares: number[]) {
    console.log('selected squares: ', squares);
    this.selectedSquares = squares;
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
        message: `You have selected ${this.selectedSquares.length} squares. Do you want to save?`
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

    if (gameId && userId) {
      this.gameService.postSquareSelections(gameId, userId, Array.from(this.selectedSquares))
        .subscribe(response => {
          console.log('Selection saved successfully:', response);
        }, error => {
          console.error('Error saving selection:', error);
        });
    } else {
      console.error('Missing gameId or userId');
    }
}

  fetchUsername(userId: string) {
    this.gameService.getUserById(userId).subscribe(response => {
      if (response && response.username) {
        this.username = response.username;
        console.log('Username retrieved:', this.username);
      }
    }, error => {
      console.error('Error fetching username:', error);
    });
  }

  fetchSelections(userId: string) {
    this.gameService.getUserSelections(userId).subscribe(response => {
      if (response) {
        // this.username = response.username;
        console.log('selections saved:', response);
      }
    }, error => {
      console.error('Error fetching selections:', error);
    });
  }
  
}

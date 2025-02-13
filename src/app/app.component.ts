import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'football-squares';
  selectedCount = 0;
  gameId: string = '';
  username: string = '';

  constructor(private gameService: GameService) {}

  ngOnInit() {
    let userId = localStorage.getItem('userId');
    // console.log('userId: ', userId);
    if (!userId) {
      userId = crypto.randomUUID();
      // localStorage.setItem('userId', userId);
      console.log('theres no userId, open dialog to create a user and password', userId);
    }
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

  updateSelectedCount(count: number) {
    this.selectedCount = count;
  }

  finishSelection() {
    alert(`You selected ${this.selectedCount} squares!`);
  }
}

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-create-user-dialog',
  standalone: false,
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss']
})
export class CreateUserDialogComponent {
  username = '';
  password = '';
  gameId: string;

  constructor(
    private dialogRef: MatDialogRef<CreateUserDialogComponent>,
    private gameService: GameService,
    @Inject(MAT_DIALOG_DATA) public data: { gameId: string } // Get gameId from parent component
  ) {
    this.gameId = data.gameId;
  }

  createUser() {
    if (!this.username || !this.password) return;
    
    this.gameService.createUser(this.gameId, this.username, this.password).subscribe({
      next: (response) => {
        console.log("User created successfully:", response);
        this.dialogRef.close(response);
      },
      error: (err) => {
        console.error("Error response:", err);
        const errorMessage = err?.error?.message || "An unknown error occurred.";
        alert(errorMessage);
      }
    });
  }
  
}

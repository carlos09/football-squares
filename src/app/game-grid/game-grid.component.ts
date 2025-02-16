import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SquarePickComponent } from '../dialog/square-pick/square-pick.component';

@Component({
  selector: 'app-game-grid',
  standalone: false,
  templateUrl: './game-grid.component.html',
  styleUrl: './game-grid.component.scss'
})
export class GameGridComponent {
  @Output() selectionChanged = new EventEmitter<number[]>();

  numbers = Array.from({ length: 100 }, (_, i) => i + 1);
  selectedSquares: number[] = [];

  toggleSquare(num: number) {
    const index = this.selectedSquares.indexOf(num);
    if (index > -1) {
      this.selectedSquares.splice(index, 1); // Remove from array
    } else {
      this.selectedSquares.push(num); // Add to array
    }
    this.selectionChanged.emit(this.selectedSquares); // Emit updated array
  }
}

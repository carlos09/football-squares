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
  @Output() selectionChanged = new EventEmitter<number>();

  numbers = Array.from({ length: 100 }, (_, i) => i + 1);
  selectedSquares: Set<number> = new Set();

  toggleSquare(num: number) {
    if (this.selectedSquares.has(num)) {
      this.selectedSquares.delete(num);
    } else {
      this.selectedSquares.add(num);
    }
    this.selectionChanged.emit(this.selectedSquares.size);
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SquarePickComponent } from '../dialog/square-pick/square-pick.component';
import { Store } from '@ngrx/store';
import { loadSelections } from '../store/selections/selections.actions';
import { selectSelectedSquareIds } from '../store/selections/selections.selectors';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game-grid',
    standalone: false,
    templateUrl: './game-grid.component.html',
    styleUrl: './game-grid.component.scss',
})
export class GameGridComponent {
    @Input() selectedSquares: number[] = [];
    @Output() selectionChanged = new EventEmitter<number[]>();
    numbers = Array.from({ length: 100 }, (_, i) => i + 1);

    toggleSquare(num: number) {
        const index = this.selectedSquares.indexOf(num);
        const updatedSelection =
            index > -1
                ? this.selectedSquares.filter((id) => id !== num) // Remove the square
                : [...this.selectedSquares, num]; // Add the square

        this.selectedSquares = updatedSelection; // Update the property
        console.log('selection:: ', this.selectedSquares);

        this.selectionChanged.emit(this.selectedSquares); // Emit updated array
    }

    updateSelection(squareIds: number[]) {
        this.selectedSquares = squareIds;
        this.selectionChanged.emit(this.selectedSquares);
    }
}

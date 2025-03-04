import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SquarePickComponent } from '../dialog/square-pick/square-pick.component';
import { Store } from '@ngrx/store';
import { loadSelections } from '../store/selections/selections.actions';
import { selectSelectedSquareIds } from '../store/selections/selections.selectors';
import { Observable } from 'rxjs';
import { SquareSelection } from '../models/square-selection.model';

@Component({
    selector: 'app-game-grid',
    standalone: false,
    templateUrl: './game-grid.component.html',
    styleUrl: './game-grid.component.scss',
})
export class GameGridComponent {
    @Input() selectedSquares: number[] = [];
    @Input() takenSquares: SquareSelection[] = [];
    @Output() selectionChanged = new EventEmitter<number[]>();
    numbers = Array.from({ length: 100 }, (_, i) => i + 1);

    toggleSquare(num: number) {
        if (this.isTaken(num)) return; // Prevent selection if already taken

        const index = this.selectedSquares.indexOf(num);
        const updatedSelection =
            index > -1
                ? this.selectedSquares.filter((id) => id !== num) // Remove the square
                : [...this.selectedSquares, num]; // Add the square

        this.selectedSquares = updatedSelection;
        console.log('selection:: ', this.selectedSquares);

        this.selectionChanged.emit(this.selectedSquares);
    }

    isTaken(num: number): boolean {
        return this.takenSquares.some(
            (selection) => selection.squareId === num,
        );
    }
}

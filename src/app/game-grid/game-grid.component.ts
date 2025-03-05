import { Component, EventEmitter, Input, Output } from '@angular/core';
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
        console.log('this.selectedSquares: ', this.selectedSquares);
        if (this.isTaken(num)) return;

        const updatedSelection = this.selectedSquares.includes(num)
            ? this.selectedSquares.filter((id) => id !== num)
            : [...this.selectedSquares, num];

        this.selectionChanged.emit([...updatedSelection]);
    }

    isTaken(num: number): boolean {
        if (this.selectedSquares.includes(num)) {
            this.takenSquares = this.takenSquares.filter(
                (s) => s.squareId !== num,
            );
            return false;
        }

        return this.takenSquares.some(
            (selection) => selection.squareId === num,
        );
    }
}

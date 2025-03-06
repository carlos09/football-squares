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
    @Input() xAxisNumbers: number[] = [];
    @Input() yAxisNumbers: number[] = [];
    @Input() generated: boolean = false;
    @Output() selectionChanged = new EventEmitter<number[]>();
    @Output() generateNumbers = new EventEmitter<void>();
    numbers: number[][] = [];

    constructor() {
        this.initializeGrid();
    }

    initializeGrid() {
        this.numbers = Array.from({ length: 10 }, (_, row) =>
            Array.from({ length: 10 }, (_, col) => row * 10 + col + 1),
        );
    }

    toggleSquare(num: number) {
        if (this.isTaken(num)) return;

        const updatedSelection = this.selectedSquares.includes(num)
            ? this.selectedSquares.filter((id) => id !== num)
            : [...this.selectedSquares, num];

        this.selectionChanged.emit([...updatedSelection]);
    }

    isTaken(num: number): boolean {
        return this.takenSquares.some(
            (selection) => selection.squareId === num,
        );
    }

    requestNumberGeneration() {
        this.generateNumbers.emit();
    }
}

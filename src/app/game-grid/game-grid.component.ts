import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SquareSelection } from '../models/square-selection.model';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { Observable } from 'rxjs';
import { selectGameSettings } from '../store/game/game.seletors';

@Component({
    selector: 'app-game-grid',
    standalone: false,
    templateUrl: './game-grid.component.html',
    styleUrl: './game-grid.component.scss',
})
export class GameGridComponent implements OnInit {
    @Input() selectedSquares: number[] = [];
    @Input() takenSquares: SquareSelection[] = [];
    @Input() xAxisNumbers: number[] = [];
    @Input() yAxisNumbers: number[] = [];
    @Input() generated: boolean = false;
    @Output() selectionChanged = new EventEmitter<number[]>();
    @Output() generateNumbers = new EventEmitter<void>();
    numbers: number[][] = [];
    settings$: Observable<any>;
    homeTeam = '';
    awayTeam = '';

    constructor(private store: Store<AppState>) {}

    ngOnInit(): void {
        this.store.select(selectGameSettings).subscribe((settings) => {
            if (settings.homeTeam) {
                console.log('in here with: ', settings);
                this.homeTeam = settings?.homeTeam.toLowerCase();
                this.awayTeam = settings?.awayTeam.toLowerCase();
            }
        });
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

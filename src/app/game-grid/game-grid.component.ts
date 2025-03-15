import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    OnChanges,
    SimpleChanges,
} from '@angular/core';
import { SquareSelection } from '../models/square-selection.model';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { Observable } from 'rxjs';
import {
    selectGameSettings,
    selectQuarterScores,
} from '../store/game/game.selectors';

@Component({
    selector: 'app-game-grid',
    standalone: false,
    templateUrl: './game-grid.component.html',
    styleUrl: './game-grid.component.scss',
})
export class GameGridComponent implements OnInit, OnChanges {
    @Input() selectedSquares: number[] = [];
    @Input() takenSquares: SquareSelection[] = [];
    @Input() xAxisNumbers: number[] = [];
    @Input() yAxisNumbers: number[] = [];
    @Input() generated: boolean = false;
    @Input() quarterScores: any[] = [];

    // @Input() winningSquares: any[];
    // @Input() scoreChange: any;
    @Output() selectionChanged = new EventEmitter<number[]>();
    @Output() generateNumbers = new EventEmitter<void>();
    @Output() quarterWinners = new EventEmitter<any>();
    processedQuarters = new Set<number>();

    numbers: number[][] = [];
    settings$: Observable<any>;
    homeTeam = '';
    awayTeam = '';

    quarterScores$: Observable<any[]>;
    winningSquares: { [key: number]: number } = {}; // Stores winning squares by quarter
    liveQuarter: number | null = null;
    winners: { [key: number]: string } = {};

    constructor(private store: Store<AppState>) {}

    ngOnInit(): void {
        this.store.select(selectGameSettings).subscribe((settings) => {
            if (settings.homeTeam) {
                this.homeTeam = settings?.homeTeam.toLowerCase();
                this.awayTeam = settings?.awayTeam.toLowerCase();
            }
        });
        this.quarterScores$ = this.store.select(selectQuarterScores);
        this.initializeGrid();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['quarterScores'] && this.quarterScores) {
            this.winningSquares = {};
            this.liveQuarter = null;

            this.quarterScores.forEach((q) => {
                const squareId = this.findSquareIndex(q.homeTeam, q.awayTeam);

                if (q.hasEnded && squareId !== null) {
                    this.winningSquares[q.quarter] = squareId;
                    if (!this.processedQuarters.has(q.quarter)) {
                        this.assignWinner(q.quarter, squareId);
                        this.processedQuarters.add(q.quarter); // Mark quarter as processed
                    }
                } else if (q.isLive) {
                    this.liveQuarter = q.quarter;
                    if (squareId !== null) {
                        this.winningSquares[q.quarter] = squareId;
                    }
                }
            });
        }
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

    findSquareIndex(homeScore: number, awayScore: number): number | null {
        if (!this.xAxisNumbers.length || !this.yAxisNumbers.length) {
            console.warn('xAxisNumbers or yAxisNumbers not set yet.');
            return null;
        }

        const homeLastDigit = homeScore % 10;
        const awayLastDigit = awayScore % 10;

        const xIndex = this.xAxisNumbers.indexOf(homeLastDigit);
        const yIndex = this.yAxisNumbers.indexOf(awayLastDigit);

        if (xIndex === -1 || yIndex === -1) return null;

        // console.log('xAxisNumbers:', this.xAxisNumbers);
        // console.log('yAxisNumbers:', this.yAxisNumbers);
        // console.log(
        //     `homeLastDigit: ${homeLastDigit}, awayLastDigit: ${awayLastDigit}`,
        // );
        // console.log(`xIndex: ${xIndex}, yIndex: ${yIndex}`);

        return yIndex * 10 + xIndex + 1;
    }

    isWinningSquare(squareId: number): boolean {
        // console.log(
        //     'Checking winning square:',
        //     squareId,
        //     'Winning squares:',
        //     this.winningSquares,
        // );
        return (
            squareId !== null &&
            Object.values(this.winningSquares).includes(squareId)
        );
    }

    isPendingSquare(squareId: number): boolean {
        // console.log(
        //     'Checking pending square:',
        //     squareId,
        //     'Live Quarter:',
        //     this.liveQuarter,
        //     'Winning square for live quarter:',
        //     this.winningSquares[this.liveQuarter as any],
        // );
        return (
            this.liveQuarter !== null &&
            this.winningSquares[this.liveQuarter] !== null &&
            this.winningSquares[this.liveQuarter] === squareId
        );
    }

    assignWinner(quarter: number, squareId: number): void {
        if (this.winners[quarter]) return; // Prevent duplicate emissions

        const winner = this.takenSquares.find(
            (selection) => selection.squareId === squareId,
        );

        if (winner) {
            const winnerObj = {
                quarter: quarter,
                winner: winner.userId,
            };
            this.winners[quarter] = winner.userId;
            this.quarterWinners.emit(winnerObj); // Emit only when a new winner is assigned
            // console.log(`Quarter ${quarter} winner: ${winner.userId}`);
        }
    }
}

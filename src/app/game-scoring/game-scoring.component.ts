import { Component } from '@angular/core';

@Component({
    selector: 'app-game-scoring',
    standalone: false,
    templateUrl: './game-scoring.component.html',
    styleUrl: './game-scoring.component.scss',
})
export class GameScoringComponent {
    quarters = [1, 2, 3, 4];
    homeScores: number[] = [0, 0, 0, 0];
    awayScores: number[] = [0, 0, 0, 0];
    savedScores: { home: number; away: number }[] = [];
    editingIndex: number | null = null;

    constructor() {
        this.savedScores = this.quarters.map(() => ({ home: 0, away: 0 }));
    }

    saveScore(index: number) {
        if (
            this.homeScores[index] !== null &&
            this.awayScores[index] !== null
        ) {
            this.savedScores[index] = {
                home: this.homeScores[index],
                away: this.awayScores[index],
            };
            console.log(`Saved Q${index + 1} Score:`, this.savedScores[index]);
            this.editingIndex = null; // Exit edit mode
        }
    }

    editScore(index: number) {
        this.editingIndex = index;
    }

    cancelEdit() {
        this.editingIndex = null;
    }

    canShowQuarter(index: number): boolean {
        // Q1 is always visible, but Q2, Q3, and Q4 should only be visible if the previous quarter has been saved
        return (
            index === 0 ||
            this.savedScores[index - 1]?.home > 0 ||
            this.savedScores[index - 1]?.away > 0
        );
    }
}

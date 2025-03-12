import { Component, OnInit } from '@angular/core';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
import { Score } from '../models/game-scoring.model';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { selectQuarterScoring } from '../store/game/game.seletors';
import * as GameActions from '../store/game/game.actions';

@Component({
    selector: 'app-game-scoring',
    standalone: false,
    templateUrl: './game-scoring.component.html',
    styleUrls: ['./game-scoring.component.scss'],
})
export class GameScoringComponent implements OnInit {
    quarters = [
        {
            quarter: 1,
            isLive: false,
            homeTeam: 0,
            awayTeam: 0,
            winner: '',
            hasEnded: false,
        },
        {
            quarter: 2,
            isLive: false,
            homeTeam: 0,
            awayTeam: 0,
            winner: '',
            hasEnded: false,
        },
        {
            quarter: 3,
            isLive: false,
            homeTeam: 0,
            awayTeam: 0,
            winner: '',
            hasEnded: false,
        },
        {
            quarter: 4,
            isLive: false,
            homeTeam: 0,
            awayTeam: 0,
            winner: '',
            hasEnded: false,
        },
    ];
    savedScores: { home: number; away: number }[] = [];
    editingIndex: number | null = null;
    scoring$: Observable<Score[]>;
    private scoreUpdate$ = new Subject<{
        index: number;
        home: number;
        away: number;
    }>();

    constructor(private store: Store<AppState>) {}

    ngOnInit(): void {
        this.savedScores = this.quarters.map(() => ({ home: 0, away: 0 }));
        this.scoring$ = this.store.select(selectQuarterScoring);

        this.scoring$.subscribe((scoringData) => {
            this.quarters = this.quarters.map((quarter, index) => {
                const scoreData = scoringData.find(
                    (q) => q.quarter === index + 1,
                ) || {
                    quarter: index + 1,
                    isLive: false,
                    hasEnded: false,
                    homeTeam: 0,
                    awayTeam: 0,
                    winner: '',
                };

                return {
                    ...quarter,
                    isLive: scoreData.isLive,
                    homeTeam: scoreData.homeTeam,
                    awayTeam: scoreData.awayTeam,
                    winner: scoreData.winner,
                    hasEnded: scoreData.hasEnded ?? false,
                };
            });
        });

        this.scoreUpdate$
            .pipe(
                debounceTime(1000),
                distinctUntilChanged(
                    (prev, curr) =>
                        prev.index === curr.index &&
                        prev.home === curr.home &&
                        prev.away === curr.away,
                ),
            )
            .subscribe(({ index, home, away }) =>
                this.updateScore(index, home, away),
            );
    }

    saveScore(index: number) {
        if (
            this.quarters[index].homeTeam !== null &&
            this.quarters[index].awayTeam !== null
        ) {
            this.savedScores[index] = {
                home: this.quarters[index].homeTeam,
                away: this.quarters[index].awayTeam,
            };
            this.editingIndex = null;
        }
    }

    onScoreChange(index: number) {
        const home = this.quarters[index].homeTeam;
        const away = this.quarters[index].awayTeam;
        this.scoreUpdate$.next({ index, home, away });
    }

    updateScore(index: number, home: number, away: number) {
        this.store.dispatch(
            GameActions.updateScore({
                scoreIndex: index,
                homeTeam: home,
                awayTeam: away,
            }),
        );
    }

    // Ends the quarter and saves score
    endQuarter(homeTeam: number, awayTeam: number, index: number) {
        this.store.dispatch(
            GameActions.updateScore({
                scoreIndex: index,
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                endQuarter: true,
            }),
        );
    }

    // Allows editing the quarter again
    editScore(index: number) {
        this.editingIndex = index;
        this.quarters[index].isLive = true;
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

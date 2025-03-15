import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Team } from '../models/teams.model';
import { Store } from '@ngrx/store';
import { AppState } from '../store/app.state';
import { selectGameSettings } from '../store/game/game.selectors';
import { filter, Observable } from 'rxjs';

@Component({
    selector: 'app-game-settings',
    standalone: false,
    templateUrl: './game-settings.component.html',
    styleUrl: './game-settings.component.scss',
})
export class GameSettingsComponent implements OnInit {
    nflTeams = TEAMS as Team[];
    homeTeam: string = '';
    awayTeam: string = '';
    gameTime: string = '';
    squarePrice: number = 0;
    settings$: Observable<any>;
    isEditing = false;
    @Output() gameSettings = new EventEmitter();

    payouts: Record<string, number>;
    originalPayouts: Record<string, number>;
    totalPayout = 100; // Expected total
    currentTotal = 0;
    isTotalValid = true;

    // NFL Game Start Times (Eastern Time)
    // gameTimes: string[] = [
    //     '1:00 PM',
    //     '4:05 PM',
    //     '4:25 PM',
    //     '8:15 PM (Thu)',
    //     '8:20 PM (Sun)',
    //     '8:15 PM (Mon)',
    //     '12:30 PM (Thanksgiving)',
    //     '4:30 PM (Thanksgiving)',
    //     '8:20 PM (Thanksgiving)',
    //     '3:00 PM (AFC/NFC Championship)',
    //     '6:30 PM (AFC/NFC Championship)',
    //     '6:30 PM (Super Bowl)',
    // ];

    constructor(private store: Store<AppState>) {}

    ngOnInit(): void {
        this.store.select(selectGameSettings).subscribe((settings) => {
            this.homeTeam = settings.homeTeam || '';
            this.awayTeam = settings.awayTeam || '';
            // this.gameTime = settings.gameTime || '';
            this.squarePrice = settings.pricePerSquare ?? 0;

            if (settings.payouts) {
                this.payouts = { ...settings.payouts };
                this.originalPayouts = { ...this.payouts };
            }
        });
        this.calculateTotal();
    }

    calculateTotal() {
        this.currentTotal = Object.values(this.payouts).reduce(
            (sum, value) => sum + value,
            0,
        );
        this.isTotalValid = this.currentTotal === this.totalPayout;
    }

    toggleEditMode(): void {
        this.isEditing = !this.isEditing;
        if (!this.isEditing) {
            this.payouts = this.originalPayouts;
            this.calculateTotal();
        }
    }

    onSliderChange(quarter: keyof typeof this.payouts, event: Event): void {
        const target = event.target as HTMLInputElement;
        this.payouts[quarter] = Number(target.value);
        this.calculateTotal();
    }

    updatePayouts(quarter: 'q1' | 'q2' | 'q3' | 'q4', event: any) {
        const newValue = event.value;
        const otherTotal =
            this.payouts['q1'] +
            this.payouts['q2'] +
            this.payouts['q3'] +
            this.payouts['q4'] -
            this.payouts[quarter];

        // Ensure total remains 100%
        const remaining = 100 - newValue;
        if (remaining < 0) return;

        this.payouts[quarter] = newValue;
        const factor = remaining / otherTotal;

        // Distribute remaining percentage proportionally
        for (let key of Object.keys(this.payouts) as Array<
            keyof typeof this.payouts
        >) {
            if (key !== quarter) {
                this.payouts[key] = Math.round(this.payouts[key] * factor);
            }
        }
    }

    onSubmit(): void {
        const savedSettings = {
            homeTeam: this.homeTeam,
            awayTeam: this.awayTeam,
            squarePrice: this.squarePrice,
            payouts: { ...this.payouts },
        };
        this.gameSettings.emit(savedSettings);
        this.isEditing = false;
        console.log('savedSettings: ', savedSettings);
    }
}

export const TEAMS = [
    {
        city: 'Arizona',
        name: 'Cardinals',
        abr: 'ARI',
        conf: 'NFC',
        div: 'West',
    },
    {
        city: 'Atlanta',
        name: 'Falcons',
        abr: 'ATL',
        conf: 'NFC',
        div: 'South',
    },
    {
        city: 'Baltimore',
        name: 'Ravens',
        abr: 'BAL',
        conf: 'AFC',
        div: 'North',
    },
    {
        city: 'Buffalo',
        name: 'Bills',
        abr: 'BUF',
        conf: 'AFC',
        div: 'EAST',
    },
    {
        city: 'Carolina',
        name: 'Panthers',
        abr: 'CAR',
        conf: 'NFC',
        div: 'South',
    },
    {
        city: 'Cincinati',
        name: 'Bengals',
        abr: 'CIN',
        conf: 'AFC',
        div: 'North',
    },
    {
        city: 'Chicago',
        name: 'Bears',
        abr: 'CIN',
        conf: 'NFC',
        div: 'North',
    },
    {
        city: 'Cleveland',
        name: 'Browns',
        abr: 'CLE',
        conf: 'AFC',
        div: 'North',
    },
    {
        city: 'Dallas',
        name: 'Cowboys',
        abr: 'DAL',
        conf: 'NFC',
        div: 'East',
    },
    {
        city: 'Denver',
        name: 'Broncos',
        abr: 'DEN',
        conf: 'AFC',
        div: 'West',
    },
    {
        city: 'Detroit',
        name: 'Lions',
        abr: 'DET',
        conf: 'NFC',
        div: 'North',
    },
    {
        city: 'Green Bay',
        name: 'Packers',
        abr: 'GB',
        conf: 'NFC',
        div: 'North',
    },
    {
        city: 'Houston',
        name: 'Texans',
        abr: 'HOU',
        conf: 'AFC',
        div: 'South',
    },
    {
        city: 'Indianapolis',
        name: 'Colts',
        abr: 'IND',
        conf: 'AFC',
        div: 'South',
    },
    {
        city: 'Jacksonville',
        name: 'Jaquars',
        abr: 'JAX',
        conf: 'AFC',
        div: 'South',
    },
    {
        city: 'Kansas City',
        name: 'Chiefs',
        abr: 'KC',
        conf: 'AFC',
        div: 'West',
    },
    {
        city: 'Las Vegas',
        name: 'Raiders',
        abr: 'LV',
        conf: 'AFC',
        div: 'West',
    },
    {
        city: 'Los Angeles',
        name: 'Chargers',
        abr: 'LAC',
        conf: 'AFC',
        div: 'West',
    },
    {
        city: 'Los Angeles',
        name: 'Rams',
        abr: 'LAR',
        conf: 'NFC',
        div: 'West',
    },
    {
        city: 'Miami',
        name: 'Dolphins',
        abr: 'MIA',
        conf: 'AFC',
        div: 'East',
    },
    {
        city: 'Minnesota',
        name: 'Vikings',
        abr: 'MIN',
        conf: 'AFC',
        div: 'North',
    },
    {
        city: 'New England',
        name: 'Patriots',
        abr: 'NE',
        conf: 'AFC',
        div: 'East',
    },
    {
        city: 'New Orleans',
        name: 'Saints',
        abr: 'NO',
        conf: 'NFC',
        div: 'South',
    },
    {
        city: 'New York',
        name: 'Giants',
        abr: 'NYG',
        conf: 'NFC',
        div: 'East',
    },
    {
        city: 'New York',
        name: 'Jets',
        abr: 'NYJ',
        conf: 'AFC',
        div: 'East',
    },
    {
        city: 'Philidelphia',
        name: 'Eagles',
        abr: 'PHI',
        conf: 'NFC',
        div: 'East',
    },
    {
        city: 'Pittsburgh',
        name: 'Steelers',
        abr: 'PIT',
        conf: 'AFC',
        div: 'North',
    },
    {
        city: 'Seattle',
        name: 'Seahawks',
        abr: 'SEA',
        conf: 'NFC',
        div: 'West',
    },
    {
        city: 'San Francisco',
        name: '49ers',
        abr: 'SF',
        conf: 'NFC',
        div: 'West',
    },
    {
        city: 'Tampa Bay',
        name: 'Buccaneers',
        abr: 'TB',
        conf: 'NFC',
        div: 'South',
    },
    {
        city: 'Tennessee',
        name: 'Titants',
        abr: 'TEN',
        conf: 'AFC',
        div: 'South',
    },
    {
        city: 'Washington',
        name: 'Commanders',
        abr: 'WAS',
        conf: 'NFC',
        div: 'East',
    },
];

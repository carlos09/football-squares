import { Score } from './game-scoring.model';
import { Player } from './player.model';
import { SquareSelection } from './square-selection.model';

export interface Game {
    id: string;
    gameId?: string;
    url_id: string | null;
    created_at: Date | string;
    gameCode: string;
    admin_user_id: string;
    roleId: number;
    players: Player[];
    selections: SquareSelection[];
    settings: {
        homeTeam: string;
        awayTeam: string;
        pricePerSquare: number;
    };
    xAxisNumbers: number[];
    yAxisNumbers: number[];
    scoring: Score[];
    hasStarted: boolean;
}

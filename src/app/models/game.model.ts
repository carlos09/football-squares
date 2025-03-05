import { Player } from './player.model';
import { SquareSelection } from './square-selection.model';

export interface Game {
    id: string;
    url_id: string | null;
    created_at: Date | string;
    gameCode: string;
    admin_user_id: string;
    roleId: number;
    players: Player[];
    selections: SquareSelection[];
}

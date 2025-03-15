export interface GameSettings {
    homeTeam: string;
    awayTeam: string;
    gameStartTime?: string | Date;
    pricePerSquare: number;
    payouts: {
        q1: number;
        q2: number;
        q3: number;
        q4: number;
    };
}

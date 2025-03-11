export interface GameScoring {
    scores: Score[];
}

export interface Score {
    isLive: boolean;
    homeTeam: number;
    awayTeam: number;
    winner: string;
    quarter?: number;
    hasEnded?: boolean;
}

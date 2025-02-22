import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { GameCode } from '../models/game-code.model';
import { User } from '../models/userinfo.model';
import { Game } from '../models/game.model';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private baseUrl = 'http://localhost:5001';

    constructor(private http: HttpClient) {}

    createGame(
        userId: string,
    ): Observable<{ gameId: string; gameCode: string; role: string }> {
        return this.http.post<{
            gameId: string;
            gameCode: string;
            role: string;
        }>(`${this.baseUrl}/api/games/create`, { userId });
    }

    createUser(
        username: string,
        password: string,
    ): Observable<{ userId: string; username: string }> {
        return this.http.post<{ userId: string; username: string }>(
            `${this.baseUrl}/api/users/create`,
            { username, password },
        );
    }

    getUserGames(
        userId: string,
    ): Observable<{ gameId: string; gameCode: string; role: string }[]> {
        return this.http.get<
            { gameId: string; gameCode: string; role: string }[]
        >(`${this.baseUrl}/api/users/${userId}/games`);
    }

    getUser(userId: string): Observable<{ userId: string; username: string }> {
        return this.http.get<{ userId: string; username: string }>(
            `${this.baseUrl}/api/users/${userId}`,
        );
    }

    getGame(gameId: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/game/${gameId}`);
    }

    joinGame(gameId: string, username: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/join-game`, {
            gameId,
            username,
        });
    }

    getUserById(userId: string): Observable<{ user: User; games: Game[] }> {
        return this.http
            .get<{ user: User; games: Game[] }>(
                `${this.baseUrl}/api/users/${userId}`,
            )
            .pipe(
                catchError((error) => {
                    console.error('Error fetching user:', error);
                    return throwError(
                        () =>
                            new Error(
                                error.error?.message || 'Error fetching user',
                            ),
                    );
                }),
            );
    }

    saveSquareSelections(
        gameId: string,
        userId: string,
        selectedSquares: number[],
    ): Observable<any> {
        return this.http.post(`${this.baseUrl}/api/save-selection`, {
            gameId,
            userId,
            selectedSquares,
        });
    }

    getUserSelections(userId: string, gameId: string): Observable<any> {
        console.log('Fetching squares for user:', userId, 'and game:', gameId);
        return this.http.get(
            `${this.baseUrl}/api/selections/${userId}/${gameId}`,
        );
    }

    createGameCode(): Observable<GameCode> {
        return this.http.post<GameCode>(`${this.baseUrl}/api/game-code`, {}); // Removed `}`
    }
}

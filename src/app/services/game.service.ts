import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { GameCode } from '../models/game-code.model';
import { User } from '../models/userinfo.model';
import { Game } from '../models/game.model';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private baseUrl = 'http://localhost:5001';

    constructor(private http: HttpClient) {}

    createGame(userId: string): Observable<{
        gameId: string;
        gameCode: string;
        adminUserId: string;
        roleId: number;
    }> {
        return this.http.post<{
            gameId: string;
            gameCode: string;
            adminUserId: string;
            roleId: number;
        }>(`${this.baseUrl}/api/games/create`, { userId });
    }

    createUser(
        username: string,
        password: string,
        gameIdStr?: string,
    ): Observable<User> {
        const gameId = gameIdStr && gameIdStr.trim().length ? gameIdStr : null;

        return this.http.post<User>(`${this.baseUrl}/api/users/create`, {
            username,
            password,
            gameId,
        });
    }

    getUserGame(userId: string | null, gameId: string): Observable<Game> {
        return this.http.get<Game>(
            `${this.baseUrl}/api/users/${userId}/games/${gameId}`,
        );
    }

    getUser(userId: string): Observable<{ userId: string; username: string }> {
        return this.http.get<{ userId: string; username: string }>(
            `${this.baseUrl}/api/users/${userId}`,
        );
    }

    getGame(userId: string, gameId: string): Observable<Game> {
        return this.http.get<Game>(
            `${this.baseUrl}/api/game/${gameId}/user/${userId}`,
        );
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

    getGameId(gameCode: string): Observable<{ id: string }> {
        return this.http.get<{ id: string }>(
            `${this.baseUrl}/api/game/${gameCode}`,
        );
    }

    saveSquareSelections(
        gameId: string | null,
        userId: string | undefined,
        selectedSquares: number[],
    ): Observable<any> {
        return this.http.post(`${this.baseUrl}/api/save-selection`, {
            gameId,
            userId,
            selectedSquares,
        });
    }

    getUserSelections(
        gameId: string | null,
        userId: string | undefined,
    ): Observable<{ selections: { square_id: number }[] }> {
        return this.http.get<{ selections: { square_id: number }[] }>(
            `${this.baseUrl}/api/selections/${userId}/${gameId}`,
        );
    }

    updatePaymentStatus(userId: string, hasPaid: boolean) {
        return this.http.patch(
            `${this.baseUrl}/api/users/${userId}/payment-status`,
            {
                hasPaid,
            },
        );
    }

    saveGameSettings(gameId: string, settings: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/api/game/${gameId}/settings`, {
            settings,
        });
    }

    startGame(gameId: string): Observable<{ hasStarted: boolean }> {
        return this.http.post<{ hasStarted: boolean }>(
            `${this.baseUrl}/api/games/${gameId}/start`,
            {},
        );
    }

    updateScore(
        gameId: string,
        quarter: number,
        homeTeam: number,
        awayTeam: number,
        endQuarter = false,
    ): Observable<{ quarterUpdate: any }> {
        return this.http.put<{ quarterUpdate: any }>(
            `${this.baseUrl}/api/games/${gameId}/quarters/${quarter}`,
            { homeTeam, awayTeam, endQuarter },
        );
    }

    saveAxisNumbers(
        gameId: string,
        xAxis: number[],
        yAxis: number[],
    ): Observable<{ axisNumbers: any }> {
        return this.http.put<{ axisNumbers: any }>(
            `${this.baseUrl}/api/games/${gameId}/axis-numbers`,
            { xAxis, yAxis },
        );
    }

    createGameCode(): Observable<GameCode> {
        return this.http.post<GameCode>(`${this.baseUrl}/api/game-code`, {});
    }

    updateQuarterWinner(
        gameId: string,
        quarter: number,
        winner: string,
    ): Observable<{ quarter: number; winner: string }> {
        return this.http.put<{ quarter: number; winner: string }>(
            `${this.baseUrl}/api/games/${gameId}/quarters/${quarter}/winner`,
            { winner },
        );
    }
}

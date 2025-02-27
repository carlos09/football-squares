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

    createUser(username: string, password: string): Observable<User> {
        return this.http
            .post<User>(`${this.baseUrl}/api/users/create`, {
                username,
                password,
            })
            .pipe(tap((response) => console.log('FROM API: ', response)));
    }

    getUserGame(userId: string | null, gameId: string): Observable<Game> {
        console.log('do getusergame');
        return this.http.get<Game>(
            `${this.baseUrl}/api/users/${userId}/games/${gameId}`,
        );
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

    getSelectedSquares(gameId: string | null): Observable<any> {
        console.log('Fetching squares for user:and game:', gameId);
        return this.http.get(
            `${this.baseUrl}/api/games/${gameId}/selected-squares`,
        );
    }

    createGameCode(): Observable<GameCode> {
        return this.http.post<GameCode>(`${this.baseUrl}/api/game-code`, {});
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameCode } from '../models/game-code.model';
import { User } from '../models/userinfo.model';

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
        console.log('create user()');
        return this.http.post<{ userId: string; username: string }>(
            `${this.baseUrl}/api/users/create`,
            {
                username,
                password,
            },
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

    getUserById(userId: string) {
        console.log('get user by id');
        return this.http.get<{ username: string }>(
            `${this.baseUrl}/api/user/${userId}`,
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

    getUserSelections(userId: string): Observable<any> {
        console.log('user userID to get squres: ', userId);
        return this.http.get(`${this.baseUrl}/api/selections/${userId}`);
    }

    createGameCode(): Observable<GameCode> {
        return this.http.post<GameCode>(`${this.baseUrl}/api/game-code`, {}); // Removed `}`
    }
}

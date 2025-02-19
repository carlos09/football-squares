import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    private baseUrl = 'http://localhost:5001';

    constructor(private http: HttpClient) {}

    createGame() {
        console.log('create game service');
        const url_id = crypto.randomUUID();
        return this.http.post<{ gameId: string; url_id: string }>(
            `${this.baseUrl}/api/games`,
            { url_id },
        );
    }

    createUser(
        gameId: string,
        username: string,
        password: string,
    ): Observable<any> {
        return this.http.post(`${this.baseUrl}/api/users`, {
            gameId,
            username,
            password,
        });
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
        return this.http.get<{ username: string }>(
            `${this.baseUrl}/api/users/${userId}`,
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
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = 'http://localhost:5001';

  constructor(private http: HttpClient) {}

  createGame(): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-game`, {});
  }

  getGame(gameId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/game/${gameId}`);
  }

  joinGame(gameId: string, username: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/join-game`, { gameId, username });
  }
}

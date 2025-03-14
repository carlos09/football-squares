import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = 'http://localhost:5001';
    private tokenKey = 'access_token';
    private refreshTokenKey = 'refresh_token';

    private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
    isLoggedIn$ = this.isLoggedInSubject.asObservable();

    constructor(private http: HttpClient) {}

    // login(credentials: { email: string; password: string }): Observable<any> {
    //     return this.http
    //         .post<{ accessToken: string; refreshToken: string }>(
    //             `${this.apiUrl}/login`,
    //             credentials,
    //         )
    //         .pipe(
    //             tap((response) => {
    //                 this.storeTokens(
    //                     response.accessToken,
    //                     response.refreshToken,
    //                 );
    //                 this.isLoggedInSubject.next(true);
    //             }),
    //         );
    // }

    register(
        username: string,
        password: string,
        gameId?: string,
    ): Observable<any> {
        return this.http
            .post<{ token: string }>(`${this.apiUrl}/api/users/create`, {
                username,
                password,
                gameId: gameId || null,
            })
            .pipe(
                tap((response) => {
                    this.storeTokens(response.token);
                    this.isLoggedInSubject.next(true);
                }),
            );
    }

    login(username: string, password: string): Observable<any> {
        return this.http
            .post<{ token: string }>(`${this.apiUrl}/api/users/login`, {
                username,
                password,
            })
            .pipe(
                tap((response) => {
                    this.storeTokens(response.token); // Store JWT
                    this.isLoggedInSubject.next(true);
                }),
            );
    }

    // getUserData(): Observable<any> {
    //     return this.http.get<any>(`${this.apiUrl}/user`);
    // }

    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        this.isLoggedInSubject.next(false);
    }

    refreshToken(): Observable<any> {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        return this.http
            .post<{ accessToken: string }>(`${this.apiUrl}/refresh-token`, {
                refreshToken,
            })
            .pipe(
                tap((response) => {
                    this.storeTokens(response.accessToken);
                }),
            );
    }

    private storeTokens(accessToken: string, refreshToken?: string): void {
        localStorage.setItem(this.tokenKey, accessToken);
        if (refreshToken) {
            localStorage.setItem(this.refreshTokenKey, refreshToken);
        }
    }

    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    private hasToken(): boolean {
        return !!this.getToken();
    }
}

import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, catchError, switchMap, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler,
    ): Observable<HttpEvent<any>> {
        const token = this.authService.getToken();
        let clonedRequest = req;

        if (token) {
            clonedRequest = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }

        return next.handle(clonedRequest).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    return this.authService.refreshToken().pipe(
                        switchMap((response) => {
                            clonedRequest = req.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${response.accessToken}`,
                                },
                            });
                            return next.handle(clonedRequest);
                        }),
                        catchError((err) => {
                            this.authService.logout();
                            return throwError(() => err);
                        }),
                    );
                }
                return throwError(() => error);
            }),
        );
    }
}

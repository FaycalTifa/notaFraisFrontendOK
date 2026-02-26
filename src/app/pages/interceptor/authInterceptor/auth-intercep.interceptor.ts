import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable()
export class AuthIntercepInterceptor implements HttpInterceptor {

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isLoginUrl = req.url.includes('/api/auth/login');

        console.log(`🔍 Interceptor - URL appelée: ${req.url}`);
        console.log(`🔍 Interceptor - Est-ce une URL de login? ${isLoginUrl}`);

        // ✅ IMPORTANT: Ne pas ajouter de token pour la requête de login
        if (isLoginUrl) {
            console.log('🔓 Interceptor - Requête de login, pas de token ajouté');
            return next.handle(req).pipe(
                catchError((error: HttpErrorResponse) => {
                    console.error('❌ Interceptor - Erreur login:', error);
                    return throwError(() => error);
                })
            );
        }

        // Pour les autres requêtes, ajouter le token
        const token = this.authService.getToken();
        console.log(`🔍 Interceptor - Token présent: ${token ? 'Oui' : 'Non'}`);

        if (token) {
            console.log('🔐 Interceptor - Ajout du token à la requête');
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        } else {
            console.log('⚠️ Interceptor - Pas de token trouvé!');
        }

        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                console.error('❌ Interceptor - Erreur HTTP:', error);

                if (error.status === 401) {
                    console.log('🔄 Interceptor - Token expiré, redirection vers login');
                    this.authService.logout();
                    this.router.navigate(['/login']);
                }

                return throwError(() => error);
            })
        );
    }

}

import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import {LoginRequest, LoginResponse } from '../../models/entities/entities';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/auth';
    private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUserSubject.next(JSON.parse(savedUser));
        }
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(response => {
                    localStorage.setItem('currentUser', JSON.stringify(response));
                    localStorage.setItem('token', response.token);
                    this.currentUserSubject.next(response);
                })
            );
    }

    // auth.service.ts
    logout(): void {
        console.log('deconnexion auth');

        // 1. Nettoyer le localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');

        // 2. Mettre à jour le subject
        this.currentUserSubject.next(null);

        // 3. Rediriger vers login
        this.router.navigate(['/login']).then(() => {
            // 4. Forcer le rechargement pour réinitialiser l'état
            window.location.reload();
        });
    }

    getCurrentUser(): LoginResponse | null {
        return this.currentUserSubject.value;
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }

    hasAnyRole(roles: string[]): boolean {
        const user = this.getCurrentUser();
        return user ? roles.includes(user.role) : false;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}

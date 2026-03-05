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

    // Définition des rôles
    public readonly ROLES = {
        ADMIN: 'ADMIN',
        DIRECTEUR: 'DIRECTEUR',
        CHEF_SERVICE: 'CHEF_SERVICE',
        CHEF_SECTION: 'CHEF_SECTION',
        COLLABORATEUR: 'COLLABORATEUR'
    };

    constructor(
        private http: HttpClient,
        private router: Router
    ) {
        this.loadStoredUser();
    }

    private loadStoredUser1(): void {
        const storedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            this.currentUserSubject.next(JSON.parse(storedUser));
        }
    }

    private loadStoredUser(): void {
        const storedUser = localStorage.getItem('currentUser');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                const user = JSON.parse(storedUser);
                console.log('👤 Utilisateur chargé du localStorage:', user);
                this.currentUserSubject.next(user);
            } catch (e) {
                console.error('Erreur parsing utilisateur', e);
                this.logout();
            }
        }
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                localStorage.setItem('currentUser', JSON.stringify(response));
                localStorage.setItem('token', response.token);
                this.currentUserSubject.next(response);
            })
        );
    }

    login1(credentials: LoginRequest): Observable<LoginResponse> {
        console.log('🔑 Tentative de login:', credentials.email);

        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                console.log('✅ Réponse login complète:', response);
                console.log('📍 directionId reçu:', response.directionId);

                // Stocker les données
                localStorage.setItem('token', response.token);
                localStorage.setItem('currentUser', JSON.stringify(response));
                this.currentUserSubject.next(response);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getCurrentUser(): LoginResponse | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return !!this.getToken() && !!this.getCurrentUser();
    }

    // ✅ Vérifier si l'utilisateur a un rôle spécifique
    hasRole(role: string): boolean {
        const user = this.getCurrentUser();
        return user?.role === role;
    }

    // ✅ Vérifier si l'utilisateur a au moins un des rôles spécifiés
    hasAnyRole(roles: string[]): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        return roles.includes(user.role);
    }

    // ✅ Vérifier si l'utilisateur a tous les rôles spécifiés
    hasAllRoles(roles: string[]): boolean {
        const user = this.getCurrentUser();
        if (!user) return false;
        return roles.every(role => user.role === role);
    }

    // ✅ Vérifier si l'utilisateur est ADMIN
    isAdmin(): boolean {
        return this.hasRole(this.ROLES.ADMIN);
    }

    // ✅ Vérifier si l'utilisateur est DIRECTEUR
    isDirecteur(): boolean {
        return this.hasRole(this.ROLES.DIRECTEUR);
    }

    // ✅ Vérifier si l'utilisateur est CHEF_SERVICE
    isChefService(): boolean {
        return this.hasRole(this.ROLES.CHEF_SERVICE);
    }

    // ✅ Vérifier si l'utilisateur est CHEF_SECTION
    isChefSection(): boolean {
        return this.hasRole(this.ROLES.CHEF_SECTION);
    }

    // ✅ Vérifier si l'utilisateur est COLLABORATEUR
    isCollaborateur(): boolean {
        return this.hasRole(this.ROLES.COLLABORATEUR);
    }
    

    // ✅ Vérifier si l'utilisateur peut évaluer (Admin, Directeur, Chef Service, Chef Section)
    canEvaluate(): boolean {
        return this.hasAnyRole([
            this.ROLES.ADMIN,
            this.ROLES.DIRECTEUR,
            this.ROLES.CHEF_SERVICE,
            this.ROLES.CHEF_SECTION
        ]);
    }

    // ✅ Vérifier si l'utilisateur peut gérer les collaborateurs (Admin seulement)
    canManageCollaborateurs(): boolean {
        return this.isAdmin();
    }

    // ✅ Vérifier si l'utilisateur peut voir les statistiques
    canViewStatistics(): boolean {
        return this.hasAnyRole([
            this.ROLES.ADMIN,
            this.ROLES.DIRECTEUR,
            this.ROLES.CHEF_SERVICE
        ]);
    }

    // ✅ Obtenir le libellé du rôle
    getRoleLabel(): string {
        const user = this.getCurrentUser();
        if (!user) return '';

        const labels: { [key: string]: string } = {
            'ADMIN': 'Administrateur',
            'DIRECTEUR': 'Directeur',
            'CHEF_SERVICE': 'Chef de Service',
            'CHEF_SECTION': 'Chef de Section',
            'COLLABORATEUR': 'Collaborateur'
        };
        return labels[user.role] || user.role;
    }
}

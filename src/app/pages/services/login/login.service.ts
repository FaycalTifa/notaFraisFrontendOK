import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {RegisterDTO, Utilisateur} from '../../models/entities/entities';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

    private baseUrl = 'http://localhost:8080/api/utilisateurs';
    // tslint:disable-next-line:variable-name
    private _user = new BehaviorSubject<any>(null);
    user$ = this._user.asObservable();

    constructor(private http: HttpClient) {}

    setUser(user: any) {
        this._user.next(user);
        localStorage.setItem('user', JSON.stringify(user));
    }

    getToken(): string | null {
        // Récupère le token JWT du localStorage
        return localStorage.getItem('authToken'); // Adaptez cette clé selon votre application
    }

    logout(): void {
        // Supprime le token lors de la déconnexion
        localStorage.removeItem('authToken');
    }

    loadUserFromStorage() {
        const user = localStorage.getItem('user');
        if (user) {
            this._user.next(JSON.parse(user));
        }
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post(`${this.baseUrl}/login`, { username, password });
    }

    createUser(utilisateur: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/create`, utilisateur);
    }

    registerUtilisateur(dto: RegisterDTO): Observable<Utilisateur> {
        return this.http.post<Utilisateur>(`${this.baseUrl}/register`, dto);
    }


}

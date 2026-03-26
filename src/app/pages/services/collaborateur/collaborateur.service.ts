import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Collaborateur, CollaborateurRequest } from '../../models/entities/entities';
import { catchError, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CollaborateurService {

   // private apiUrl = 'http://localhost:8080/api/collaborateurs';
    private apiUrl = `${environment.apiUrl}/collaborateurs`;

    constructor(private http: HttpClient) { }

    getAllCollaborateurs(): Observable<Collaborateur[]> {
        return this.http.get<Collaborateur[]>(this.apiUrl);
    }
    // Dans collaborateur.service.ts
    getVisibles(): Observable<Collaborateur[]> {
        return this.http.get<Collaborateur[]>(`${this.apiUrl}/visibles`);
    }

    getCollaborateursEvaluables1(): Observable<Collaborateur[]> {
        console.log('✅ SERVICE: getCollaborateursEvaluables');
        console.log('✅ {this.apiUrl}/evaluables ::::' , this.http.get<Collaborateur[]>(`${this.apiUrl}/evaluables`));
        return this.http.get<Collaborateur[]>(`${this.apiUrl}/evaluables`);
    }

    getCollaborateursEvaluables(): Observable<Collaborateur[]> {
        const url = `${this.apiUrl}/evaluables`;
        console.log('📡 SERVICE: Appel à', url);

        return this.http.get<Collaborateur[]>(url).pipe(
            tap({
                next: (data) => {
                    console.log('📡 SERVICE: Données reçues avec succès!');
                    console.log('📡 SERVICE: Nombre de collaborateurs:', data?.length);
                    if (data && data.length > 0) {
                        console.log('📡 SERVICE: Premier collaborateur:', data[0]);
                    }
                },
                error: (error) => {
                    console.error('📡 SERVICE: Erreur lors de l\'appel:', error);
                }
            })
        );
    }

    getCollaborateurById(id: number): Observable<Collaborateur> {
        return this.http.get<Collaborateur>(`${this.apiUrl}/${id}`);
    }

    createCollaborateur(collaborateur: CollaborateurRequest): Observable<Collaborateur> {
        return this.http.post<Collaborateur>(this.apiUrl, collaborateur);
    }

    updateCollaborateur(id: number, collaborateur: CollaborateurRequest): Observable<Collaborateur> {
        return this.http.put<Collaborateur>(`${this.apiUrl}/${id}`, collaborateur);
    }

    deleteCollaborateur(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    rechercherCollaborateurs(search: string): Observable<Collaborateur[]> {
        return this.http.get<Collaborateur[]>(`${this.apiUrl}/recherche?search=${search}`);
    }

    changePassword(userId: number, passwordData: { currentPassword: string, newPassword: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/${userId}/change-password`, passwordData);
    }

    // Dans collaborateur.service.ts

    getCollaborateurSignature(id: number): Observable<string> {
        return this.http.get(`${this.apiUrl}/${id}/signature`, {
            responseType: 'text'
        });
    }
}

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
    private apiUrl = 'http://localhost:8080/api/collaborateurs';

    constructor(private http: HttpClient) { }

    getAllCollaborateurs(): Observable<Collaborateur[]> {
        return this.http.get<Collaborateur[]>(this.apiUrl);
    }

    getCollaborateursEvaluables(): Observable<Collaborateur[]> {
        return this.http.get<Collaborateur[]>(`${this.apiUrl}/evaluables`);
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
}

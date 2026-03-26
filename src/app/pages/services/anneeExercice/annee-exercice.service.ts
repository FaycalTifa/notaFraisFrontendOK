import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnneeExercice } from '../../models/entities/entities';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnneeExerciceService {

   // private baseUrl = 'http://localhost:8080/api/annee-exercice';
    private apiUrl = `${environment.apiUrl}/annee-exercice`;

    constructor(private http: HttpClient) {}

    getAllAnnees(): Observable<AnneeExercice[]> {
        return this.http.get<AnneeExercice[]>(this.apiUrl);
    }

    getById(id: number): Observable<AnneeExercice> {
        return this.http.get<AnneeExercice>(`${this.apiUrl}/${id}`);
    }

    createAnnee(data: AnneeExercice): Observable<AnneeExercice> {
        return this.http.post<AnneeExercice>(this.apiUrl, data);
    }

    updateAnnee(id: number, data: AnneeExercice): Observable<AnneeExercice> {
        return this.http.put<AnneeExercice>(`${this.apiUrl}/${id}`, data);
    }

    deleteAnnee(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }


    }

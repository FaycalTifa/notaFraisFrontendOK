import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnneeExercice } from '../../models/entities/entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnneeExerciceService {

    private baseUrl = 'http://localhost:8080/api/annee-exercice';

    constructor(private http: HttpClient) {}

    getAll(): Observable<AnneeExercice[]> {
        return this.http.get<AnneeExercice[]>(this.baseUrl);
    }

    getById(id: number): Observable<AnneeExercice> {
        return this.http.get<AnneeExercice>(`${this.baseUrl}/${id}`);
    }

    create(data: AnneeExercice): Observable<AnneeExercice> {
        return this.http.post<AnneeExercice>(this.baseUrl, data);
    }

    update(id: number, data: AnneeExercice): Observable<AnneeExercice> {
        return this.http.put<AnneeExercice>(`${this.baseUrl}/${id}`, data);
    }

    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
    }

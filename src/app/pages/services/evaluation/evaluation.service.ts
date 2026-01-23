import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Evaluation } from '../../models/entities/entities';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

    private apiUrl = 'http://localhost:8080/api/evaluation';

    constructor(protected http: HttpClient) {
    }

    createDirection(evaluation: Evaluation): Observable<Evaluation> {
        return this.http.post<Evaluation>(this.apiUrl, evaluation);
    }

    updateDirection(id: number, evaluation: Evaluation): Observable<Evaluation> {
        return this.http.put<Evaluation>(`${this.apiUrl}/update/${id}`, evaluation);
    }

    deleteDirection(id: number, evaluation: Evaluation): Observable<Evaluation> {
        return this.http.put<Evaluation>(`${this.apiUrl}/deleteEvaluation/${id}`, evaluation);
    }

    getAllDirection(): Observable<Evaluation[]> {
        return this.http.get<Evaluation[]>(this.apiUrl);
    }
    }

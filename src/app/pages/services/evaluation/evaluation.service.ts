import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {Evaluation, EvaluationRequest, ObjectifEvaluation, ObjectifFutur, SouhaitFormation } from '../../models/entities/evaluation';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

    private apiUrl = `${environment.apiUrl}/evaluations`;

    constructor(private http: HttpClient) { }

    getAllEvaluations(): Observable<Evaluation[]> {
        return this.http.get<Evaluation[]>(this.apiUrl);
    }

    getEvaluationsAFaire(): Observable<Evaluation[]> {
        return this.http.get<Evaluation[]>(`${this.apiUrl}/a-faire`);
    }

    getEvaluationsByCollaborateur(collaborateurId: number): Observable<Evaluation[]> {
        return this.http.get<Evaluation[]>(`${this.apiUrl}/collaborateur/${collaborateurId}`);
    }

    getEvaluationById(id: number): Observable<Evaluation> {
        return this.http.get<Evaluation>(`${this.apiUrl}/${id}`);
    }

    createEvaluation(request: EvaluationRequest): Observable<Evaluation> {
        return this.http.post<Evaluation>(this.apiUrl, request);
    }

    updateEvaluation(id: number, request: EvaluationRequest): Observable<Evaluation> {
        return this.http.put<Evaluation>(`${this.apiUrl}/${id}`, request);
    }

    addObjectif(evaluationId: number, objectif: ObjectifEvaluation): Observable<ObjectifEvaluation> {
        return this.http.post<ObjectifEvaluation>(`${this.apiUrl}/${evaluationId}/objectifs`, objectif);
    }

    addObjectifFutur(evaluationId: number, objectif: ObjectifFutur): Observable<ObjectifFutur> {
        return this.http.post<ObjectifFutur>(`${this.apiUrl}/${evaluationId}/objectifs-futurs`, objectif);
    }

    addFormation(evaluationId: number, formation: SouhaitFormation): Observable<SouhaitFormation> {
        return this.http.post<SouhaitFormation>(`${this.apiUrl}/${evaluationId}/formations`, formation);
    }

    changeStatut(evaluationId: number, statut: string): Observable<Evaluation> {
        return this.http.patch<Evaluation>(`${this.apiUrl}/${evaluationId}/statut?statut=${statut}`, {});
    }

    soumettrePourValidation(evaluationId: number): Observable<Evaluation> {
        return this.changeStatut(evaluationId, 'EN_COURS');
    }

    validerEvaluation(evaluationId: number): Observable<Evaluation> {
        return this.changeStatut(evaluationId, 'VALIDEE');
    }

    refuserEvaluation(evaluationId: number): Observable<Evaluation> {
        return this.changeStatut(evaluationId, 'REFUSEE');
    }

    signerEvaluation(evaluationId: number, signature: string, isResponsable: boolean): Observable<Evaluation> {
        return this.http.post<Evaluation>(
            `${this.apiUrl}/${evaluationId}/signature?signature=${signature}&isResponsable=${isResponsable}`,
            {}
        );
    }

    deleteEvaluation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

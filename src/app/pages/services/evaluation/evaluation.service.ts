import { HttpClient, HttpParams } from '@angular/common/http';
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

    // ========== MÉTHODES DE BASE ==========

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

    // ========== MÉTHODES DE WORKFLOW ==========

    // Étape 1: Soumettre à l'approbation du collaborateur
    soumettrePourApprobation(evaluationId: number): Observable<Evaluation> {
        return this.http.patch<Evaluation>(
            `${this.apiUrl}/${evaluationId}/statut?statut=A_APPROUVER`,
            {}
        );
    }

    // Étape 2: Le collaborateur approuve
    approuverEvaluation(evaluationId: number, commentaire?: string): Observable<Evaluation> {
        return this.http.post<Evaluation>(
            `${this.apiUrl}/${evaluationId}/approuver`,
            { commentaire }
        );
    }

    // Étape 2 bis: Le collaborateur refuse
    refuserEvaluation(evaluationId: number, motif: string): Observable<Evaluation> {
        return this.http.post<Evaluation>(
            `${this.apiUrl}/${evaluationId}/refuser`,
            { motif }
        );
    }

    // Étape 3: Le chef de service valide (pour les évaluations de chef de section)
    validerParChefService(evaluationId: number): Observable<Evaluation> {
        return this.http.patch<Evaluation>(
            `${this.apiUrl}/${evaluationId}/statut?statut=A_VALIDER_DIRECTEUR`,
            {}
        );
    }

    // Étape 4: Le directeur valide définitivement
    validerParDirecteur(evaluationId: number): Observable<Evaluation> {
        return this.http.patch<Evaluation>(
            `${this.apiUrl}/${evaluationId}/statut?statut=VALIDEE`,
            {}
        );
    }

    // Retour pour modification
    retournerPourModification(evaluationId: number): Observable<Evaluation> {
        return this.http.patch<Evaluation>(
            `${this.apiUrl}/${evaluationId}/statut?statut=BROUILLON`,
            {}
        );
    }

    // Méthodes génériques (gardées pour compatibilité)
    changeStatut(evaluationId: number, statut: string): Observable<Evaluation> {
        return this.http.patch<Evaluation>(`${this.apiUrl}/${evaluationId}/statut?statut=${statut}`, {});
    }

    soumettrePourValidation(evaluationId: number): Observable<Evaluation> {
        return this.changeStatut(evaluationId, 'EN_COURS');
    }

    validerEvaluation(evaluationId: number): Observable<Evaluation> {
        return this.changeStatut(evaluationId, 'VALIDEE');
    }

    // Dans evaluation.service.ts
    signerEvaluation(id: number, signature: string, isResponsable: boolean): Observable<Evaluation> {
        const params = new HttpParams()
            .set('signature', signature)
            .set('isResponsable', isResponsable.toString());

        return this.http.post<Evaluation>(`${this.apiUrl}/${id}/signature`, null, { params });
    }

    deleteEvaluation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }


}

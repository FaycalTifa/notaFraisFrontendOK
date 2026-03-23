import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {Evaluation, EvaluationRequest, ObjectifEvaluation, ObjectifFutur, SouhaitFormation } from '../../models/entities/evaluation';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

    private apiUrl = `${environment.apiUrl}/evaluations`;

    constructor(private http: HttpClient) { }

    // ========== MÉTHODES DE BASE ==========

    getAllEvaluations(): Observable<Evaluation[]> {
        console.log('📡 Appel API vers:', this.apiUrl);
        return this.http.get<Evaluation[]>(this.apiUrl).pipe(
            tap(data => {
                console.log('📦 Données reçues du backend:', data);
                console.log('📦 Nombre d\'évaluations:', data.length);
                data.forEach(e => console.log(`   - ID: ${e.id}, Statut: ${e.statut}, Collaborateur: ${e.collaborateurNom}`));
            })
        );
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
    refuserEvaluation(id: number, motif: string): Observable<Evaluation> {
        return this.http.post<Evaluation>(`${this.apiUrl}/${id}/refuser`, { motif });
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
    // Retour pour modification - VERSION AVEC MOTIF (décommentez-la)
    retournerPourModification(id: number, motif: string): Observable<Evaluation> {
        console.log('📤 Envoi requête retour:', { id, motif });
        return this.http.post<Evaluation>(
            `${this.apiUrl}/${id}/retourner`,
            { motif }
        );
    }

    reactiverEvaluation(id: number): Observable<Evaluation> {
        console.log('📤 Envoi requête réactivation:', id);
        return this.http.post<Evaluation>(
            `${this.apiUrl}/${id}/reactiver`,
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
    // Dans evaluation.service.ts

    signerEvaluation(id: number, isResponsable: boolean): Observable<Evaluation> {
        return this.http.post<Evaluation>(
            `${this.apiUrl}/${id}/signature`,
            { responsable: isResponsable }  // Envoi d'un objet JSON
        );
    }

    deleteEvaluation(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // AJOUTER ces nouvelles méthodes pour l'export
    exportToExcel(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/excel`, {
            responseType: 'blob'
        });
    }

    exportToPdf(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/pdf`, {
            responseType: 'blob'
        });
    }

    exportEvaluationToPdf(id: number): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/export/pdf`, {
            responseType: 'blob'
        });
    }

    exportToCsv(): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/export/csv`, {
            responseType: 'blob'
        });
    }

    /**
     * Annuler une évaluation
     * @param id ID de l'évaluation
     * @param motif Motif de l'annulation
     */
    annulerEvaluation(id: number, motif: string): Observable<Evaluation> {
        console.log('📤 Envoi requête annulation:', { id, motif });
        return this.http.post<Evaluation>(
            `${this.apiUrl}/${id}/annuler`,
            { motif }
        );
    }

    // Dans evaluation.service.ts - Ajouter ces méthodes

// Récupérer les évaluations de l'utilisateur connecté par année
    getMyEvaluationsByYear(annee?: number): Observable<Evaluation[]> {
        let params = new HttpParams();
        if (annee) {
            params = params.set('annee', annee.toString());
        }
        return this.http.get<Evaluation[]>(`${this.apiUrl}/mes-evaluations`, { params });
    }

// Récupérer les années disponibles pour l'utilisateur connecté
    getMyAvailableYears(): Observable<number[]> {
        return this.http.get<number[]>(`${this.apiUrl}/mes-annees`);
    }

// Exporter mes évaluations en Excel par année
    exportMyEvaluationsToExcel(annee?: number): Observable<Blob> {
        let params = new HttpParams();
        if (annee) {
            params = params.set('annee', annee.toString());
        }
        return this.http.get(`${this.apiUrl}/mes-evaluations/export/excel`, {
            params: params,
            responseType: 'blob'
        });
    }

// Exporter mes évaluations en PDF par année
    exportMyEvaluationsToPdf(annee?: number): Observable<Blob> {
        let params = new HttpParams();
        if (annee) {
            params = params.set('annee', annee.toString());
        }
        return this.http.get(`${this.apiUrl}/mes-evaluations/export/pdf`, {
            params: params,
            responseType: 'blob'
        });
    }

    // Dans evaluation.service.ts
    getSignaturesByEvaluationId(evaluationId: number): Observable<{evaluateurSignature: string, collaborateurSignature: string}> {
        return this.http.get<{evaluateurSignature: string, collaborateurSignature: string}>(
            `${this.apiUrl}/${evaluationId}/signatures`
        );
    }

}

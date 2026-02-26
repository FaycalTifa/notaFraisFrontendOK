import { Component, OnInit } from '@angular/core';
import {Evaluation, StatutColors, StatutLabels } from '../../models/entities/evaluation';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-liste-evaluations',
  templateUrl: './liste-evaluations.component.html',
  styleUrls: ['./liste-evaluations.component.scss']
})
export class ListeEvaluationsComponent implements OnInit {

    evaluations: Evaluation[] = [];
    evaluationsAFaire: Evaluation[] = [];
    loading = false;
    statutLabels = StatutLabels;
    statutColors = StatutColors;

    constructor(
        private evaluationService: EvaluationService,
        public authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadEvaluations();
        if (this.authService.hasAnyRole(['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION'])) {
            this.loadEvaluationsAFaire();
        }
    }

    loadEvaluations(): void {
        this.loading = true;
        this.evaluationService.getAllEvaluations().subscribe({
            next: (data) => {
                this.evaluations = data;
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les évaluations'
                });
            }
        });
    }

    loadEvaluationsAFaire(): void {
        this.evaluationService.getEvaluationsAFaire().subscribe({
            next: (data) => {
                this.evaluationsAFaire = data;
            },
            error: (error) => {
                console.error('Erreur chargement évaluations à faire', error);
            }
        });
    }

    createEvaluation(): void {
        this.router.navigate(['/evaluations/nouveau']);
    }

    /*viewEvaluation(id: number): void {
        console.log('Navigation views évaluation:', id);
        this.router.navigate([`/form-evaluation/${id}`]);
    }

    editEvaluation(id: number): void {
        console.log('Navigation edit évaluation:', id);
        this.router.navigate([`/form-evaluation/${id}`]);
    }

    startEvaluation(collaborateurId: number): void {
        this.router.navigate(['/form-evaluation'], {
            queryParams: { collaborateurId: collaborateurId }
        });
    }*/
// liste-evaluations.component.ts
    viewEvaluation(id: number): void {
        console.log('Navigation vers évaluation:', id);
        this.router.navigate(['/evaluations', id]);
    }

    editEvaluation(id: number): void {
        console.log('Édition évaluation:', id);
        this.router.navigate(['/evaluations/editer', id]);
    }

    startEvaluation(collaborateurId: number): void {
        console.log('Nouvelle évaluation pour collaborateur:', collaborateurId);
        this.router.navigate(['/evaluations/nouveau'], {
            queryParams: { collaborateurId: collaborateurId }
        });
    }
    getStatutSeverity(statut: string): 'success'  {
        return this.statutColors[statut] as any || 'secondary';
    }

    getNoteColor(note: number | null | undefined): string {
        if (note === null || note === undefined) return '#6c757d';
        if (note >= 8) return '#22c55e';  // Vert
        if (note >= 6) return '#3b82f6';  // Bleu
        if (note >= 4) return '#eab308';  // Jaune
        return '#ef4444';  // Rouge
    }

    // Dans liste-evaluations.component.ts
    formatNote(note: number | null | undefined): string {
        if (note === null || note === undefined) {
            return '-';
        }
        // Vérifier que la note est dans une plage valide (0-10)
        if (note < 0 || note > 10) {
            console.warn('Note anormale détectée:', note);
            return note.toFixed(1) + '/10 (anormal)';
        }
        return note.toFixed(1) + '/10';
    }


}

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
    filteredEvaluations: Evaluation[] = [];
    loading = false;
    statutLabels = StatutLabels;
    showCancelled: boolean = false;
    showMotifDialog: boolean = false;
    selectedAncienStatut: string = '';
    selectedMotif: string = '';
    eval: string = '';
    selectedRefusePar: string = '';
    selectedAnnulePar: string = '';
    selectedDateAnnulation: Date | null = null;

    constructor(
        private evaluationService: EvaluationService,
        public authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
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
                console.log('📊 TOUTES les évaluations reçues:', data);

                // Afficher chaque évaluation avec son statut
                data.forEach(e => {
                    console.log(`   - ID: ${e.id}, Statut: "${e.statut}", Année: ${e.annee}, Collaborateur: ${e.collaborateurNom}`);
                });

                // Compter par statut
                const stats: {[key: string]: number} = {};
                data.forEach(e => {
                    stats[e.statut] = (stats[e.statut] || 0) + 1;
                });
                console.log('📊 Répartition par statut:', stats);

                // Vérifier spécifiquement les annulées
                const annulees = data.filter(e => e.statut === 'ANNULEE');
                console.log('📊 Évaluations avec statut "ANNULEE":', annulees.length);

                // Vérifier les statuts qui pourraient ressembler à "ANNULEE" mais avec des différences
                const autresStatuts = data.filter(e =>
                    e.statut !== 'BROUILLON' &&
                    e.statut !== 'A_APPROUVER' &&
                    e.statut !== 'APPROUVEE' &&
                    e.statut !== 'A_VALIDER_SERVICE' &&
                    e.statut !== 'A_VALIDER_DIRECTEUR' &&
                    e.statut !== 'EN_COURS' &&
                    e.statut !== 'VALIDEE'


                );

                if (autresStatuts.length > 0) {
                    console.log('⚠️ Statuts non standard détectés:', autresStatuts.map(e => e.statut));
                }

                this.evaluations = data;
                this.applyFilter();
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

    // Dans liste-evaluations.component.ts
    // Dans liste-evaluations.component.ts

// ✅ Ajouter cette méthode pour afficher les détails du refus
    viewMotifDetails(evaluation: any): void {
        // CAS 1: Annulation
        if (evaluation.statut === 'ANNULEE') {
            this.selectedMotif = evaluation.motifAnnulation || 'Motif non spécifié';
            this.selectedAnnulePar = evaluation.annulePar || 'Utilisateur inconnu';
            this.selectedRefusePar = '';
            this.selectedDateAnnulation = evaluation.dateAnnulation || null;
        }
        // CAS 2: Refus (même si le statut est BROUILLON)
        else if (evaluation.motifRefus) {
            this.selectedMotif = evaluation.motifRefus || evaluation.commentaireCollaborateur || 'Motif non spécifié';
            this.selectedAnnulePar = '';
            this.selectedRefusePar = evaluation.refuseParNom || 'Collaborateur';
            this.selectedDateAnnulation = evaluation.dateRefus || null;
        }
        // CAS 3: Autre
        else {
            this.selectedMotif = 'Non applicable';
            this.selectedAnnulePar = '';
            this.selectedRefusePar = '';
            this.selectedDateAnnulation = null;
        }

        this.showMotifDialog = true;
    }

// Garder l'ancienne méthode pour compatibilité
    viewMotif(evaluation: any): void {
        this.viewMotifDetails(evaluation);
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

    toggleShowCancelled(): void {
        console.log('🔄 AVANT - showCancelled =', this.showCancelled);
        this.showCancelled = !this.showCancelled;
        console.log('🔄 APRÈS - showCancelled =', this.showCancelled);
        this.applyFilter();
        console.log('📊 filteredEvaluations.length =', this.filteredEvaluations.length);
    }

    applyFilter(): void {
        console.log('🔍 Filtrage - showCancelled =', this.showCancelled);
        console.log('🔍 Total évaluations:', this.evaluations.length);
        console.log('🔍 Annulées présentes:', this.evaluations.filter(e => e.statut === 'ANNULEE').length);

        // Afficher tous les statuts pour debug
        this.evaluations.forEach(e => console.log(`   - ID: ${e.id}, Statut: ${e.statut}`));

        if (this.showCancelled) {
            this.filteredEvaluations = this.evaluations;
            console.log('✅ AFFICHAGE TOUTES les évaluations');
        } else {
            const annulees = this.evaluations.filter(e => e.statut === 'ANNULEE');
            console.log('🚫 Annulées masquées:', annulees.length);

            this.filteredEvaluations = this.evaluations.filter(e => e.statut !== 'ANNULEE');
        }
    }

    createEvaluation(): void {
        this.router.navigate(['/evaluations/nouveau']);
    }

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

    reactiverEvaluation(id: number): void {
        this.confirmationService.confirm({
            message: 'Voulez-vous vraiment réactiver cette évaluation ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.evaluationService.reactiverEvaluation(id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Évaluation réactivée avec succès'
                        });
                        this.loadEvaluations();
                    },
                    error: (error) => {
                        console.error('Erreur réactivation', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: error.error?.message || 'Impossible de réactiver l\'évaluation'
                        });
                    }
                });
            }
        });
    }

    getStatutSeverity(statut: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'help' {
        const colors: { [key: string]: any } = {
            'BROUILLON': 'warning',
            'A_APPROUVER': 'info',
            'APPROUVEE': 'success',
            'A_VALIDER_SERVICE': 'help',
            'A_VALIDER_DIRECTEUR': 'help',
            'EN_COURS': 'info',
            'VALIDEE': 'success',
            'ANNULEE': 'danger',
            'REFUSEE': 'danger',
            'ARCHIVEE': 'secondary'
        };
        return colors[statut] || 'secondary';
    }

    getNoteColor(note: number | null | undefined): string {
        if (note === null || note === undefined) return '#6c757d';
        if (note >= 8) return '#22c55e';
        if (note >= 6) return '#3b82f6';
        if (note >= 4) return '#eab308';
        return '#ef4444';
    }

    formatNote(note: number | null | undefined): string {
        if (note === null || note === undefined) {
            return '-';
        }
        return note.toFixed(1) + '/10';
    }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import {Evaluation, StatutColors, StatutLabels } from '../../models/entities/evaluation';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { ExportService } from '../../services/Export/export.service';
import { AnneeExerciceService } from '../../services/anneeExercice/annee-exercice.service';

@Component({
  selector: 'app-liste-evaluations',
  templateUrl: './liste-evaluations.component.html',
  styleUrls: ['./liste-evaluations.component.scss']
})
export class ListeEvaluationsComponent implements OnInit {

    @ViewChild('dt') dt!: Table;

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
    selectedEvaluation: Evaluation | null = null; // ✅ Pour la sélection
    anneesDisponibles: number[] = []; // Pour stocker les années disponibles
    anneeSelectionneePourRapport: number = new Date().getFullYear(); // Année par défaut

    constructor(
        private evaluationService: EvaluationService,
        public authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private exportService: ExportService,
        private anneeExerciceService: AnneeExerciceService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadEvaluations();
        this.loadAnneesExercice(); // ✅ Charger les années
        if (this.authService.hasAnyRole(['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION'])) {
            this.loadEvaluationsAFaire();
        }
    }

    // ✅ Charger les années depuis annee_exercice
    loadAnneesExercice(): void {
        // Vous devez avoir un service pour les années
        this.anneeExerciceService.getAllAnnees().subscribe({
            next: (data) => {
                this.anneesDisponibles = data
                    .map(a => a.annee)
                    .sort((a, b) => b - a); // Tri décroissant

                // Sélectionner la première année disponible par défaut
                if (this.anneesDisponibles.length > 0) {
                    this.anneeSelectionneePourRapport = this.anneesDisponibles[0];
                }
            },
            error: (error) => {
                console.error('Erreur chargement années:', error);
                // Fallback: année courante
                this.anneesDisponibles = [new Date().getFullYear()];
            }
        });
    }

    // ✅ Méthode pour sélectionner une évaluation
    selectEvaluation(evaluation: Evaluation): void {
        this.selectedEvaluation = evaluation;
    }

    // Exporter une évaluation spécifique
    exportEvaluation(evaluation: any): void {
        // Récupérer les détails du collaborateur et évaluateur
        const collaborateur = evaluation.collaborateur || {
            prenoms: evaluation.collaborateurNom?.split(' ')[0] || '',
            nom: evaluation.collaborateurNom?.split(' ').slice(1).join(' ') || evaluation.collaborateurNom,
            matricule: '',
            posteActuel: ''
        };

        const evaluateur = evaluation.evaluateur || {
            prenoms: evaluation.evaluateurNom?.split(' ')[0] || '',
            nom: evaluation.evaluateurNom?.split(' ').slice(1).join(' ') || evaluation.evaluateurNom
        };

        this.exportService.exportEvaluationToPDF(evaluation, collaborateur, evaluateur);
    }

    // ✅ Exporter toutes les évaluations en Excel
    exportToExcel(): void {
        if (this.filteredEvaluations.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune évaluation à exporter'
            });
            return;
        }

        try {
            this.exportService.exportToExcel(this.filteredEvaluations, 'liste_evaluations');
            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: `${this.filteredEvaluations.length} évaluations exportées avec succès`
            });
        } catch (error) {
            console.error('Erreur export:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de l\'export Excel'
            });
        }
    }

    // ✅ Générer le rapport annuel
    // Version améliorée avec sélection d'année
    exportAnnualReport(): void {
        console.log('-------- EXPORT ANNUEL DEMARRÉ -------------');
        console.log('📅 AnneesDisponibles:', this.anneesDisponibles);

        if (this.anneesDisponibles.length === 0) {
            console.log('⚠️ Aucune année disponible');
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune année disponible dans la base'
            });
            return;
        }

        console.log('📅 Première année:', this.anneesDisponibles[0]);

        this.confirmationService.confirm({
            message: `Quelle année voulez-vous pour le rapport ?`,
            header: 'Sélection',
            icon: 'pi pi-question-circle',
            acceptLabel: this.anneesDisponibles[0].toString(),
            rejectLabel: this.anneesDisponibles[1]?.toString(),
            accept: () => {
                console.log('✅ Année acceptée:', this.anneesDisponibles[0]);
                this.genererRapportPourAnnee(this.anneesDisponibles[0]);
            },
            reject: () => {
                if (this.anneesDisponibles[1]) {
                    console.log('✅ Année rejetée (seconde):', this.anneesDisponibles[1]);
                    this.genererRapportPourAnnee(this.anneesDisponibles[1]);
                } else {
                    console.log('❌ Aucune seconde année disponible');
                }
            }
        });
    }

    private genererRapportPourAnnee(annee: number): void {
        console.log('-------- GÉNÉRATION RAPPORT POUR', annee, '-------------');
        console.log('📊 Nombre total d\'évaluations:', this.evaluations.length);

        const evaluationsAnnee = this.evaluations.filter(e => e.annee === annee);
        console.log('📊 Évaluations pour', annee, ':', evaluationsAnnee.length);

        if (evaluationsAnnee.length === 0) {
            console.log('⚠️ Aucune évaluation pour cette année');
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: `Aucune évaluation trouvée pour ${annee}`
            });
            return;
        }

        // ✅ Appeler la méthode sans await car c'est une Promise
        this.exportService.generateAnnualReport(this.evaluations, annee)
            .then(() => {
                console.log('✅ Rapport généré avec succès');
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Rapport annuel ${annee} généré avec succès`
                });
            })
            .catch(error => {
                console.error('❌ Erreur génération rapport:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la génération du rapport'
                });
            });
    }

    // ✅ Imprimer l'évaluation sélectionnée
    printSelected(): void {
        if (!this.selectedEvaluation) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner une évaluation à imprimer'
            });
            return;
        }

        try {
            const collaborateur = {
                prenoms: this.selectedEvaluation.collaborateurNom?.split(' ')[0] || '',
                nom: this.selectedEvaluation.collaborateurNom?.split(' ').slice(1).join(' ') || this.selectedEvaluation.collaborateurNom,
                matricule: '',
                posteActuel: ''
            };

            const evaluateur = {
                prenoms: this.selectedEvaluation.evaluateurNom?.split(' ')[0] || '',
                nom: this.selectedEvaluation.evaluateurNom?.split(' ').slice(1).join(' ') || this.selectedEvaluation.evaluateurNom
            };

            this.exportService.printEvaluation(this.selectedEvaluation, collaborateur, evaluateur);
        } catch (error) {
            console.error('Erreur impression:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de l\'impression'
            });
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


    // Exporter la liste en Excel






}

import { Component, OnInit } from '@angular/core';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { CollaborateurService } from '../../services/collaborateur/collaborateur.service';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {Evaluation, EvaluationRequest } from '../../models/entities/evaluation';

@Component({
  selector: 'app-formulaire-evaluation',
  templateUrl: './formulaire-evaluation.component.html',
  styleUrls: ['./formulaire-evaluation.component.scss']
})
export class FormulaireEvaluationComponent implements OnInit {

    evaluation: EvaluationRequest = {
        annee: new Date().getFullYear(),
        collaborateurId: 0,
        faitsMarquants: [],
        objectifs: [],
        objectifsFuturs: [],
        souhaitsFormations: []
    };

    // Données chargées
    evaluationComplete?: Evaluation;
    collaborateurs: any[] = [];
    currentUser: any;

    // États
    isEdit = false;
    evaluationId?: number;
    loading = false;
    saving = false;
    activeStep = 0;

    // Statut de l'évaluation
    statutActuel: string = 'BROUILLON';
    canEdit: boolean = true;
    canSubmit: boolean = false;
    canValidate: boolean = false;
    canSign: boolean = false;

    // Steps
    steps = [
        { label: 'Informations' },
        { label: 'Faits marquants' },
        { label: 'Objectifs' },
        { label: 'Tenue du poste' },
        { label: 'Maîtrise' },
        { label: 'Objectifs futurs' },
        { label: 'Formations' },
        { label: 'Commentaires' },
        { label: 'Validation' }
    ];

    // Options pour les dropdowns
    niveauOptions = [
        { label: 'Débutant(e)', value: 'DEBUTANT' },
        { label: 'Intermédiaire', value: 'INTERMEDIAIRE' },
        { label: 'Confirmé(e)', value: 'CONFIRME' },
        { label: 'Expert(e)', value: 'EXPERT' }
    ];

    niveauAtteinteOptions = [
        { label: 'Excellent (>100%)', value: 'EXCELLENT' },
        { label: 'Bien (80-100%)', value: 'BIEN' },
        { label: 'Passable (55-75%)', value: 'PASSABLE' },
        { label: 'Insuffisant (35-50%)', value: 'INSUFFISANT' },
        { label: 'Faible (≤30%)', value: 'FAIBLE' }
    ];

    typeObjectifOptions = [
        { label: 'Objectif Annuel', value: 'ANNUEL' },
        { label: 'Tenue du poste', value: 'TENUE_POSTE' }
    ];

    noteTenueOptions = Array.from({ length: 11 }, (_, i) => ({ label: i.toString(), value: i }));

    anneeOptions = Array.from({ length: 5 }, (_, i) => {
        const annee = new Date().getFullYear() - 2 + i;
        return { label: annee.toString(), value: annee };
    });

    constructor(
        private evaluationService: EvaluationService,
        private collaborateurService: CollaborateurService,
        public authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) {
        this.currentUser = this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadCollaborateurs();

        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.isEdit = true;
                this.evaluationId = +id;
                this.loadEvaluation(this.evaluationId);
                console.log('Chargement évaluation ID:', id);
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['collaborateurId']) {
                this.evaluation.collaborateurId = +params['collaborateurId'];
                console.log('Collaborateur ID depuis queryParams:', params['collaborateurId']);
            }
        });

        // Vérifier si c'est une vue en lecture seule
        this.route.url.subscribe(url => {
            // CORRECTION: Vérifier le chemin exact
            const path = url.map(segment => segment.path).join('/');
            console.log('Chemin actuel:', path);

            // Si le chemin est exactement "evaluations/:id" sans "editer"
            if (path.match(/^evaluations\/\d+$/) && this.evaluationId) {
                this.canEdit = false;  // Mode lecture seule
                console.log('Mode lecture seule activé pour la vue détails');
            }
        });
    }

    loadCollaborateurs(): void {
        this.collaborateurService.getCollaborateursEvaluables().subscribe({
            next: (data) => {
                this.collaborateurs = data;
            },
            error: (error) => {
                console.error('Erreur chargement collaborateurs:', error);
            }
        });
    }

    loadEvaluation(id: number): void {
        this.loading = true;
        this.evaluationService.getEvaluationById(id).subscribe({
            next: (data) => {
                this.evaluationComplete = data;
                this.statutActuel = data.statut || 'BROUILLON';

                // Mapper les données vers le formulaire
                this.evaluation = {
                    annee: data.annee,
                    collaborateurId: data.collaborateurId!,
                    dateEntretien: data.dateEntretien,
                    faitsMarquants: data.faitsMarquants || [],
                    objectifs: data.objectifs || [],
                    respectEngagements: data.respectEngagements,
                    qualiteMethodesTravail: data.qualiteMethodesTravail,
                    capacitesAdaptationOrganisation: data.capacitesAdaptationOrganisation,
                    encadrement: data.encadrement,
                    espritInitiativeInnovation: data.espritInitiativeInnovation,
                    relationPresentation: data.relationPresentation,
                    ponctualite: data.ponctualite,
                    respectReglementInterieur: data.respectReglementInterieur,
                    niveauTechnique: data.niveauTechnique,
                    niveauExperience: data.niveauExperience,
                    niveauEncadrement: data.niveauEncadrement,
                    commentairesMaitrise: data.commentairesMaitrise,
                    objectifsFuturs: data.objectifsFuturs || [],
                    souhaitsFormations: data.souhaitsFormations || [],
                    commentaireResponsable: data.commentaireResponsable,
                    commentaireCollaborateur: data.commentaireCollaborateur,
                    commentaireN2: data.commentaireN2,
                    commentaireN3: data.commentaireN3
                };

                this.checkPermissions();
                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger l\'évaluation'
                });
                console.error('Erreur chargement évaluation:', error);
            }
        });
    }

    checkPermissions(): void {
        // Vérifier les permissions selon le statut
        switch (this.statutActuel) {
            case 'BROUILLON':
                this.canEdit = true;
                this.canSubmit = true;
                this.canValidate = false;
                this.canSign = false;
                break;
            case 'EN_COURS':
                this.canEdit = false;
                this.canSubmit = false;
                this.canValidate = this.currentUser?.role === 'ADMIN' || this.currentUser?.role === 'DIRECTEUR';
                this.canSign = this.currentUser?.role === 'COLLABORATEUR' || this.currentUser?.role === 'CHEF_SERVICE';
                break;
            case 'A_VALIDER':
                this.canEdit = false;
                this.canSubmit = false;
                this.canValidate = true;
                this.canSign = false;
                break;
            case 'VALIDEE':
            case 'REFUSEE':
                this.canEdit = false;
                this.canSubmit = false;
                this.canValidate = false;
                this.canSign = false;
                break;
        }

        console.log('Permissions - canEdit:', this.canEdit, 'canSubmit:', this.canSubmit, 'canValidate:', this.canValidate, 'canSign:', this.canSign);
    }

    nextStep(): void {
        if (this.activeStep < this.steps.length - 1) {
            this.activeStep++;
        }
    }

    prevStep(): void {
        if (this.activeStep > 0) {
            this.activeStep--;
        }
    }

    goToStep(step: number): void {
        if (step >= 0 && step < this.steps.length) {
            this.activeStep = step;
        }
    }

    addFaitMarquant(): void {
        if (!this.evaluation.faitsMarquants) {
            this.evaluation.faitsMarquants = [];
        }
        this.evaluation.faitsMarquants.push('');
    }

    removeFaitMarquant(index: number): void {
        this.evaluation.faitsMarquants?.splice(index, 1);
    }

    addObjectif(): void {
        if (!this.evaluation.objectifs) {
            this.evaluation.objectifs = [];
        }
        this.evaluation.objectifs.push({
            libelle: ''
        });
    }

    removeObjectif(index: number): void {
        this.evaluation.objectifs?.splice(index, 1);
    }

    addObjectifFutur(): void {
        if (!this.evaluation.objectifsFuturs) {
            this.evaluation.objectifsFuturs = [];
        }
        this.evaluation.objectifsFuturs.push({
            libelle: '',
            type: 'ANNUEL'
        });
    }

    removeObjectifFutur(index: number): void {
        this.evaluation.objectifsFuturs?.splice(index, 1);
    }

    addFormation(): void {
        if (!this.evaluation.souhaitsFormations) {
            this.evaluation.souhaitsFormations = [];
        }
        this.evaluation.souhaitsFormations.push({
            theme: ''
        });
    }

    removeFormation(index: number): void {
        this.evaluation.souhaitsFormations?.splice(index, 1);
    }

    // Sauvegarder en brouillon
    saveDraft(): void {
        if (!this.validateForm()) {
            return;
        }

        this.saving = true;

        if (this.isEdit && this.evaluationId) {
            this.evaluationService.updateEvaluation(this.evaluationId, this.evaluation).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Brouillon sauvegardé avec succès'
                    });
                    this.evaluationId = response.id;
                    this.isEdit = true;
                    this.saving = false;

                    // Recharger l'évaluation pour mettre à jour les données
                    this.loadEvaluation(this.evaluationId);
                },
                error: (error) => {
                    this.saving = false;
                    console.error('Erreur sauvegarde:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: error.error?.message || 'Erreur lors de la sauvegarde'
                    });
                }
            });
        } else {
            this.evaluationService.createEvaluation(this.evaluation).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Brouillon créé avec succès'
                    });
                    this.evaluationId = response.id;
                    this.isEdit = true;
                    this.saving = false;

                    // Rediriger vers la page d'édition
                    this.router.navigate(['/evaluations', response.id]);
                },
                error: (error) => {
                    this.saving = false;
                    console.error('Erreur création:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: error.error?.message || 'Erreur lors de la création'
                    });
                }
            });
        }
    }

    // Sauvegarder et passer à l'étape suivante



    saveAndContinue(): void {
        if (!this.validateForm()) {
            return;
        }

        // Vérifier que les objectifs ont des cotations
        if (this.evaluation.objectifs && this.evaluation.objectifs.length > 0) {
            this.evaluation.objectifs.forEach((obj, index) => {
                console.log(`Objectif ${index + 1}:`, obj);
            });
        }

        this.saving = true;

        const action = this.isEdit && this.evaluationId ?
            this.evaluationService.updateEvaluation(this.evaluationId, this.evaluation) :
            this.evaluationService.createEvaluation(this.evaluation);

        action.subscribe({
            next: (response) => {
                console.log('Réponse après sauvegarde:', response);
                if (!this.isEdit) {
                    this.evaluationId = response.id;
                    this.isEdit = true;
                }
                this.saving = false;
                this.nextStep();
            },
            error: (error) => {
                this.saving = false;
                console.error('Erreur:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la sauvegarde'
                });
            }
        });
    }

    // Soumettre pour validation
    soumettrePourValidation(): void {
        if (!this.evaluationId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez d\'abord sauvegarder l\'évaluation'
            });
            return;
        }

        if (confirm('Voulez-vous soumettre cette évaluation pour validation ?')) {
            this.evaluationService.soumettrePourValidation(this.evaluationId).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Évaluation soumise pour validation'
                    });
                    setTimeout(() => this.router.navigate(['/liste-evaluations']), 1500);
                },
                error: (error) => {
                    console.error('Erreur soumission:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: error.error?.message || 'Erreur lors de la soumission'
                    });
                }
            });
        }
    }

    // Valider l'évaluation
    validerEvaluation(): void {
        if (!this.evaluationId) return;

        if (confirm('Voulez-vous valider cette évaluation ?')) {
            this.evaluationService.validerEvaluation(this.evaluationId).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Évaluation validée avec succès'
                    });
                    setTimeout(() => this.router.navigate(['/liste-evaluations']), 1500);
                },
                error: (error) => {
                    console.error('Erreur validation:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: error.error?.message || 'Erreur lors de la validation'
                    });
                }
            });
        }
    }

    // Refuser l'évaluation
    refuserEvaluation(): void {
        if (!this.evaluationId) return;

        const motif = prompt('Motif du refus :');
        if (motif !== null) {
            this.evaluationService.refuserEvaluation(this.evaluationId).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Information',
                        detail: 'Évaluation refusée'
                    });
                    setTimeout(() => this.router.navigate(['/liste-evaluations']), 1500);
                },
                error: (error) => {
                    console.error('Erreur refus:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: error.error?.message || 'Erreur lors du refus'
                    });
                }
            });
        }
    }

    // Signer l'évaluation
    signerEvaluation(isResponsable: boolean): void {
        if (!this.evaluationId) return;

        const signature = prompt('Entrez votre signature (nom complet) :', this.currentUser?.nomComplet || '');
        if (signature) {
            this.evaluationService.signerEvaluation(this.evaluationId, signature, isResponsable).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: isResponsable ? 'Signature responsable ajoutée' : 'Signature collaborateur ajoutée'
                    });
                    this.evaluationComplete = response;
                    this.statutActuel = response.statut || this.statutActuel;
                    this.checkPermissions();
                },
                error: (error) => {
                    console.error('Erreur signature:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: error.error?.message || 'Erreur lors de la signature'
                    });
                }
            });
        }
    }

    // Sauvegarder et terminer
    // Dans formulaire-evaluation.component.ts - avant sauvegarde
    saveAndFinish(): void {
        if (!this.validateForm()) {
            return;
        }

        // Vérifier et logger les objectifs
        console.log('Objectifs avant sauvegarde:', this.evaluation.objectifs);

        // S'assurer que les objectifs ont une structure valide
        if (this.evaluation.objectifs) {
            this.evaluation.objectifs = this.evaluation.objectifs.map(obj => ({
                libelle: obj.libelle || '',
                cotation: obj.cotation || 0,
                tauxAtteinte: obj.tauxAtteinte || 0,
                appreciationCollaborateur: obj.appreciationCollaborateur || '',
                appreciationResponsable: obj.appreciationResponsable || '',
                niveauAtteinte: obj.niveauAtteinte
            }));
        }

        this.saving = true;

        const action = this.isEdit && this.evaluationId ?
            this.evaluationService.updateEvaluation(this.evaluationId, this.evaluation) :
            this.evaluationService.createEvaluation(this.evaluation);

        action.subscribe({
            next: (response) => {
                console.log('Réponse après sauvegarde:', response);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: this.isEdit ? 'Évaluation mise à jour' : 'Évaluation créée'
                });
                this.saving = false;
                setTimeout(() => this.router.navigate(['/liste-evaluations']), 1500);
            },
            error: (error) => {
                this.saving = false;
                console.error('Erreur:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de la sauvegarde'
                });
            }
        });
    }

    cancel(): void {
        if (this.isEdit && this.evaluationId) {
            this.router.navigate(['/liste-evaluations']);
        } else {
            this.router.navigate(['/liste-evaluations']);
        }
    }

    private validateForm(): boolean {
        if (!this.evaluation.collaborateurId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Veuillez sélectionner un collaborateur'
            });
            return false;
        }
        if (!this.evaluation.annee) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Veuillez sélectionner une année'
            });
            return false;
        }
        return true;
    }

    getStatutClass(): string {
        const classes: any = {
            'BROUILLON': 'warning',
            'EN_COURS': 'info',
            'A_VALIDER': 'help',
            'VALIDEE': 'success',
            'REFUSEE': 'danger'
        };
        return classes[this.statutActuel] || 'secondary';
    }

    getStatutLabel(): string {
        const labels: any = {
            'BROUILLON': 'Brouillon',
            'EN_COURS': 'En cours',
            'A_VALIDER': 'À valider',
            'VALIDEE': 'Validée',
            'REFUSEE': 'Refusée'
        };
        return labels[this.statutActuel] || this.statutActuel;
    }
}

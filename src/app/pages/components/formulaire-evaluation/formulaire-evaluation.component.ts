import { Component, OnInit } from '@angular/core';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { CollaborateurService } from '../../services/collaborateur/collaborateur.service';
import { AuthService } from '../../services/auth/auth.service';
// @ts-ignore
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {Evaluation, EvaluationRequest, FaitMarquant, } from '../../models/entities/evaluation';
import { finalize, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-formulaire-evaluation',
  templateUrl: './formulaire-evaluation.component.html',
  styleUrls: ['./formulaire-evaluation.component.scss']
})
export class FormulaireEvaluationComponent implements OnInit {




    // =============================================
    // PROPRIÉTÉS
    // =============================================
    evaluation: EvaluationRequest = {
        annee: new Date().getFullYear(),
        collaborateurId: 0,
        faitsMarquants: [], // Pour la compatibilité
        objectifsFuturs: [],
        faitsMarquantsStruct: [] as FaitMarquant[], // Nouvelle structure
        souhaitsFormations: []
    };

   


    private apiUrl = 'http://localhost:8080/api/collaborateurs';
    evaluationComplete?: Evaluation;
    collaborateurs: any[] = [];
    currentUser: any;

    // États
    isEdit = false;
    evaluationId?: number;
    loading = false;
    saving = false;
    activeStep = 0;
    statutActuel: string = 'BROUILLON';

    // Permissions
    canEdit: boolean = false;
    canSubmit: boolean = false;
    canValidate: boolean = false;
    canApprove: boolean = false;
    canRefuse: boolean = false;

    evaluateurSignature: string ;
    collaborateurSignature: string;
    showEvaluateurSignatureDialog: boolean = false;
    showCollaborateurSignatureDialog: boolean = false;

    // Propriétés pour les dialogues
    showSignatureDialog: boolean = false;
    selectedSignature: string = '';
    signatureDialogTitle: string = '';

    // Steps
    steps = [
        { label: 'Informations' },
        { label: 'Faits marquants' },
        { label: 'Objectifs' },
        { label: 'Tenue du poste' },
        { label: 'Maîtrise' },
        { label: 'Objectifs futurs' },
        { label: 'Formations' },
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

    tauxAtteinteOptionsSimple = [
        { label: '0%', value: 0 },
        { label: '10%', value: 10 },
        { label: '20%', value: 20 },
        { label: '30%', value: 30 },
        { label: '40%', value: 40 },
        { label: '50%', value: 50 },
        { label: '60%', value: 60 },
        { label: '70%', value: 70 },
        { label: '80%', value: 80 },
        { label: '90%', value: 90 },
        { label: '100%', value: 100 },
    ];

    cotationOptionsSimple = [
        { label: '0/10 - Insuffisant', value: 0 },
        { label: '1/10 - Très faible', value: 1 },
        { label: '2/10 - Faible', value: 2 },
        { label: '3/10 - Passable', value: 3 },
        { label: '4/10 - Moyen', value: 4 },
        { label: '5/10 - Satisfaisant', value: 5 },
        { label: '6/10 - Assez bien', value: 6 },
        { label: '7/10 - Bien', value: 7 },
        { label: '8/10 - Très bien', value: 8 },
        { label: '9/10 - Excellent', value: 9 },
        { label: '10/10 - Parfait', value: 10 }
    ];

    typeFaitMarquantOptions = [
        { label: 'Changement de poste', value: 'CHANGEMENT_POSTE', icon: 'pi pi-briefcase' },
        { label: 'Mission Spécifique', value: 'MISSION_SPECIFIQUE', icon: 'pi pi-flag' },
        { label: 'Mutation', value: 'MUTATION', icon: 'pi pi-sync' },
        { label: 'Promotion', value: 'PROMOTION', icon: 'pi pi-arrow-up' },
        { label: 'Formation', value: 'FORMATION', icon: 'pi pi-graduation-cap' },
        { label: 'Autre', value: 'AUTRE', icon: 'pi pi-star' }
    ];
    // =============================================
    // CONSTRUCTEUR
    // =============================================
    constructor(
        private evaluationService: EvaluationService,
        private collaborateurService: CollaborateurService,
        public authService: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService,
        private http: HttpClient
    ) {
        this.currentUser = this.authService.getCurrentUser();
    }

    // =============================================
    // INITIALISATION
    // =============================================
    ngOnInit(): void {
        this.loadCollaborateurs();

        this.route.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.isEdit = true;
                this.evaluationId = +id;
                this.loadEvaluation(this.evaluationId);
            } else {
                // NOUVELLE ÉVALUATION
                console.log('NOUVELLE ÉVALUATION');
                this.isEdit = false;
                this.activeStep = 0;
                this.canEdit = true;
                this.canSubmit = false;
                this.canValidate = false;
                this.canApprove = false;
                this.canRefuse = false;
                this.statutActuel = 'BROUILLON';
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['collaborateurId']) {
                this.evaluation.collaborateurId = +params['collaborateurId'];
            }
        });
    }

    // Ouvrir le dialogue de signature
    openSignatureDialog(signature: string, nom: string): void {
        this.selectedSignature = signature;
        this.signatureDialogTitle = `Signature de ${nom}`;
        this.showSignatureDialog = true;
    }

// Signer l'évaluation
    signerEvaluation(type: 'responsable' | 'collaborateur'): void {
        if (!this.evaluationId) return;

        this.saving = true;
        const signature = type === 'responsable' ? this.evaluateurSignature : this.collaborateurSignature;

        this.evaluationService.signerEvaluation(this.evaluationId, signature, type === 'responsable')
            .subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Signature ${type === 'responsable' ? 'responsable' : 'collaborateur'} apposée`
                    });

                    // Mettre à jour l'évaluation
                    this.evaluationComplete = response;
                    this.saving = false;

                    // Vérifier si les deux signatures sont présentes
                    if (response.signatureResponsable && response.signatureCollaborateur) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Évaluation complètement signée et validée !'
                        });
                    }
                },
                error: (error) => {
                    console.error('❌ Erreur signature:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible d\'apposer la signature'
                    });
                    this.saving = false;
                }
            });
    }

    // Dans formulaire-evaluation.component.ts
    getStarColor(cotation: number): string {
        if (cotation >= 8) return '#4CAF50'; // Vert pour excellent
        if (cotation >= 6) return '#2196F3'; // Bleu pour bien
        if (cotation >= 4) return '#FF9800'; // Orange pour moyen
        return '#F44336'; // Rouge pour faible
    }
    addFaitMarquantStruct(): void {
        if (!this.evaluation.faitsMarquantsStruct) {
            this.evaluation.faitsMarquantsStruct = [];
        }
        this.evaluation.faitsMarquantsStruct.push({
            type: 'CHANGEMENT_POSTE',
            description: '',
            date: new Date()
        });
    }

    removeFaitMarquantStruct(index: number): void {
        this.evaluation.faitsMarquantsStruct?.splice(index, 1);
    }

// Pour la sauvegarde, convertir en liste de strings
    prepareFaitsMarquantsForSave1(): string[] {
        if (!this.evaluation.faitsMarquantsStruct) return [];

        return this.evaluation.faitsMarquantsStruct.map(fm => {
            const typeLabel = this.typeFaitMarquantOptions.find(opt => opt.value === fm.type)?.label || fm.type;
            const dateStr = fm.date ? ` (${new Date(fm.date).toLocaleDateString('fr-FR')})` : '';
            const desc = fm.description ? ` - ${fm.description}` : '';
            return `${typeLabel}${dateStr}${desc}`;
        });
    }

    prepareFaitsMarquantsForSave(): any[] {
        if (!this.evaluation.faitsMarquantsStruct) return [];

        return this.evaluation.faitsMarquantsStruct.map(fm => {
            return {
                type: fm.type,
                description: fm.description || '',
                dateEvenement: fm.date ? this.formatDateForBackend(fm.date) : null
            };
        });
    }

    formatDateForBackend(date: Date): string {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`; // Format YYYY-MM-DD pour le backend
    }

    // =============================================
    // CHARGEMENT DES DONNÉES
    // =============================================
    loadCollaborateurs(): void {
        console.log('📋 Chargement des collaborateurs - APPEL AU SERVICE');
        console.log('✅ URL appelée:', `${this.apiUrl}/evaluables`);

        this.collaborateurService.getCollaborateursEvaluables().subscribe({
            next: (data) => {
                console.log('✅ Données reçues du backend:', data);
                this.collaborateurs = data;
            },
            error: (error) => {
                console.error('❌ Erreur:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les collaborateurs'
                });
                // Données de secours
                this.collaborateurs = [
                    { id: 1, nomComplet: 'TRAORE Issa', matricule: '279', posteActuel: 'Développeur' },
                    { id: 2, nomComplet: 'DUBOIS Paul', matricule: '280', posteActuel: 'Développeur' },
                    { id: 3, nomComplet: 'SANHAMA Sawadogo', matricule: 'CH001', posteActuel: 'Chef de Service' }
                ];
            }
        });
    }

/*    loadEvaluation(id: number): void {
        this.loading = true;
        console.log('🔍 CHARGEMENT ÉVALUATION ID:', id);

        this.evaluationService.getEvaluationById(id)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (data) => {
                    console.log('✅ Évaluation chargée:', data);
                    console.log('🔍 Faits marquants bruts:', data.faitsMarquants); // Vérifiez ce log

                    this.evaluationComplete = data;
                    this.statutActuel = data.statut || 'BROUILLON';

                    // ✅ Appeler mapEvaluationData avec les données
                    this.mapEvaluationData(data);

                    // Vérifier après mapping
                    console.log('✅ Après mapping - faitsMarquantsStruct:', this.evaluation.faitsMarquantsStruct);

                    this.checkPermissions();
                },
                error: (error) => {
                    console.error('❌ Erreur chargement évaluation:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger l\'évaluation'
                    });
                }
            });
    }*/

    // Dans loadEvaluation, après avoir chargé les données
    loadEvaluation(id: number): void {
        this.loading = true;
        console.log('🔍 CHARGEMENT ÉVALUATION ID:', id);

        this.evaluationService.getEvaluationById(id)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (data) => {
                    console.log('✅ Évaluation chargée:', data);

                    this.evaluationComplete = data;
                    this.statutActuel = data.statut || 'BROUILLON';
                    this.mapEvaluationData(data);

                    // ✅ Charger les signatures des collaborateurs
                    if (data.evaluateur?.id) {
                        this.loadCollaborateurSignature(data.evaluateur.id, 'evaluateur');
                    }
                    if (data.collaborateur?.id) {
                        this.loadCollaborateurSignature(data.collaborateur.id, 'collaborateur');
                    }

                    this.checkPermissions();
                },
                error: (error) => {
                    console.error('❌ Erreur chargement évaluation:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible de charger l\'évaluation'
                    });
                }
            });
    }

    // Charger la signature d'un collaborateur
    loadCollaborateurSignature(collaborateurId: number, type: 'evaluateur' | 'collaborateur'): void {
        this.collaborateurService.getCollaborateurById(collaborateurId).subscribe({
            next: (collab) => {
                if (type === 'evaluateur') {
                    this.evaluateurSignature = collab.signature || '';
                    console.log('✅ Signature évaluateur chargée:', !!this.evaluateurSignature);
                } else {
                    this.collaborateurSignature = collab.signature || '';
                    console.log('✅ Signature collaborateur chargée:', !!this.collaborateurSignature);
                }
            },
            error: (error) => {
                console.error(`❌ Erreur chargement signature ${type}:`, error);
            }
        });
    }

    private mapEvaluationData(data: Evaluation): void {

        // ✅ 1. D'abord, parser les faits marquants du backend
        const faitsMarquantsStruct = this.parseFaitsMarquantsFromBackend(data.faitsMarquants);

        // ✅ 2. Construire l'objet evaluation avec les données reçues
        this.evaluation = {
            annee: data.annee,
            collaborateurId: data.collaborateurId!,
            dateEntretien: data.dateEntretien,
            faitsMarquants: data.faitsMarquants || [], // Garder les données brutes

            // ✅ IMPORTANT: Ajouter les faits marquants structurés
            faitsMarquantsStruct: faitsMarquantsStruct,

            // Objectifs
            objectifs: data.objectifs || [],

            // Tenue du poste
            respectEngagements: data.respectEngagements,
            qualiteMethodesTravail: data.qualiteMethodesTravail,
            capacitesAdaptationOrganisation: data.capacitesAdaptationOrganisation,
            encadrement: data.encadrement,
            espritInitiativeInnovation: data.espritInitiativeInnovation,
            relationPresentation: data.relationPresentation,
            ponctualite: data.ponctualite,
            respectReglementInterieur: data.respectReglementInterieur,

            // Maîtrise du poste
            niveauTechnique: data.niveauTechnique,
            niveauExperience: data.niveauExperience,
            niveauEncadrement: data.niveauEncadrement,
            commentairesMaitrise: data.commentairesMaitrise,

            // Objectifs futurs
            objectifsFuturs: data.objectifsFuturs || [],

            // Formations
            souhaitsFormations: data.souhaitsFormations || [],

            // Commentaires
            commentaireResponsable: data.commentaireResponsable,
            commentaireCollaborateur: data.commentaireCollaborateur,
            commentaireN2: data.commentaireN2,
            commentaireN3: data.commentaireN3
        };

        // Logs de débogage
        console.log('=== DONNÉES MAPPÉES ===');
        console.log('Faits marquants bruts:', data.faitsMarquants);
        console.log('Faits marquants structurés:', this.evaluation.faitsMarquantsStruct);
        console.log('Tenue du poste:', {
            respectEngagements: this.evaluation.respectEngagements,
            qualiteMethodesTravail: this.evaluation.qualiteMethodesTravail
        });
    }

    // =============================================
    // GESTION DES PERMISSIONS
    // =============================================
    checkPermissions(): void {
        const user = this.currentUser;
        const isAdmin = user?.role === 'ADMIN';

        // Récupérer les informations complètes
        const evaluateur = this.evaluationComplete?.evaluateur;
        const evalue = this.evaluationComplete?.collaborateur;

        console.log('=== PERMISSIONS DÉTAILLÉES ===');
        console.log('Statut:', this.statutActuel);
        console.log('User:', { id: user?.id, role: user?.role, directionId: user?.directionId });
        console.log('Évaluateur:', {
            id: evaluateur?.id,
            role: evaluateur?.role,
            directionId: evaluateur?.directionId,
            serviceId: evaluateur?.serviceId
        });

        // Vérifier si l'utilisateur est le directeur de l'évaluateur
        const estDirecteurDeLEvaluateur = user?.role === 'DIRECTEUR' &&
            evaluateur?.directionId === user?.directionId;

        // Vérifier si l'utilisateur est le chef de service de l'évaluateur
        const estChefServiceDeLEvaluateur = user?.role === 'CHEF_SERVICE' &&
            evaluateur?.serviceId === user?.serviceId;

        // Vérifier si l'utilisateur est le collaborateur évalué
        const estLeCollaborateurEvalue = evalue?.id === user?.id;

        // Vérifier si l'utilisateur est l'évaluateur
        const estLEvaluateur = evaluateur?.id === user?.id;

        console.log('Est directeur de l\'évaluateur:', estDirecteurDeLEvaluateur);
        console.log('Est chef service de l\'évaluateur:', estChefServiceDeLEvaluateur);

        // Réinitialiser
        this.canEdit = false;
        this.canSubmit = false;
        this.canValidate = false;
        this.canApprove = false;
        this.canRefuse = false;

        if (!this.isEdit && !this.evaluationId) {
            this.canEdit = true;
            return;
        }

        switch (this.statutActuel) {
            case 'BROUILLON':
                this.canEdit = estLEvaluateur || isAdmin;
                this.canSubmit = estLEvaluateur;
                break;

            case 'A_APPROUVER':
                this.canApprove = estLeCollaborateurEvalue;
                this.canRefuse = estLeCollaborateurEvalue;
                break;

            case 'A_VALIDER_SERVICE':
                this.canValidate = estChefServiceDeLEvaluateur || isAdmin;
                break;

            case 'A_VALIDER_DIRECTEUR':
                // ✅ CORRECTION: Le directeur peut valider
                this.canValidate = estDirecteurDeLEvaluateur || isAdmin;
                console.log('🔑 canValidate pour directeur:', this.canValidate);
                break;

            default:
                break;
        }
    }

// Méthodes utilitaires pour vérifier la hiérarchie
    private estChefServiceDe(user: any, evaluateur: any): boolean {
        if (!user || !evaluateur) return false;

        // Admin peut tout faire
        if (user.role === 'ADMIN') return true;

        // Vérifier que l'utilisateur est chef de service
        if (user.role !== 'CHEF_SERVICE') return false;

        // Vérifier que c'est le même service
        return user.serviceId === evaluateur.serviceId;
    }

    private estDirecteurDe(user: any, evaluateur: any): boolean {
        if (!user || !evaluateur) return false;

        // Admin peut tout faire
        if (user.role === 'ADMIN') return true;

        // Vérifier que l'utilisateur est directeur
        if (user.role !== 'DIRECTEUR') return false;

        // Vérifier que c'est la même direction
        return user.directionId === evaluateur.directionId;
    }

    // =============================================
    // GESTION DES ÉTAPES
    // =============================================
    nextStep(): void {
        if (this.activeStep < this.steps.length - 1) {
            this.activeStep++;
            this.saveDraft();
            console.log('Étape suivante:', this.activeStep);
        }
    }

    prevStep(): void {
        if (this.activeStep > 0) {
            this.activeStep--;
            console.log('Étape précédente:', this.activeStep);
        }
    }

    goToStep(step: number): void {
        if (step >= 0 && step < this.steps.length) {
            this.activeStep = step;
        }
    }

    trackByIndex(index: number): number {
        return index;
    }

    // =============================================
    // GESTION DES LISTES DYNAMIQUES
    // =============================================
    addFaitMarquant(): void {
        if (!this.evaluation.faitsMarquants) this.evaluation.faitsMarquants = [];
        this.evaluation.faitsMarquants.push('');
    }

    removeFaitMarquant(index: number): void {
        this.evaluation.faitsMarquants?.splice(index, 1);
    }

    addObjectif(): void {
        if (!this.evaluation.objectifs) this.evaluation.objectifs = [];
        this.evaluation.objectifs.push({ libelle: '' });
    }

    removeObjectif(index: number): void {
        this.evaluation.objectifs?.splice(index, 1);
    }

    addObjectifFutur(): void {
        if (!this.evaluation.objectifsFuturs) this.evaluation.objectifsFuturs = [];
        this.evaluation.objectifsFuturs.push({ libelle: '', type: 'ANNUEL' });
    }

    removeObjectifFutur(index: number): void {
        this.evaluation.objectifsFuturs?.splice(index, 1);
    }

    addFormation(): void {
        if (!this.evaluation.souhaitsFormations) this.evaluation.souhaitsFormations = [];
        this.evaluation.souhaitsFormations.push({ theme: '' });
    }

    removeFormation(index: number): void {
        this.evaluation.souhaitsFormations?.splice(index, 1);
    }

// Dans mapEvaluationData, après avoir chargé les données
    private parseFaitsMarquantsFromBackend(faitsMarquants: any[]): any[] {
        if (!faitsMarquants || faitsMarquants.length === 0) {
            console.log('⚠️ Aucun fait marquant à parser');
            return [];
        }

        console.log('📥 Parsing des faits marquants:', faitsMarquants);

        // Si ce sont déjà des objets (nouveau format)
        if (faitsMarquants.length > 0 && typeof faitsMarquants[0] === 'object') {
            return faitsMarquants.map(fm => {
                console.log('  - Objet trouvé:', fm);
                return {
                    type: fm.type || 'AUTRE',
                    description: fm.description || '',
                    date: fm.dateEvenement ? new Date(fm.dateEvenement) : null
                };
            });
        }

        // Si ce sont des strings (ancien format) - on garde pour la compatibilité
        console.log('⚠️ Ancien format de faits marquants détecté (strings)');
        return faitsMarquants.map((str: string) => {
            // Essayer de parser intelligemment
            let type = 'AUTRE';
            let description = str;
            let date = null;

            // Chercher le type dans les options
            for (const opt of this.typeFaitMarquantOptions) {
                if (str.includes(opt.label)) {
                    type = opt.value;
                    description = str.replace(opt.label, '').trim();
                    break;
                }
            }

            // Chercher une date (format JJ/MM/AAAA)
            const dateMatch = str.match(/\((\d{2})\/(\d{2})\/(\d{4})\)/);
            if (dateMatch) {
                const [_, day, month, year] = dateMatch;
                date = new Date(+year, +month - 1, +day);
                description = description.replace(dateMatch[0], '').trim();
            }

            // Nettoyer la description
            description = description.replace(/^-\s*/, '').trim();

            return { type, description, date };
        });
    }

    // =============================================
    // SAUVEGARDE
    // =============================================
    // =============================================
// SAUVEGARDE CORRIGÉE
// =============================================
    saveDraft(): void {
        if (!this.validateForm()) return;

        // ✅ S'assurer que les objectifs ont une structure correcte
        if (this.evaluation.objectifs) {
            this.evaluation.objectifs = this.evaluation.objectifs.map(obj => ({
                libelle: obj.libelle || '',
                cotation: obj.cotation || 0,
                tauxAtteinte: obj.tauxAtteinte || 0,
                appreciationCollaborateur: obj.appreciationCollaborateur || '',
                appreciationResponsable: obj.appreciationResponsable || '',
                niveauAtteinte: obj.niveauAtteinte || null
            }));
        }

        // ✅ S'assurer que les objectifs futurs ont une structure correcte
        if (this.evaluation.objectifsFuturs) {
            this.evaluation.objectifsFuturs = this.evaluation.objectifsFuturs.map(obj => ({
                libelle: obj.libelle || '',
                planAction: obj.planAction || '',
                moyens: obj.moyens || '',
                indicateursSuivi: obj.indicateursSuivi || '',
                type: obj.type || 'ANNUEL'
            }));
        }

        // ✅ IMPORTANT: Convertir les faits marquants structurés en objets DTO
        if (this.evaluation.faitsMarquantsStruct) {
            this.evaluation.faitsMarquants = this.prepareFaitsMarquantsForSave();
        } else {
            this.evaluation.faitsMarquants = [];
        }

        // ✅ S'assurer que les formations ont une structure correcte
        if (this.evaluation.souhaitsFormations) {
            this.evaluation.souhaitsFormations = this.evaluation.souhaitsFormations.map(f => ({
                theme: f.theme || '',
                objectifs: f.objectifs || '',
                resultatsAttendus: f.resultatsAttendus || '',
                delaisEvaluation: f.delaisEvaluation || ''
            }));
        }

        console.log('📤 Données envoyées au backend (faits marquants):',
            this.evaluation.faitsMarquants);
        console.log('📤 Données complètes:', JSON.stringify(this.evaluation, null, 2));

        this.saving = true;
        const action = this.isEdit && this.evaluationId
            ? this.evaluationService.updateEvaluation(this.evaluationId, this.evaluation)
            : this.evaluationService.createEvaluation(this.evaluation);

        action.pipe(finalize(() => this.saving = false))
            .subscribe({
                next: (response) => {
                    console.log('✅ Réponse du backend:', response);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: this.isEdit ? 'Brouillon mis à jour' : 'Brouillon créé'
                    });

                    if (!this.isEdit) {
                        this.evaluationId = response.id;
                        this.isEdit = true;
                        this.router.navigate(['/evaluations/editer', response.id]);
                    } else {
                        this.loadEvaluation(this.evaluationId!);
                    }
                },
                error: (error) => {
                    console.error('❌ Erreur sauvegarde:', error);
                    this.handleError(error, 'sauvegarde');
                }
            });
    }

    saveAndContinue(): void {
        if (!this.validateForm()) return;

        this.saving = true;
        const action = this.isEdit && this.evaluationId
            ? this.evaluationService.updateEvaluation(this.evaluationId, this.evaluation)
            : this.evaluationService.createEvaluation(this.evaluation);

        action.pipe(finalize(() => this.saving = false))
            .subscribe({
                next: (response) => {
                    if (!this.isEdit) {
                        this.evaluationId = response.id;
                        this.isEdit = true;
                    }
                    this.nextStep();
                },
                error: (error) => this.handleError(error, 'sauvegarde')
            });
    }

    saveAndFinish(): void {
        if (!this.validateForm()) return;

        this.saving = true;
        const action = this.isEdit && this.evaluationId
            ? this.evaluationService.updateEvaluation(this.evaluationId, this.evaluation)
            : this.evaluationService.createEvaluation(this.evaluation);

        action.pipe(finalize(() => this.saving = false))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: this.isEdit ? 'Évaluation mise à jour' : 'Évaluation créée'
                    });
                    setTimeout(() => this.router.navigate(['/liste-evaluations']), 1500);
                },
                error: (error) => this.handleError(error, 'sauvegarde')
            });
    }

    // =============================================
    // WORKFLOW DE VALIDATION
    // =============================================
    soumettrePourApprobation(): void {
        if (!this.evaluationId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez d\'abord sauvegarder l\'évaluation'
            });
            return;
        }

        if (!this.estEvaluationComplete()) return;

        this.saving = true;

        this.evaluationService.soumettrePourApprobation(this.evaluationId).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Évaluation soumise à l\'approbation du collaborateur'
                });
                this.statutActuel = response.statut;
                this.saving = false;
                setTimeout(() => this.router.navigate(['/liste-evaluations']), 2000);
            },
            error: (error) => this.handleError(error, 'soumission')
        });
    }

    approuverEvaluation(): void {
        if (!this.evaluationId) return;

        this.saving = true;

        this.evaluationService.approuverEvaluation(this.evaluationId, this.evaluation.commentaireCollaborateur).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Évaluation approuvée'
                });
                this.statutActuel = response.statut;

                // Message selon le prochain validateur
                if (response.statut === 'A_VALIDER_SERVICE') {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Information',
                        detail: 'L\'évaluation a été transmise au chef de service pour validation'
                    });
                } else if (response.statut === 'A_VALIDER_DIRECTEUR') {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Information',
                        detail: 'L\'évaluation a été transmise au directeur pour validation'
                    });
                } else if (response.statut === 'VALIDEE') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Évaluation validée avec succès'
                    });
                }

                this.saving = false;
                setTimeout(() => this.router.navigate(['/liste-evaluations']), 2000);
            },
            error: (error) => this.handleError(error, 'approbation')
        });
    }

    refuserEvaluation(): void {
        if (!this.evaluationId) return;

        const motif = prompt('Motif du refus :');
        if (!motif) return;

        this.saving = true;

        this.evaluationService.refuserEvaluation(this.evaluationId, motif).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Information',
                    detail: 'Évaluation retournée pour modification'
                });
                this.statutActuel = response.statut;
                this.saving = false;
            },
            error: (error) => this.handleError(error, 'refus')
        });
    }

    validerParChefService(): void {
        if (!this.evaluationId) return;

        this.saving = true;

        this.evaluationService.validerParChefService(this.evaluationId).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Évaluation transmise au directeur'
                });
                this.statutActuel = response.statut;
                this.saving = false;
                setTimeout(() => this.router.navigate(['/liste-evaluations']), 2000);
            },
            error: (error) => this.handleError(error, 'validation')
        });
    }

    validerParDirecteur(): void {
        if (!this.evaluationId) return;

        this.saving = true;

        this.evaluationService.validerParDirecteur(this.evaluationId).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Évaluation validée définitivement'
                });
                this.statutActuel = response.statut;
                this.saving = false;
                setTimeout(() => this.router.navigate(['/liste-evaluations']), 2000);
            },
            error: (error) => this.handleError(error, 'validation')
        });
    }

    validerEvaluation(): void {
        if (!this.evaluationId) return;

        this.saving = true;
        this.evaluationService.changeStatut(this.evaluationId, 'VALIDEE')
            .pipe(finalize(() => this.saving = false))
            .subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Évaluation validée avec succès'
                    });
                    setTimeout(() => this.router.navigate(['/liste-evaluations']), 2000);
                },
                error: (error) => this.handleError(error, 'validation')
            });
    }

    retourPourModification(): void {
        if (!this.evaluationId) return;

        this.saving = true;
        this.evaluationService.retournerPourModification(this.evaluationId).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Information',
                    detail: 'Évaluation retournée pour modification'
                });
                this.statutActuel = response.statut;
                this.checkPermissions();
                this.saving = false;
            },
            error: (error) => this.handleError(error, 'retour')
        });
    }

    // =============================================
    // VALIDATIONS
    // =============================================
    private estEvaluationComplete(): boolean {
        if (!this.isEdit && !this.evaluationId) {
            return true;
        }

        if (this.statutActuel === 'BROUILLON') {
            return true;
        }

        if (!this.evaluation.objectifs?.length) {
            this.messageService.add({ severity: 'warn', summary: 'Incomplet', detail: 'Au moins un objectif est requis' });
            return false;
        }

        if (this.evaluation.objectifs.some(obj => !obj.cotation)) {
            this.messageService.add({ severity: 'warn', summary: 'Incomplet', detail: 'Tous les objectifs doivent avoir une cotation' });
            return false;
        }

        return true;
    }

    private validateForm(): boolean {
        if (!this.evaluation.collaborateurId) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Sélectionnez un collaborateur' });
            return false;
        }
        if (!this.evaluation.annee) {
            this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Sélectionnez une année' });
            return false;
        }
        return true;
    }

    private handleError(error: any, action: string): void {
        console.error(`❌ Erreur ${action}:`, error);
        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error?.message || `Erreur lors de la ${action}`
        });
    }

    // =============================================
    // UTILITAIRES
    // =============================================
    cancel(): void {
        this.router.navigate(['/liste-evaluations']);
    }

    getStatutClass(): string {
        const classes: any = {
            'BROUILLON': 'warning',
            'A_APPROUVER': 'info',
            'APPROUVEE': 'success',
            'A_VALIDER_SERVICE': 'help',
            'A_VALIDER_DIRECTEUR': 'help',
            'EN_COURS': 'info',
            'VALIDEE': 'success',
            'REFUSEE': 'danger'
        };
        return classes[this.statutActuel] || 'secondary';
    }

    getStatutLabel(): string {
        const labels: any = {
            'BROUILLON': 'Brouillon',
            'A_APPROUVER': 'À approuver',
            'APPROUVEE': 'Approuvée',
            'A_VALIDER_SERVICE': 'À valider (Service)',
            'A_VALIDER_DIRECTEUR': 'À valider (Dir.)',
            'EN_COURS': 'En cours',
            'VALIDEE': 'Validée',
            'REFUSEE': 'Refusée'
        };
        return labels[this.statutActuel] || this.statutActuel;
    }

    peutValiderDirectement(): boolean {
        return this.currentUser?.role === 'DIRECTEUR' || this.currentUser?.role === 'ADMIN';
    }

    getActionButtonText(): string {
        if (this.peutValiderDirectement() && this.statutActuel === 'BROUILLON') {
            return 'Valider directement';
        }
        if (this.currentUser?.role === 'CHEF_SERVICE' && this.statutActuel === 'BROUILLON') {
            return 'Soumettre au directeur';
        }
        return 'Continuer';
    }
}

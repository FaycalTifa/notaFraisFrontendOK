import { Component, OnInit } from '@angular/core';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { CollaborateurService } from '../../services/collaborateur/collaborateur.service';
import { AuthService } from '../../services/auth/auth.service';
// @ts-ignore
import { ActivatedRoute, Router } from '@angular/router';
import {ConfirmationService, MessageService } from 'primeng/api';
import {Evaluation, EvaluationRequest, FaitMarquant, } from '../../models/entities/evaluation';
import { finalize, takeUntil } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { DialogService } from 'primeng/dynamicdialog';
import { AnnulationDialogComponent } from '../annulation-dialog/annulation-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { AnneeExerciceService } from '../../services/anneeExercice/annee-exercice.service';

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

    refusSubmitted: boolean = false;

    showRefusDialog: boolean = false;
    refusMotif: string = '';
    showRefusDetails: boolean = false;
    refusInfo: any = null;
    // Permissions
    canEdit: boolean = false;
    canSubmit: boolean = false;
    canValidate: boolean = false;
    canApprove: boolean = false;
    canRefuse: boolean = false;

    annees: any[] = []; // ✅ Liste des années depuis le service

    evaluateurSignature: string ;
    collaborateurSignature: string;
    showEvaluateurSignatureDialog: boolean = false;
    showCollaborateurSignatureDialog: boolean = false;
    motifAnnulation: string = '';
    defaultSignature: string = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

    // Propriétés pour les dialogues
    showSignatureDialog: boolean = false;
    selectedSignature: string = '';
    signatureDialogTitle: string = '';

    evaluateurSignatureImage: string = this.defaultSignature;
    collaborateurSignatureImage: string = this.defaultSignature;

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
        private confirmationService: ConfirmationService,
        private dialogService: DialogService,
        private anneeExerciceService: AnneeExerciceService,
        private http: HttpClient
    ) {
        this.currentUser = this.authService.getCurrentUser();
    }

    // =============================================
    // INITIALISATION
    // =============================================
    ngOnInit(): void {
        console.log('=== DÉBOGAGE INIT ===');

        this.loadCollaborateurs();
        this.loadAnnees();

        // ÉTAPE 1: Vérifier les paramètres de route pour l'édition
        const routeId = this.route.snapshot.params['id'];
        const queryCollaborateurId = this.route.snapshot.queryParams['collaborateurId'];

        console.log('Route params (id):', routeId);
        console.log('Query params (collaborateurId):', queryCollaborateurId);

        // CAS 1: ÉDITION d'une évaluation existante
        if (routeId && !isNaN(+routeId)) {
            console.log('📝 CAS 1: Édition évaluation ID:', routeId);
            this.isEdit = true;
            this.evaluationId = +routeId;
            this.loadEvaluation(this.evaluationId);
            return; // IMPORTANT: On arrête ici pour l'édition
        }

        // CAS 2: NOUVELLE ÉVALUATION avec collaborateur pré-sélectionné
        if (queryCollaborateurId && !isNaN(+queryCollaborateurId)) {
            console.log('➕ CAS 2: Nouvelle évaluation pour collaborateur:', queryCollaborateurId);
            this.evaluation.collaborateurId = +queryCollaborateurId;
            this.isEdit = false;
            this.activeStep = 0;
            this.canEdit = true;
            this.canSubmit = false;
            this.canValidate = false;
            this.canApprove = false;
            this.canRefuse = false;
            this.statutActuel = 'BROUILLON';
            return;
        }

        // CAS 3: NOUVELLE ÉVALUATION sans collaborateur pré-sélectionné
        console.log('➕ CAS 3: Nouvelle évaluation sans collaborateur');
        this.isEdit = false;
        this.activeStep = 0;
        this.canEdit = true;
        this.canSubmit = false;
        this.canValidate = false;
        this.canApprove = false;
        this.canRefuse = false;
        this.statutActuel = 'BROUILLON';
    }

    // Dans le composant
    isSignatureEnabled(type: 'responsable' | 'collaborateur'): boolean {
        if (type === 'responsable') {
            // Le responsable peut signer si :
            // 1. Il est l'évaluateur
            // 2. Il n'a pas encore signé
            // 3. Le statut est BROUILLON
            return this.isCurrentUserEvaluateur() &&
                !this.evaluationComplete?.signatureResponsable &&
                this.statutActuel === 'BROUILLON';
        } else {
            // Le collaborateur peut signer si :
            // 1. Il est le collaborateur évalué
            // 2. Il n'a pas encore signé
            // 3. Le statut est A_APPROUVER
            return this.isCurrentUserCollaborateur() &&
                !this.evaluationComplete?.signatureCollaborateur &&
                this.statutActuel === 'A_APPROUVER';
        }
    }


    // =============================================
    // CHARGEMENT DES ANNÉES
    // =============================================
    // Dans formulaire-evaluation.component.ts
    loadAnnees(): void {
        this.anneeExerciceService.getAllAnnees().subscribe({
            next: (data) => {
                console.log('📅 Données brutes du service:', data);

                // Transformer les données en options pour le dropdown
                this.annees = data.map(a => ({
                    label: a.annee.toString(),  // ✅ 'label' doit exister
                    value: a.annee,              // ✅ 'value' doit exister
                    isActived: a.isActived,
                    labelWithStatus: a.isActived ?
                        a.annee.toString() :
                        a.annee.toString() + ' (Inactive)'
                })).sort((a, b) => b.value - a.value);

                console.log('📅 Options transformées:', this.annees);
                console.log('📅 Nombre d\'années:', this.annees.length);

                if (this.annees.length === 0) {
                    console.warn('⚠️ Aucune année trouvée dans le service');
                }
            },
            error: (error) => {
                console.error('❌ Erreur chargement années:', error);
                this.annees = [];
            }
        });
    }
    // Années par défaut en cas d'erreur
    getAnneesParDefaut(): any[] {
        const anneeCourante = new Date().getFullYear();
        return [
            { label: (anneeCourante - 2).toString(), value: anneeCourante - 2 },
            { label: (anneeCourante - 1).toString(), value: anneeCourante - 1 },
            { label: anneeCourante.toString(), value: anneeCourante },
            { label: (anneeCourante + 1).toString(), value: anneeCourante + 1 }
        ];
    }

    // Dans le composant
    onImageError(event: any): void {
        console.error('❌ Erreur de chargement d\'image:', event);
        const img = event.target;

        // Sauvegarder l'URL qui a échoué pour déboguer
        const failedUrl = img.src;
        console.log('URL qui a échoué:', failedUrl?.substring(0, 100));

        // Remplacer par la signature par défaut
        img.src = this.defaultSignature;
        img.classList.add('signature-error');

        // Ajouter un tooltip pour indiquer l'erreur
        img.setAttribute('title', 'Signature non disponible');

        // Éviter les boucles infinies
        img.onerror = null;
    }

    // Ouvrir le dialogue de signature
    openSignatureDialog(signature: string, nom: string): void {
        this.selectedSignature = signature;
        this.signatureDialogTitle = `Signature de ${nom}`;
        this.showSignatureDialog = true;
    }


    getSafeSignature(signature: string): string {
        if (!signature) return this.defaultSignature;

        try {
            // Nettoyer l'URL
            let cleanSignature = signature.trim();

            // Enlever le préfixe 'unsafe:' s'il existe
            if (cleanSignature.startsWith('unsafe:')) {
                cleanSignature = cleanSignature.replace('unsafe:', '');
            }

            // Vérifier que c'est une data URL valide
            if (cleanSignature.startsWith('data:image')) {
                return cleanSignature;
            }

            // Si ce n'est pas une data URL, c'est peut-être une URL relative
            if (cleanSignature.startsWith('/') || cleanSignature.startsWith('http')) {
                return cleanSignature;
            }

            console.warn('Format de signature non reconnu:', cleanSignature.substring(0, 50));
            return this.defaultSignature;
        } catch (error) {
            console.error('Erreur traitement signature:', error);
            return this.defaultSignature;
        }
    }


// Vérifier si l'utilisateur connecté est l'évaluateur
    isCurrentUserEvaluateur(): boolean {
        return this.currentUser?.id === this.evaluationComplete?.evaluateur?.id;
    }

// Vérifier si l'utilisateur connecté est le collaborateur évalué
    isCurrentUserCollaborateur(): boolean {
        return this.currentUser?.id === this.evaluationComplete?.collaborateur?.id;
    }

// Vérifier si l'utilisateur peut signer en tant qu'évaluateur
    canSignAsEvaluateur(): boolean {
        // Vérifications
        const isEvaluateur = this.isCurrentUserEvaluateur();
        const bonStatut = this.statutActuel === 'BROUILLON';
        const signatureNonApposee = !this.isResponsableSigned();

        // LOG POUR DÉBOGUER
        console.log('🔍 canSignAsEvaluateur:', {
            isEvaluateur,
            bonStatut,
            signatureNonApposee,
            statutActuel: this.statutActuel,
            evaluateurId: this.evaluationComplete?.evaluateur?.id,
            currentUserId: this.currentUser?.id,
            signatureBoolean: this.evaluationComplete?.signatureResponsableBoolean
        });

        return isEvaluateur && bonStatut && signatureNonApposee;
    }

    canSignAsCollaborateur(): boolean {
        // Vérifications
        const isCollaborateur = this.isCurrentUserCollaborateur();
        const bonStatut = this.statutActuel === 'A_APPROUVER';
        const signatureNonApposee = !this.isCollaborateurSigned();

        // LOG POUR DÉBOGUER
        console.log('🔍 canSignAsCollaborateur:', {
            isCollaborateur,
            bonStatut,
            signatureNonApposee,
            statutActuel: this.statutActuel,
            collaborateurId: this.evaluationComplete?.collaborateur?.id,
            currentUserId: this.currentUser?.id,
            signatureBoolean: this.evaluationComplete?.signatureCollaborateurBoolean
        });

        return isCollaborateur && bonStatut && signatureNonApposee;
    }   // Méthode pour ouvrir le dialogue de refus
    ouvrirDialogueRefus(): void {
        this.refusMotif = '';
        this.showRefusDialog = true;
    }

// Méthode pour confirmer le refus
    confirmerRefus(): void {
        this.refusSubmitted = true;

        if (!this.refusMotif || this.refusMotif.trim() === '') {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez saisir le motif du refus'
            });
            return;
        }

        this.showRefusDialog = false;
        this.saving = true;

        this.evaluationService.refuserEvaluation(this.evaluationId!, this.refusMotif).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Évaluation refusée. Le motif a été enregistré.'
                });
                this.statutActuel = response.statut;
                this.evaluationComplete = response;
                this.saving = false;
                this.refusSubmitted = false;
                this.loadEvaluation(this.evaluationId!);
            },
            error: (error) => {
                console.error('Erreur refus:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de refuser l\'évaluation'
                });
                this.saving = false;
                this.refusSubmitted = false;
            }
        });
    }

    annulerRefus(): void {
        this.showRefusDialog = false;
        this.refusMotif = '';
        this.refusSubmitted = false;
    }

    getSignatureDate(evaluation: any): string {
        if (evaluation?.dateValidation) {
            // Formater la date
            const date = new Date(evaluation.dateValidation);
            return date.toLocaleDateString('fr-FR');
        }
        return 'date inconnue';
    }


// Dans la méthode signerEvaluation, ajouter une vérification

    // Dans formulaire-evaluation.component.ts

    signerEvaluation(type: 'responsable' | 'collaborateur'): void {
        if (!this.evaluationId) return;

        // Vérifier que l'utilisateur a le droit de signer
        if (type === 'responsable' && !this.canSignAsEvaluateur()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Vous n\'êtes pas autorisé à signer en tant que responsable'
            });
            return;
        }

        if (type === 'collaborateur' && !this.canSignAsCollaborateur()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Vous n\'êtes pas autorisé à signer en tant que collaborateur'
            });
            return;
        }

        this.saving = true;
        const isResponsable = type === 'responsable';

        this.messageService.add({
            severity: 'info',
            summary: 'Confirmation',
            detail: 'Apposition de votre signature en cours...'
        });

        this.evaluationService.signerEvaluation(this.evaluationId, isResponsable)
            .subscribe({
                next: (response) => {
                    console.log('✅ Signature enregistrée:', response);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: `Votre signature a été apposée avec succès`
                    });

                    // Mettre à jour l'évaluation complète
                    this.evaluationComplete = response;
                    this.statutActuel = response.statut;

                    // Mettre à jour les booléens localement
                    if (isResponsable) {
                        this.evaluationComplete.signatureResponsableBoolean = true;
                    } else {
                        this.evaluationComplete.signatureCollaborateurBoolean = true;
                    }

                    this.saving = false;
                },
                error: (error) => {
                    console.error('❌ Erreur signature:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Impossible d\'apposer votre signature'
                    });
                    this.saving = false;
                }
            });
    }

// Méthodes simplifiées pour vérifier les signatures
    isResponsableSigned(): boolean {
        return !!this.evaluationComplete?.signatureResponsableBoolean;
    }

    isCollaborateurSigned(): boolean {
        return !!this.evaluationComplete?.signatureCollaborateurBoolean;
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

                    // ✅ CHARGER LES SIGNATURES DEPUIS LA TABLE COLLABORATEUR
                    this.loadSignaturesFromCollaborateurs();

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

// ✅ Nouvelle méthode pour charger les signatures
    loadSignaturesFromCollaborateurs(): void {
        const evaluateurId = this.evaluationComplete?.evaluateurId || this.evaluationComplete?.evaluateur?.id;
        const collaborateurId = this.evaluationComplete?.collaborateurId || this.evaluationComplete?.collaborateur?.id;

        console.log('🔍 Chargement des signatures depuis la table collaborateur:', { evaluateurId, collaborateurId });

        // Charger signature du responsable (évaluateur)
        if (evaluateurId) {
            this.collaborateurService.getCollaborateurSignature(evaluateurId).subscribe({
                next: (signature) => {
                    console.log('✅ Signature responsable reçue:', signature ? 'Présente' : 'Vide');
                    this.evaluateurSignatureImage = this.getSafeSignature(signature);
                },
                error: (err) => {
                    console.error('❌ Erreur chargement signature responsable:', err);
                    this.evaluateurSignatureImage = this.defaultSignature;
                }
            });
        } else {
            this.evaluateurSignatureImage = this.defaultSignature;
        }

        // Charger signature du collaborateur (évalué)
        if (collaborateurId) {
            this.collaborateurService.getCollaborateurSignature(collaborateurId).subscribe({
                next: (signature) => {
                    console.log('✅ Signature collaborateur reçue:', signature ? 'Présente' : 'Vide');
                    this.collaborateurSignatureImage = this.getSafeSignature(signature);
                },
                error: (err) => {
                    console.error('❌ Erreur chargement signature collaborateur:', err);
                    this.collaborateurSignatureImage = this.defaultSignature;
                }
            });
        } else {
            this.collaborateurSignatureImage = this.defaultSignature;
        }
    }
    // Charger la signature d'un collaborateur

    // Charger la signature d'un collaborateur
    // Dans formulaire-evaluation.component.ts

// Charger la signature d'un collaborateur
    loadCollaborateurSignature(collaborateurId: number, type: 'evaluateur' | 'collaborateur'): void {
        console.log(`📡 Chargement signature ${type} pour ID:`, collaborateurId);

        this.collaborateurService.getCollaborateurById(collaborateurId).subscribe({
            next: (collab) => {
                console.log(`✅ Données collaborateur ${type} reçues:`, collab);
                console.log(`   Signature brute:`, collab.signature ? collab.signature.substring(0, 100) + '...' : 'Aucune');

                // Nettoyer la signature
                const signature = this.getSafeSignature(collab.signature);

                if (type === 'evaluateur') {
                    this.evaluateurSignature = signature;
                    console.log('✅ Signature évaluateur:', signature !== this.defaultSignature ? 'Valide' : 'Défaut');
                } else {
                    this.collaborateurSignature = signature;
                    console.log('✅ Signature collaborateur:', signature !== this.defaultSignature ? 'Valide' : 'Défaut');
                }
            },
            error: (error) => {
                console.error(`❌ Erreur chargement signature ${type}:`, error);
                if (type === 'evaluateur') {
                    this.evaluateurSignature = this.defaultSignature;
                } else {
                    this.collaborateurSignature = this.defaultSignature;
                }
            }
        });
    }
// Valider et nettoyer une signature
    validateAndCleanSignature(signature: string): string {
        if (!signature) return '';

        try {
            // Nettoyer la signature des caractères problématiques
            let cleanSignature = signature.trim();

            // Vérifier que c'est une data URL valide
            if (!cleanSignature.startsWith('data:image')) {
                console.warn('⚠️ Signature invalide (ne commence pas par data:image):', cleanSignature.substring(0, 30));

                // Essayer de corriger le format
                if (cleanSignature.includes('base64') && cleanSignature.includes('png')) {
                    cleanSignature = 'data:image/png;base64,' + cleanSignature.replace(/^.*base64,?/, '');
                } else {
                    return '';
                }
            }

            // Vérifier qu'il n'y a pas d'espaces ou de caractères spéciaux dans la partie base64
            const base64Part = cleanSignature.split(',')[1];
            if (base64Part && /[^A-Za-z0-9+/=]/.test(base64Part)) {
                console.warn('⚠️ Signature contient des caractères invalides dans la partie base64');
                // Nettoyer les caractères invalides
                const cleanBase64 = base64Part.replace(/[^A-Za-z0-9+/=]/g, '');
                cleanSignature = 'data:image/png;base64,' + cleanBase64;
            }

            return cleanSignature;
        } catch (error) {
            console.error('❌ Erreur validation signature:', error);
            return '';
        }
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

    /*retourPourModification(): void {
        if (!this.evaluationId) return;

        this.saving = true;
        this.evaluationService.retournerPourModification(this.evaluationId, motif).subscribe({
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
    }*/

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
            'REFUSEE': 'danger',
            'ANNULEE': 'secondary'

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
            'REFUSEE': 'Refusée',
            'ANNULEE': 'Annulée'
        };
        return labels[this.statutActuel] || this.statutActuel;
    }

    peutValiderDirectement(): boolean {
        return this.currentUser?.role === 'DIRECTEUR' || this.currentUser?.role === 'ADMIN';
    }

    // Propriété pour stocker le motif d'annulation


    /**
     * Vérifier si l'utilisateur peut annuler
     */
    peutAnnuler(): boolean {
        const user = this.currentUser;

        // ADMIN peut toujours annuler
        if (user?.role === 'ADMIN') {
            return true;
        }

        // DIRECTEUR peut annuler seulement avant validation
        if (user?.role === 'DIRECTEUR') {
            return this.statutActuel !== 'VALIDEE' && this.statutActuel !== 'ANNULEE';
        }

        return false;
    }

    /**
     * Ouvrir le dialogue d'annulation
     */
    openAnnulationDialog(): void {
        const ref = this.dialogService.open(AnnulationDialogComponent, {
            header: 'Annulation de l\'évaluation',
            width: '500px',
            data: {
                titre: 'Motif d\'annulation',
                placeholder: 'Expliquez pourquoi vous annulez cette évaluation...',
                actionLabel: 'Annuler définitivement',
                afficherCommentaire: this.currentUser?.role === 'ADMIN'
            }
        });

        ref.onClose.subscribe((result: any) => {
            if (result?.motif) {
                this.confirmerAnnulation(result.motif, result.commentaire);
            }
        });
    }

    /**
     * Confirmer l'annulation
     */
    confirmerAnnulation(motif: string, commentaire?: string): void {
        if (!this.evaluationId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune évaluation sélectionnée'
            });
            return;
        }

        this.saving = true;

        this.evaluationService.annulerEvaluation(this.evaluationId, motif).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Évaluation annulée avec succès'
                });

                this.statutActuel = response.statut;
                this.evaluationComplete = response;
                this.saving = false;

                setTimeout(() => this.router.navigate(['/liste-evaluations']), 2000);
            },
            error: (error) => {
                console.error('❌ Erreur annulation:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors de l\'annulation'
                });
                this.saving = false;
            }
        });
    }

    /**
     * Ouvrir le dialogue de retour pour modification
     */
    openRetourDialog(): void {
        const ref = this.dialogService.open(AnnulationDialogComponent, {
            header: 'Retour pour modification',
            width: '500px',
            data: {
                titre: 'Motif du retour',
                placeholder: 'Expliquez ce qui doit être modifié...',
                actionLabel: 'Retourner',
                afficherCommentaire: true
            }
        });

        ref.onClose.subscribe((result: any) => {
            // ✅ Le motif vient du résultat du dialogue
            if (result?.motif) {
                this.confirmerRetour(result.motif); // ← ICI, result.motif est passé
            }
        });
    }

    /**
     * Confirmer le retour pour modification
     */
    /**
     * Confirmer le retour pour modification
     */
    confirmerRetour(motif: string): void { // ← motif est reçu en paramètre
        if (!this.evaluationId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Aucune évaluation sélectionnée'
            });
            return;
        }

        this.saving = true;

        // ✅ Utiliser le motif reçu en paramètre
        this.evaluationService.retournerPourModification(this.evaluationId, motif).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'info',
                    summary: 'Information',
                    detail: 'Évaluation retournée pour modification'
                });

                this.statutActuel = response.statut;
                this.evaluationComplete = response;
                this.saving = false;
                this.checkPermissions();

                setTimeout(() => this.router.navigate(['/evaluations/editer', this.evaluationId]), 1500);
            },
            error: (error) => {
                console.error('❌ Erreur retour:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: error.error?.message || 'Erreur lors du retour'
                });
                this.saving = false;
            }
        });
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

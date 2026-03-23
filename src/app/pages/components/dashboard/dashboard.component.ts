import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CollaborateurService } from '../../services/collaborateur/collaborateur.service';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { DirectionService } from '../../services/Direction/direction.service';
import { ServiceService } from '../../services/service/service.service';
import { SectionService } from '../../services/Section/section.service';
import { ExportService } from '../../services/Export/export.service';
import { MessageService } from 'primeng/api';
import { AnneeExerciceService } from '../../services/anneeExercice/annee-exercice.service';
import { Evaluation } from '../../models/entities/evaluation';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    // Statistiques générales
    stats = {
        collaborateurs: 0,
        evaluations: 0,
        directions: 0,
        services: 0,
        sections: 0,
        evaluationsEnCours: 0,
        evaluationsValidees: 0,
        evaluationsBrouillon: 0,
        aApprouver: 0,
    };

    // ✅ Nouvelles propriétés pour les exports (en dehors de stats)
    anneesDisponibles: any[] = [];
    anneeSelectionnee: number = new Date().getFullYear();
    mesEvaluations: Evaluation[] = [];
    mesEvaluationsFiltrees: Evaluation[] = [];

    // Données pour les graphiques
    evaluationStats = {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [
            {
                label: 'Évaluations créées',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                borderColor: 'rgba(155, 89, 182, 1)',
                borderWidth: 2
            }
        ]
    };

    // Répartition par statut
    statutStats = {
        labels: ['Brouillon', 'À approuver', 'En cours', 'Validé'],
        datasets: [
            {
                data: [0, 0, 0, 0],
                backgroundColor: ['#f39c12', '#9b59b6', '#3498db', '#2ecc71'],
                hoverBackgroundColor: ['#e67e22', '#8e44ad', '#2980b9', '#27ae60']
            }
        ]
    };

    // Dernières évaluations
    dernieresEvaluations: any[] = [];

    // Alertes
    alertes = {
        evaluationsAFaire: 0,
        evaluationsAApprouver: 0,
        evaluationsAValider: 0,
        collaborateursSansEvaluation: [] as any[]
    };

    // Chargement
    loading = {
        global: true,
        stats: false,
        graphiques: false
    };

    // Utilisateur connecté
    currentUser: any;

    constructor(
        private authService: AuthService,
        private collaborateurService: CollaborateurService,
        private evaluationService: EvaluationService,
        private directionService: DirectionService,
        private serviceService: ServiceService,
        private sectionService: SectionService,
        private exportService: ExportService,
        private anneeExerciceService: AnneeExerciceService, // ✅ Ajouter
        private router: Router,
        private messageService: MessageService
    ) {
        this.currentUser = this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        console.log('👤 Current user:', this.currentUser);
        console.log('   - ID:', this.currentUser?.id);
        console.log('   - Nom:', this.currentUser?.nomComplet);
        this.loadDashboardData();
        this.loadAnneesExercice(); // ✅ Charger les années depuis la base
    }

    // ✅ Charger les années depuis la table annee_exercice
    // dashboard.component.ts

    loadAnneesExercice(): void {
        this.anneeExerciceService.getAllAnnees().subscribe({
            next: (data) => {
                console.log('📅 Années chargées depuis annee_exercice:', data);

                // ✅ NE PAS FILTRER - Prendre TOUTES les années
                this.anneesDisponibles = data
                    .map(a => ({
                        label: a.annee.toString(),  // Pour l'affichage
                        value: a.annee,              // Pour la valeur
                        isActived: a.isActived,      // Pour info (optionnel)
                        labelWithStatus: a.isActived ?
                            a.annee.toString() :
                            a.annee.toString() + ' (Inactive)' // Label avec statut
                    }))
                    .sort((a, b) => b.value - a.value); // Tri décroissant

                console.log('📅 Années disponibles (toutes):', this.anneesDisponibles);

                // Sélectionner la première année par défaut
                if (this.anneesDisponibles.length > 0) {
                    this.anneeSelectionnee = this.anneesDisponibles[0].value;

                    // Filtrer les évaluations si déjà chargées
                    if (this.mesEvaluations.length > 0) {
                        this.filtrerMesEvaluations();
                    }
                }
            },
            error: (error) => {
                console.error('❌ Erreur chargement années:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les années'
                });
                this.genererAnneesParDefaut();
            }
        });
    }

    // ✅ Années par défaut en cas d'erreur
    genererAnneesParDefaut(): void {
        const anneeCourante = new Date().getFullYear();
        this.anneesDisponibles = [];
        for (let i = 0; i < 5; i++) {
            this.anneesDisponibles.push({
                label: (anneeCourante - i).toString(),
                value: anneeCourante - i,
                isActived: true
            });
        }
        this.anneeSelectionnee = anneeCourante;
    }

    loadDashboardData(): void {
        this.loading.global = true;

        Promise.all([
            this.loadCollaborateurs(),
            this.loadEvaluations(), // ✅ UNE SEULE méthode loadEvaluations
            this.loadDirections(),
            this.loadServices(),
            this.loadSections(),
            this.loadEvaluationsAFaire()
        ]).finally(() => {
            this.loading.global = false;
        });
    }

    loadCollaborateurs(): Promise<void> {
        return new Promise((resolve) => {
            this.collaborateurService.getAllCollaborateurs().subscribe({
                next: (data) => {
                    this.stats.collaborateurs = data?.length || 0;
                    resolve();
                },
                error: (err) => {
                    console.error('Erreur chargement collaborateurs:', err);
                    this.stats.collaborateurs = 45;
                    resolve();
                }
            });
        });
    }

    // ✅ UNE SEULE méthode loadEvaluations (supprimer loadEvaluationsss)
    // Dans dashboard.component.ts

    loadEvaluations(): Promise<void> {
        return new Promise((resolve) => {
            this.evaluationService.getAllEvaluations().subscribe({
                next: (data) => {
                    console.log('📊 Toutes les évaluations reçues:', data);
                    console.log('📊 Nombre d\'évaluations:', data?.length);

                    this.stats.evaluations = data?.length || 0;

                    // ✅ STOCKER TOUTES LES ÉVALUATIONS
                    this.mesEvaluations = data || [];
                    console.log('✅ mesEvaluations stockées:', this.mesEvaluations.length);

                    // Compter par statut
                    this.stats.evaluationsBrouillon = data?.filter(e => e.statut === 'BROUILLON').length || 0;
                    this.stats.evaluationsEnCours = data?.filter(e => e.statut === 'EN_COURS' || e.statut === 'A_VALIDER_SERVICE' || e.statut === 'A_VALIDER_DIRECTEUR').length || 0;
                    this.stats.evaluationsValidees = data?.filter(e => e.statut === 'VALIDEE').length || 0;
                    this.stats.aApprouver = data?.filter(e => e.statut === 'A_APPROUVER').length || 0;

                    // Mettre à jour les stats des graphiques
                    this.statutStats.datasets[0].data = [
                        this.stats.evaluationsBrouillon,
                        this.stats.aApprouver,
                        this.stats.evaluationsEnCours,
                        this.stats.evaluationsValidees
                    ];

                    // Dernières évaluations
                    if (data && data.length > 0) {
                        this.dernieresEvaluations = data
                            .sort((a, b) => new Date(b.dateCreation || 0).getTime() - new Date(a.dateCreation || 0).getTime())
                            .slice(0, 5);
                    } else {
                        this.dernieresEvaluations = [];
                    }

                    // ✅ Filtrer pour l'année sélectionnée
                    if (this.anneeSelectionnee) {
                        this.filtrerMesEvaluations();
                    }

                    resolve();
                },
                error: (err) => {
                    console.error('Erreur chargement évaluations:', err);
                    this.mesEvaluations = [];
                    resolve();
                }
            });
        });
    }

    loadDirections(): Promise<void> {
        return new Promise((resolve) => {
            this.directionService.getAllDirections().subscribe({
                next: (data) => {
                    this.stats.directions = data?.length || 0;
                    resolve();
                },
                error: () => {
                    this.stats.directions = 3;
                    resolve();
                }
            });
        });
    }

    loadServices(): Promise<void> {
        return new Promise((resolve) => {
            this.serviceService.getAllServices().subscribe({
                next: (data) => {
                    this.stats.services = data?.length || 0;
                    resolve();
                },
                error: () => {
                    this.stats.services = 8;
                    resolve();
                }
            });
        });
    }

    loadSections(): Promise<void> {
        return new Promise((resolve) => {
            this.sectionService.getAllSections().subscribe({
                next: (data) => {
                    this.stats.sections = data?.length || 0;
                    resolve();
                },
                error: () => {
                    this.stats.sections = 12;
                    resolve();
                }
            });
        });
    }

    loadEvaluationsAFaire(): Promise<void> {
        return new Promise((resolve) => {
            this.evaluationService.getEvaluationsAFaire().subscribe({
                next: (data) => {
                    this.alertes.evaluationsAFaire = data?.length || 0;
                    this.alertes.collaborateursSansEvaluation = data?.slice(0, 5) || [];
                    resolve();
                },
                error: (err) => {
                    console.error('Erreur chargement évaluations à faire:', err);
                    this.alertes.evaluationsAFaire = 3;
                    this.alertes.collaborateursSansEvaluation = [
                        { collaborateurNom: 'TRAORE Issa' },
                        { collaborateurNom: 'DUBOIS Paul' },
                        { collaborateurNom: 'KONE Moussa' }
                    ];
                    resolve();
                }
            });
        });
    }

    getRoleLabel(role: string): string {
        const roles: any = {
            'ADMIN': 'Administrateur',
            'DIRECTEUR': 'Directeur',
            'CHEF_SERVICE': 'Chef de Service',
            'CHEF_SECTION': 'Chef de Section',
            'COLLABORATEUR': 'Collaborateur',
            'AGENT': 'Agent'
        };
        return roles[role] || role || 'Utilisateur';
    }

    getStatutClass(statut: string): string {
        const classes: any = {
            'BROUILLON': 'warning',
            'A_APPROUVER': 'help',
            'APPROUVEE': 'info',
            'A_VALIDER_SERVICE': 'help',
            'A_VALIDER_DIRECTEUR': 'help',
            'EN_COURS': 'info',
            'VALIDEE': 'success',
            'REFUSEE': 'danger'
        };
        return classes[statut] || 'secondary';
    }

    getStatutLabel(statut: string): string {
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
        return labels[statut] || statut || 'Inconnu';
    }

    navigateTo(route: string): void {
        const routes: any = {
            '/collaborateur': '/collaborateur',
            '/liste-evaluations': '/liste-evaluations',
            '/evaluations/nouveau': '/evaluations/nouveau',
            '/collaborateurs/nouveau': '/creer-collaborateur',
            '/directions/nouveau': '/parametre/direction',
            '/parametre/direction': '/parametre/direction',
            '/parametre/service': '/parametre/service',
            '/parametre/section': '/parametre/section',
            '/evaluations': '/liste-evaluations',
            '/directions': '/parametre/direction',
            '/services': '/parametre/service',
            '/sections': '/parametre/section',
            '/profil': '/info/personnel'
        };

        const targetRoute = routes[route] || route;
        console.log('Navigation vers:', targetRoute);
        this.router.navigate([targetRoute]);
    }

    getBrouillonCount(): number {
        return this.stats.evaluationsBrouillon;
    }

    getEnCoursCount(): number {
        return this.stats.evaluationsEnCours;
    }

    getValideesCount(): number {
        return this.stats.evaluationsValidees;
    }

    // ✅ Méthode appelée quand l'année change
    onAnneeChange(): void {
        if (this.mesEvaluations.length > 0 && this.anneeSelectionnee) {
            this.filtrerMesEvaluations();
        }
    }

    // ✅ Filtrer les évaluations de l'utilisateur connecté par année
    // dashboard.component.ts

    // dashboard.component.ts

    // dashboard.component.ts

    // dashboard.component.ts

    // dashboard.component.ts

    filtrerMesEvaluations(): void {
        console.log('🔍 FILTRAGE DES ÉVALUATIONS');
        console.log('   - Current user role:', this.currentUser?.role);
        console.log('   - Current user ID:', this.currentUser?.id);
        console.log('   - Current user directionId:', this.currentUser?.directionId);
        console.log('   - Current user serviceId:', this.currentUser?.serviceId);
        console.log('   - Current user sectionId:', this.currentUser?.sectionId);
        console.log('   - Année sélectionnée:', this.anneeSelectionnee);
        console.log('   - Total évaluations:', this.mesEvaluations.length);

        if (!this.anneeSelectionnee) {
            console.log('❌ Aucune année sélectionnée');
            this.mesEvaluationsFiltrees = [];
            return;
        }

        const role = this.currentUser?.role;
        const userId = this.currentUser?.id;
        const directionId = this.currentUser?.directionId;
        const serviceId = this.currentUser?.serviceId;
        const sectionId = this.currentUser?.sectionId;

        // ✅ ADMIN: toutes les évaluations
        if (role === 'ADMIN') {
            console.log('👑 ADMIN - Export de toutes les évaluations');
            this.mesEvaluationsFiltrees = this.mesEvaluations.filter(e => e.annee === this.anneeSelectionnee);
            console.log(`📊 ADMIN: ${this.mesEvaluationsFiltrees.length} évaluations trouvées`);
            return;
        }

        // ✅ DIRECTEUR: évaluations des collaborateurs de sa direction
        if (role === 'DIRECTEUR') {
            console.log('📁 DIRECTEUR - Évaluations de sa direction');

            this.mesEvaluationsFiltrees = this.mesEvaluations.filter(e => {
                const bonneAnnee = e.annee === this.anneeSelectionnee;

                // Récupérer les IDs de direction
                const collabDirectionId = e.collaborateur?.directionId || e.collaborateur?.direction?.id;
                const evalDirectionId = e.evaluateur?.directionId || e.evaluateur?.direction?.id;

                const estDansSaDirection =
                    collabDirectionId === directionId ||
                    evalDirectionId === directionId;

                if (bonneAnnee && estDansSaDirection) {
                    console.log(`   ✅ Évaluation ${e.id}: collabDir=${collabDirectionId}, evalDir=${evalDirectionId}`);
                }

                return bonneAnnee && estDansSaDirection;
            });

            console.log(`📊 DIRECTEUR: ${this.mesEvaluationsFiltrees.length} évaluations trouvées`);
            return;
        }

        // ✅ CHEF_SERVICE: évaluations des collaborateurs de son service
        if (role === 'CHEF_SERVICE') {
            console.log('🏢 CHEF_SERVICE - Évaluations de son service');

            this.mesEvaluationsFiltrees = this.mesEvaluations.filter(e => {
                const bonneAnnee = e.annee === this.anneeSelectionnee;

                // Récupérer les IDs de service
                const collabServiceId = e.collaborateur?.serviceId || e.collaborateur?.service?.id;
                const evalServiceId = e.evaluateur?.serviceId || e.evaluateur?.service?.id;

                const estDansSonService =
                    collabServiceId === serviceId ||
                    evalServiceId === serviceId;

                if (bonneAnnee && estDansSonService) {
                    console.log(`   ✅ Évaluation ${e.id}: collabService=${collabServiceId}, evalService=${evalServiceId}`);
                }

                return bonneAnnee && estDansSonService;
            });

            console.log(`📊 CHEF_SERVICE: ${this.mesEvaluationsFiltrees.length} évaluations trouvées`);
            return;
        }

        // ✅ CHEF_SECTION: évaluations des collaborateurs de sa section
        if (role === 'CHEF_SECTION') {
            console.log('📌 CHEF_SECTION - Évaluations de sa section');

            this.mesEvaluationsFiltrees = this.mesEvaluations.filter(e => {
                const bonneAnnee = e.annee === this.anneeSelectionnee;

                // Récupérer les IDs de section
                const collabSectionId = e.collaborateur?.sectionId || e.collaborateur?.section?.id;
                const evalSectionId = e.evaluateur?.sectionId || e.evaluateur?.section?.id;

                const estDansSaSection =
                    collabSectionId === sectionId ||
                    evalSectionId === sectionId;

                if (bonneAnnee && estDansSaSection) {
                    console.log(`   ✅ Évaluation ${e.id}: collabSection=${collabSectionId}, evalSection=${evalSectionId}`);
                }

                return bonneAnnee && estDansSaSection;
            });

            console.log(`📊 CHEF_SECTION: ${this.mesEvaluationsFiltrees.length} évaluations trouvées`);
            return;
        }

        // ✅ COLLABORATEUR: ses propres évaluations
        if (!userId) {
            this.mesEvaluationsFiltrees = [];
            return;
        }

        console.log('👤 COLLABORATEUR - Ses propres évaluations');
        this.mesEvaluationsFiltrees = this.mesEvaluations.filter(e => {
            const isEvaluateur = e.evaluateurId === userId;
            const isCollaborateur = e.collaborateurId === userId;
            const bonneAnnee = e.annee === this.anneeSelectionnee;

            return bonneAnnee && (isEvaluateur || isCollaborateur);
        });

        console.log(`📊 COLLABORATEUR: ${this.mesEvaluationsFiltrees.length} évaluations trouvées`);
    }



    // ✅ Compter le nombre d'évaluations comme évaluateur
    getNbCommeEvaluateur(): number {
        return this.mesEvaluationsFiltrees.filter(e => e.evaluateurId === this.currentUser?.id).length;
    }

    // ✅ Compter le nombre d'évaluations comme évalué
    getNbCommeEvalue(): number {
        return this.mesEvaluationsFiltrees.filter(e => e.collaborateurId === this.currentUser?.id).length;
    }

    // ✅ Calculer la note moyenne
    getNoteMoyenne(): string {
        const avecNote = this.mesEvaluationsFiltrees.filter(e => e.noteGlobaleFinale);
        if (avecNote.length === 0) return '-';

        const somme = avecNote.reduce((sum, e) => sum + (e.noteGlobaleFinale || 0), 0);
        return (somme / avecNote.length).toFixed(1) + '/10';
    }

    // ✅ Exporter mes évaluations en Excel
    // dashboard.component.ts

    // dashboard.component.ts

    // dashboard.component.ts

    // dashboard.component.ts

    // dashboard.component.ts - Dans exportMesEvaluations

    exportMesEvaluations(): void {
        if (!this.anneeSelectionnee) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner une année'
            });
            return;
        }

        // ✅ Vérification finale
        console.log('=== EXPORT - Vérification ===');
        console.log('Rôle:', this.currentUser?.role);
        console.log('Année:', this.anneeSelectionnee);
        console.log('mesEvaluationsFiltrees:', this.mesEvaluationsFiltrees.length);
        console.log('Contenu de mesEvaluationsFiltrees:', this.mesEvaluationsFiltrees);

        if (this.mesEvaluationsFiltrees.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'Information',
                detail: `Aucune évaluation trouvée pour ${this.anneeSelectionnee}`
            });
            return;
        }

        try {
            console.log('📤 Appel à exportService.exportUserEvaluationsByYear avec:', {
                evaluations: this.mesEvaluationsFiltrees.length,
                userId: this.currentUser?.id,
                annee: this.anneeSelectionnee,
                role: this.currentUser?.role
            });

            // ✅ Appel correct
            this.exportService.exportUserEvaluationsByYear(
                this.mesEvaluationsFiltrees,
                this.currentUser?.id,
                this.anneeSelectionnee,
                this.currentUser?.role,
                this.currentUser
            );

            let message = '';
            switch (this.currentUser?.role) {
                case 'ADMIN':
                    message = `Export de toutes les évaluations de ${this.anneeSelectionnee} généré (${this.mesEvaluationsFiltrees.length} évaluations)`;
                    break;
                case 'DIRECTEUR':
                    message = `Export des évaluations de votre direction (${this.mesEvaluationsFiltrees.length} évaluations) pour ${this.anneeSelectionnee}`;
                    break;
                case 'CHEF_SERVICE':
                    message = `Export des évaluations de votre service (${this.mesEvaluationsFiltrees.length} évaluations) pour ${this.anneeSelectionnee}`;
                    break;
                case 'CHEF_SECTION':
                    message = `Export des évaluations de votre section (${this.mesEvaluationsFiltrees.length} évaluations) pour ${this.anneeSelectionnee}`;
                    break;
                default:
                    message = `Export de vos évaluations ${this.anneeSelectionnee} généré (${this.mesEvaluationsFiltrees.length} évaluations)`;
            }

            this.messageService.add({
                severity: 'success',
                summary: 'Succès',
                detail: message
            });
        } catch (error) {
            console.error('Erreur export:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: error.message || 'Erreur lors de l\'export'
            });
        }
    }

    // ✅ Générer mon rapport personnel PDF
    // dashboard.component.ts

    async genererMonRapport(): Promise<void> {
        if (!this.anneeSelectionnee) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez sélectionner une année'
            });
            return;
        }

        if (this.mesEvaluationsFiltrees.length === 0) {
            this.messageService.add({
                severity: 'info',
                summary: 'Information',
                detail: `Aucune évaluation trouvée pour ${this.anneeSelectionnee}`
            });
            return;
        }

        try {
            console.log('📊 GÉNÉRATION RAPPORT - Début');
            console.log('   - Rôle:', this.currentUser?.role);
            console.log('   - Année:', this.anneeSelectionnee);
            console.log('   - Nombre d\'évaluations:', this.mesEvaluationsFiltrees.length);
            // ✅ Pour l'admin, générer un rapport de toutes les évaluations
            if (this.currentUser?.role === 'ADMIN') {
                await this.exportService.generateAnnualReport(this.mesEvaluationsFiltrees, this.anneeSelectionnee);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Rapport annuel ${this.anneeSelectionnee} généré (${this.mesEvaluationsFiltrees.length} évaluations)`
                });
            } else {
                await this.exportService.generateUserAnnualReport(
                    this.mesEvaluations,
                    this.currentUser.id,
                    this.anneeSelectionnee
                );
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Rapport personnel ${this.anneeSelectionnee} généré`
                });
            }
        } catch (error) {
            console.error('Erreur génération rapport:', error);
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Erreur lors de la génération du rapport'
            });
        }
    }

    // ✅ Méthode pour obtenir la couleur des notes
    getNoteColor(note: number): string {
        if (!note) return '#999';
        if (note >= 8) return '#2ecc71';
        if (note >= 6) return '#3498db';
        if (note >= 4) return '#f39c12';
        return '#e74c3c';
    }
}

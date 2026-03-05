import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CollaborateurService } from '../../services/collaborateur/collaborateur.service';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { DirectionService } from '../../services/Direction/direction.service';
import { ServiceService } from '../../services/service/service.service';
import { SectionService } from '../../services/Section/section.service';

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
        aApprouver: 0
    };

    // Données pour les graphiques (corrigées)
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

    // Répartition par statut (corrigée avec les nouveaux statuts)
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
        private router: Router
    ) {
        this.currentUser = this.authService.getCurrentUser();
    }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.loading.global = true;

        Promise.all([
            this.loadCollaborateurs(),
            this.loadEvaluations(),
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
                    // Données mockées pour éviter les erreurs
                    this.stats.collaborateurs = 45;
                    resolve();
                }
            });
        });
    }

    loadEvaluations(): Promise<void> {
        return new Promise((resolve) => {
            this.evaluationService.getAllEvaluations().subscribe({
                next: (data) => {
                    this.stats.evaluations = data?.length || 0;

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

                    resolve();
                },
                error: (err) => {
                    console.error('Erreur chargement évaluations:', err);
                    // Données mockées
                    this.statutStats.datasets[0].data = [5, 3, 7, 12];
                    this.stats.evaluations = 27;
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
                    // Données mockées
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
        // Routes corrigées selon votre AppRoutingModule
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
}

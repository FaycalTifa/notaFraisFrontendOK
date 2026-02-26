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
        evaluationsValidees: 0
    };

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
        labels: ['Brouillon', 'En cours', 'Validé'],
        datasets: [
            {
                data: [0, 0, 0],
                backgroundColor: ['#f39c12', '#3498db', '#2ecc71'],
                hoverBackgroundColor: ['#e67e22', '#2980b9', '#27ae60']
            }
        ]
    };

    // Dernières évaluations
    dernieresEvaluations: any[] = [];

    // Alertes
    alertes = {
        evaluationsAFaire: 0,
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
                    this.stats.collaborateurs = data.length;
                    resolve();
                },
                error: () => resolve()
            });
        });
    }

    loadEvaluations(): Promise<void> {
        return new Promise((resolve) => {
            this.evaluationService.getAllEvaluations().subscribe({
                next: (data) => {
                    this.stats.evaluations = data.length;

                    // Compter par statut
                    this.stats.evaluationsEnCours = data.filter(e => e.statut === 'EN_COURS' || e.statut === 'BROUILLON').length;
                    this.stats.evaluationsValidees = data.filter(e => e.statut === 'VALIDEE').length;

                    // Mettre à jour les stats des graphiques
                    this.statutStats.datasets[0].data = [
                        data.filter(e => e.statut === 'BROUILLON').length,
                        data.filter(e => e.statut === 'EN_COURS').length,
                        data.filter(e => e.statut === 'VALIDEE').length
                    ];

                    // Dernières évaluations
                    this.dernieresEvaluations = data
                        .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime())
                        .slice(0, 5);

                    resolve();
                },
                error: () => resolve()
            });
        });
    }

    loadDirections(): Promise<void> {
        return new Promise((resolve) => {
            this.directionService.getAllDirections().subscribe({
                next: (data) => {
                    this.stats.directions = data.length;
                    resolve();
                },
                error: () => resolve()
            });
        });
    }

    loadServices(): Promise<void> {
        return new Promise((resolve) => {
            this.serviceService.getAllServices().subscribe({
                next: (data) => {
                    this.stats.services = data.length;
                    resolve();
                },
                error: () => resolve()
            });
        });
    }

    loadSections(): Promise<void> {
        return new Promise((resolve) => {
            this.sectionService.getAllSections().subscribe({
                next: (data) => {
                    this.stats.sections = data.length;
                    resolve();
                },
                error: () => resolve()
            });
        });
    }

    loadEvaluationsAFaire(): Promise<void> {
        return new Promise((resolve) => {
            this.evaluationService.getEvaluationsAFaire().subscribe({
                next: (data) => {
                    this.alertes.evaluationsAFaire = data.length;
                    this.alertes.collaborateursSansEvaluation = data.slice(0, 5);
                    resolve();
                },
                error: () => resolve()
            });
        });
    }

    getRoleLabel(role: string): string {
        const roles: any = {
            'ADMIN': 'Administrateur',
            'DIRECTEUR': 'Directeur',
            'CHEF_SERVICE': 'Chef de Service',
            'CHEF_SECTION': 'Chef de Section',
            'COLLABORATEUR': 'Collaborateur'
        };
        return roles[role] || role;
    }

    getStatutClass(statut: string): string {
        const classes: any = {
            'BROUILLON': 'warning',
            'EN_COURS': 'info',
            'VALIDEE': 'success'
        };
        return classes[statut] || 'secondary';
    }

    navigateTo(route: string): void {
        this.router.navigate([route]);
    }
}

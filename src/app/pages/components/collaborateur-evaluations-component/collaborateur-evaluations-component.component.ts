import { Component, OnInit } from '@angular/core';
import { Evaluation, StatutColors, StatutLabels } from '../../models/entities/evaluation';
import { EvaluationService } from '../../services/evaluation/evaluation.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-collaborateur-evaluations-component',
  templateUrl: './collaborateur-evaluations-component.component.html',
  styleUrls: ['./collaborateur-evaluations-component.component.scss']
})
export class CollaborateurEvaluationsComponentComponent implements OnInit {

  evaluations: Evaluation[] = [];
  loading = false;
  currentUser: any;

  // Données pour le graphique
  chartData: any;
  chartOptions: any;
  nomComplet: string;

  // Labels et couleurs
  statutLabels = StatutLabels;
  statutColors = StatutColors;

  // Statistiques personnelles
  stats = {
    total: 0,
    enCours: 0,
    validees: 0,
    moyenne: 0
  };

  constructor(
      private evaluationService: EvaluationService,
      public authService: AuthService,
      private router: Router,
      private messageService: MessageService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadMesEvaluations();

    const user = this.authService.getCurrentUser();

    if (user) {
      this.nomComplet = user.nomComplet;
      // this.lastName = user.nom;
    }
  }

  initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { stepSize: 1 }
        }
      }
    };
  }

/*  prepareChartData(): void {
    if (this.evaluations.length > 1) {
      // Trier les évaluations par année
      const sortedEvals = [...this.evaluations].sort((a, b) => a.annee - b.annee);

      this.chartData = {
        labels: sortedEvals.map(e => e.annee.toString()),
        datasets: [
          {
            label: 'Note finale',
            data: sortedEvals.map(e => e.noteGlobaleFinale || 0),
            borderColor: '#9b59b6',
            backgroundColor: 'rgba(155, 89, 182, 0.1)',
            tension: 0.4
          }
        ]
      };
    }
  }*/
// collaborateur-evaluations-component.component.ts
  prepareChartData(): void {
    if (this.evaluations.length >= 2) {
      // Trier les évaluations par année
      const sortedEvals = [...this.evaluations].sort((a, b) => a.annee - b.annee);

      this.chartData = {
        labels: sortedEvals.map(e => e.annee.toString()),
        datasets: [
          {
            label: 'Note finale',
            data: sortedEvals.map(e => e.noteGlobaleFinale || 0),
            borderColor: '#9b59b6',
            backgroundColor: 'rgba(155, 89, 182, 0.1)',
            borderWidth: 3,
            pointBackgroundColor: '#9b59b6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Note objectifs',
            data: sortedEvals.map(e => e.noteGlobaleObjectifs || 0),
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#3498db',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            borderDash: [5, 5]
          },
          {
            label: 'Note tenue',
            data: sortedEvals.map(e => e.noteGlobaleTenuePoste || 0),
            borderColor: '#2ecc71',
            backgroundColor: 'rgba(46, 204, 113, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#2ecc71',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            borderDash: [5, 5]
          }
        ]
      };

      this.chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 6
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: (context: any) => {
                return `${context.dataset.label}: ${context.raw.toFixed(1)}/10`;
              }
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 10,
            ticks: {
              stepSize: 1,
              callback: (value: any) => value + '/10'
            },
            title: {
              display: true,
              text: 'Note /10'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Année'
            }
          }
        },
        elements: {
          line: {
            tension: 0.4
          }
        }
      };
    }
  }
  // collaborateur-evaluations-component.component.ts
  loadMesEvaluations(): void {
    if (!this.currentUser?.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Utilisateur non identifié'
      });
      return;
    }

    this.loading = true;
    this.evaluationService.getEvaluationsByCollaborateur(this.currentUser.id).subscribe({
      next: (data) => {
        console.log('✅ Évaluations reçues:', data); // ← Ajoutez ce log
        this.evaluations = data;
        this.calculerStatistiques();
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Erreur chargement évaluations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger vos évaluations'
        });
      }
    });
  }

  calculerStatistiques(): void {
    this.stats.total = this.evaluations.length;
    this.stats.enCours = this.evaluations.filter(e =>
        e.statut === 'BROUILLON' || e.statut === 'EN_COURS'
    ).length;
    this.stats.validees = this.evaluations.filter(e =>
        e.statut === 'VALIDEE'
    ).length;

    // Calcul de la moyenne des notes finales
    const notes = this.evaluations
        .filter(e => e.noteGlobaleFinale != null)
        .map(e => e.noteGlobaleFinale as number);

    if (notes.length > 0) {
      this.stats.moyenne = notes.reduce((a, b) => a + b, 0) / notes.length;
    }
  }

  viewEvaluation(id: number): void {
    this.router.navigate(['/evaluations', id]);
  }

  getNoteColor(note: number | null | undefined): string {
    if (note === null || note === undefined) return '#6c757d';
    if (note >= 8) return '#22c55e';
    if (note >= 6) return '#3b82f6';
    if (note >= 4) return '#eab308';
    return '#ef4444';
  }

  getStatutSeverity(statut: string): string {
    return this.statutColors[statut] || 'secondary';
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  }
}

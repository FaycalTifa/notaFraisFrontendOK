import { Component, OnInit, ViewChild } from '@angular/core';
import { Collaborateur } from '../../models/entities/entities';
import { CollaborateurService } from '../../services/collaborateur/collaborateur.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Table } from 'primeng/table';
import { Role } from '../../models/enum/role';
import { HierarchieService } from '../../services/Hierarchie/hierarchie.service';

@Component({
  selector: 'app-liste-collaborateurs',
  templateUrl: './liste-collaborateurs.component.html',
  styleUrls: ['./liste-collaborateurs.component.scss']
})
export class ListeCollaborateursComponent implements OnInit {

    @ViewChild('dt') dt!: Table;

    collaborateurs: Collaborateur[] = [];
    loading = false;
    searchText = '';

    // ✅ Ajouter cette constante pour les labels des rôles
    roleLabels: { [key: string]: string } = {
        'ADMIN': 'Administrateur',
        'DIRECTEUR': 'Directeur',
        'CHEF_SERVICE': 'Chef de Service',
        'CHEF_SECTION': 'Chef de Section',
        'COLLABORATEUR': 'Collaborateur'
    };

    // ✅ Ajouter cette constante pour les couleurs des rôles
    roleColors: { [key: string]: string } = {
        'ADMIN': '#dc3545',
        'DIRECTEUR': '#ffc107',
        'CHEF_SERVICE': '#0dcaf0',
        'CHEF_SECTION': '#198754',
        'COLLABORATEUR': '#6c757d'
    };

    constructor(
        private collaborateurService: CollaborateurService,
        public authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.loadCollaborateurs();
    }

    loadCollaborateurs(): void {
        this.loading = true;
        this.collaborateurService.getAllCollaborateurs().subscribe({
            next: (data) => {
                console.log('✅ Collaborateurs chargés:', data);
                this.collaborateurs = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('❌ Erreur chargement collaborateurs:', error);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger la liste des collaborateurs'
                });
            }
        });
    }

    onSearch(event: any): void {
        const value = event.target.value;
        if (value.length >= 2) {
            this.loading = true;
            this.collaborateurService.rechercherCollaborateurs(value).subscribe({
                next: (data) => {
                    this.collaborateurs = data;
                    this.loading = false;
                },
                error: () => this.loading = false
            });
        } else if (value.length === 0) {
            this.loadCollaborateurs();
        }
    }

    openNew(): void {
        this.router.navigate(['/collaborateurs/nouveau']);
    }

    viewCollaborateur(id: number): void {
        this.router.navigate([`/collaborateurs/${id}`]);
    }

    editCollaborateur(id: number): void {
        this.router.navigate([`/collaborateurs/editer/${id}`]);
    }

    confirmDelete(collab: Collaborateur): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir désactiver ${collab.prenoms} ${collab.nom} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.collaborateurService.deleteCollaborateur(collab.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Succès',
                            detail: 'Collaborateur désactivé avec succès'
                        });
                        this.loadCollaborateurs();
                    },
                    error: (error) => {
                        console.error('❌ Erreur suppression:', error);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Erreur',
                            detail: 'Erreur lors de la désactivation'
                        });
                    }
                });
            }
        });
    }

    exportExcel(): void {
        import('xlsx').then(xlsx => {
            const worksheet = xlsx.utils.json_to_sheet(this.collaborateurs);
            const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
            const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
            this.downloadFile(excelBuffer, 'collaborateurs.xlsx');
        });
    }

    private downloadFile(data: any, filename: string): void {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    getRoleSeverity(role: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
        switch(role) {
            case 'ADMIN': return 'danger';
            case 'DIRECTEUR': return 'warning';
            case 'CHEF_SERVICE': return 'info';
            case 'CHEF_SECTION': return 'success';
            default: return 'secondary';
        }
    }

    // ✅ Méthode pour obtenir la couleur de l'avatar
    getAvatarColor(role: string): string {
        return this.roleColors[role] || '#6c757d';
    }

    clearFilters(): void {
        if (this.dt) {
            this.dt.clear();
        }
        this.searchText = '';
        this.loadCollaborateurs();
    }
}

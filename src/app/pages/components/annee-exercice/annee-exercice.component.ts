import { Component, OnInit } from '@angular/core';
import { AnneeExercice } from '../../models/entities/entities';
import { AnneeExerciceService } from '../../services/anneeExercice/annee-exercice.service';
import {ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-annee-exercice',
  templateUrl: './annee-exercice.component.html',
  styleUrls: ['./annee-exercice.component.scss']
})
export class AnneeExerciceComponent implements OnInit {

    anneeExercices: AnneeExercice[] = [];
    loading: boolean = false;

    displayDialogue: boolean = false;
    displayDialogueModification: boolean = false;
    displayDialogueDetail: boolean = false;

    // Initialisation explicite avec true
    newAnneeExercice: AnneeExercice = {
        annee: new Date().getFullYear(),
        isActived: true  // Défini explicitement à true
    };

    selectedAnneeExercice: AnneeExercice = {
        annee: 0,
        isActived: false
    };

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private anneeExerciceService: AnneeExerciceService
    ) {}

    ngOnInit(): void {
        this.loadAnneeExercices();
    }

    loadAnneeExercices(): void {
        this.loading = true;
        this.anneeExerciceService.getAll().subscribe({
            next: (data) => {
                this.anneeExercices = data;
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Chargement',
                    detail: 'Données chargées avec succès',
                    life: 3000
                });
            },
            error: (error) => {
                console.error('Erreur chargement:', error);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des années',
                    life: 5000
                });
            }
        });
    }

    // --- AJOUT ---
    onDisplayDialogue() {
        // Réinitialisation explicite avec true
        this.newAnneeExercice = {
            annee: new Date().getFullYear(),
            isActived: true  // Toujours initialisé à true
        };
        this.displayDialogue = true;

        // Debug: Vérifiez la valeur dans la console
        console.log('Nouvelle année créée:', this.newAnneeExercice);
    }

    onHidenDialogue() {
        this.displayDialogue = false;
    }

    onSave() {
        // Debug: Vérifiez les données avant envoi
        console.log('Données à sauvegarder:', this.newAnneeExercice);

        this.loading = true;
        this.anneeExerciceService.create(this.newAnneeExercice).subscribe({
            next: (savedAnnee) => {
                this.anneeExercices.push(savedAnnee);
                this.displayDialogue = false;
                this.loading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Ajout réussi',
                    detail: `Année ${savedAnnee.annee} ajoutée avec succès - Statut: ${savedAnnee.isActived ? 'Actif' : 'Inactif'}`
                });
            },
            error: (error) => {
                console.error('Erreur ajout:', error);
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de l\'ajout'
                });
            }
        });
    }

    // --- MODIFICATION ---
    onDisplayDialogueModif(annee: AnneeExercice) {
        this.selectedAnneeExercice = { ...annee };
        this.displayDialogueModification = true;

        // Debug
        console.log('Année à modifier:', this.selectedAnneeExercice);
    }

    onHidenDialogueModif() {
        this.displayDialogueModification = false;
    }

    updateAnnee() {
        // Debug: Vérifiez les données avant mise à jour
        console.log('Données à modifier:', this.selectedAnneeExercice);

        if (this.selectedAnneeExercice.id) {
            this.loading = true;
            this.anneeExerciceService.update(this.selectedAnneeExercice.id, this.selectedAnneeExercice).subscribe({
                next: (updatedAnnee) => {
                    const index = this.anneeExercices.findIndex(a => a.id === updatedAnnee.id);
                    if (index !== -1) {
                        this.anneeExercices[index] = updatedAnnee;
                        this.displayDialogueModification = false;
                        this.loading = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Modification réussie',
                            detail: `Année ${updatedAnnee.annee} modifiée avec succès - Statut: ${updatedAnnee.isActived ? 'Actif' : 'Inactif'}`
                        });
                    }
                },
                error: (error) => {
                    console.error('Erreur modification:', error);
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Erreur lors de la modification'
                    });
                }
            });
        }
    }

    // --- SUPPRESSION ---
    deleteAnnee(annee: AnneeExercice) {
        this.confirmationService.confirm({
            message: `Voulez-vous vraiment supprimer l'année ${annee.annee} ?`,
            header: 'Confirmation de suppression',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            accept: () => {
                if (annee.id) {
                    this.loading = true;
                    this.anneeExerciceService.delete(annee.id).subscribe({
                        next: () => {
                            this.anneeExercices = this.anneeExercices.filter(a => a.id !== annee.id);
                            this.loading = false;
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Suppression réussie',
                                detail: `Année ${annee.annee} supprimée avec succès`
                            });
                        },
                        error: (error) => {
                            console.error('Erreur suppression:', error);
                            this.loading = false;
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erreur',
                                detail: 'Erreur lors de la suppression'
                            });
                        }
                    });
                }
            }
        });
    }

    // --- DETAILS ---
    onDisplayDialoguDetail(annee: AnneeExercice) {
        this.selectedAnneeExercice = { ...annee };
        this.displayDialogueDetail = true;
    }
}

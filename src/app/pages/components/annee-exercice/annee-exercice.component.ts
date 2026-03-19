import { Component, OnInit } from '@angular/core';
import { AnneeExercice } from '../../models/entities/entities';
import { AnneeExerciceService } from '../../services/anneeExercice/annee-exercice.service';
import {ConfirmationService, MessageService } from 'primeng/api';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-annee-exercice',
  templateUrl: './annee-exercice.component.html',
  styleUrls: ['./annee-exercice.component.scss']
})
export class AnneeExerciceComponent implements OnInit {

    // Formulaire
    anneeForm: FormGroup;
    showForm = false;
    isEditing = false;
    editingId: number | null = null;
    submitting = false;

    // Données
    annees: any[] = [];
    filteredAnnees: any[] = [];

    // États
    loading = false;
    successMessage = '';
    errorMessage = '';

    // Filtres
    searchTerm = '';
    filtreStatut: 'TOUS' | 'ACTIF' | 'INACTIF' = 'TOUS';

    constructor(
        private fb: FormBuilder,
        private anneeService: AnneeExerciceService,
        private messageService: MessageService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.loadAnnees();
    }

    // Getter pour faciliter l'accès aux champs
    get f() {
        return this.anneeForm.controls;
    }

    private initForm(): void {
        this.anneeForm = this.fb.group({
            annee: ['', [Validators.required, Validators.min(2000), Validators.max(2100)]],
            isActived: [false]
        });
    }

    loadAnnees(): void {
        this.loading = true;
        this.anneeService.getAllAnnees().subscribe({
            next: (data) => {
                this.annees = data;
                this.applyFilter();
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur chargement années:', error);
                this.errorMessage = 'Erreur lors du chargement des années';
                this.loading = false;
                setTimeout(() => this.errorMessage = '', 5000);
            }
        });
    }

    onAdd(): void {
        this.showForm = true;
        this.isEditing = false;
        this.editingId = null;
        this.anneeForm.reset({ isActived: false });
    }

    onEdit(annee: any): void {
        this.showForm = true;
        this.isEditing = true;
        this.editingId = annee.id;
        this.anneeForm.patchValue({
            annee: annee.annee,
            isActived: annee.isActived
        });
    }

    onCancel(): void {
        this.showForm = false;
        this.isEditing = false;
        this.editingId = null;
        this.anneeForm.reset({ isActived: false });
    }

    onSubmit(): void {
        if (this.anneeForm.invalid) {
            Object.keys(this.anneeForm.controls).forEach(key => {
                this.anneeForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.submitting = true;
        const anneeData = this.anneeForm.value;

        if (this.isEditing && this.editingId) {
            // Mode édition
            this.anneeService.updateAnnee(this.editingId, anneeData).subscribe({
                next: () => {
                    this.successMessage = 'Année mise à jour avec succès';
                    this.submitting = false;
                    this.onCancel();
                    this.loadAnnees();
                    setTimeout(() => this.successMessage = '', 5000);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Année mise à jour'
                    });
                },
                error: (error) => {
                    console.error('Erreur mise à jour:', error);
                    this.errorMessage = error.error?.message || 'Erreur lors de la mise à jour';
                    this.submitting = false;
                    setTimeout(() => this.errorMessage = '', 5000);
                }
            });
        } else {
            // Mode création
            this.anneeService.createAnnee(anneeData).subscribe({
                next: () => {
                    this.successMessage = 'Année créée avec succès';
                    this.submitting = false;
                    this.onCancel();
                    this.loadAnnees();
                    setTimeout(() => this.successMessage = '', 5000);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Année créée'
                    });
                },
                error: (error) => {
                    console.error('Erreur création:', error);
                    this.errorMessage = error.error?.message || 'Erreur lors de la création';
                    this.submitting = false;
                    setTimeout(() => this.errorMessage = '', 5000);
                }
            });
        }
    }

    onDelete(id: number, annee: number): void {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'année ${annee} ?`)) {
            this.anneeService.deleteAnnee(id).subscribe({
                next: () => {
                    this.successMessage = `Année ${annee} supprimée avec succès`;
                    this.loadAnnees();
                    setTimeout(() => this.successMessage = '', 5000);

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Année supprimée'
                    });
                },
                error: (error) => {
                    console.error('Erreur suppression:', error);
                    this.errorMessage = error.error?.message || 'Erreur lors de la suppression';
                    setTimeout(() => this.errorMessage = '', 5000);
                }
            });
        }
    }

    applyFilter(): void {
        // Filtrer par recherche
        let filtered = this.annees;

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(a =>
                a.annee.toString().includes(term) ||
                (a.isActived ? 'actif' : 'inactif').includes(term)
            );
        }

        // Filtrer par statut
        if (this.filtreStatut === 'ACTIF') {
            filtered = filtered.filter(a => a.isActived);
        } else if (this.filtreStatut === 'INACTIF') {
            filtered = filtered.filter(a => !a.isActived);
        }

        this.filteredAnnees = filtered;
    }

    filterByStatut(statut: 'TOUS' | 'ACTIF' | 'INACTIF'): void {
        this.filtreStatut = statut;
        this.applyFilter();
    }
}

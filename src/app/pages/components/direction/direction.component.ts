import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Table} from 'primeng/table';
import {Direction, DirectionResponse} from '../../models/entities/entities';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DirectionService} from '../../services/Direction/direction.service';
import {HttpResponse} from '@angular/common/http';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-direction',
    templateUrl: './direction.component.html',
    styleUrls: ['./direction.component.scss']
})
export class DirectionComponent implements OnInit {


    // États
    directions: DirectionResponse[] = [];
    filteredDirections: DirectionResponse[] = [];
    loading = false;
    searchTerm = '';

    // Formulaire
    directionForm: FormGroup;
    isEditing = false;
    currentDirectionId?: number;
    showForm = false;
    submitting = false;

    // Messages
    successMessage = '';
    errorMessage = '';

    constructor(
        private directionService: DirectionService,
        private fb: FormBuilder
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.loadDirections();
    }

    // Initialisation du formulaire
    private initForm(): void {
        this.directionForm = this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(50)]],
            nom: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', Validators.maxLength(500)]
        });
    }

    // Charger les directions
    loadDirections(): void {
        console.log('------LIST---------');
        this.loading = true;
        this.directionService.getAllDirections().subscribe({
            next: (data) => {
                this.directions = data;
                this.applyFilter();
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur lors du chargement', error);
                this.errorMessage = 'Erreur lors du chargement des directions';
                this.loading = false;
            }
        });
    }

    // Appliquer le filtre de recherche
    applyFilter(): void {
        if (!this.searchTerm) {
            this.filteredDirections = this.directions;
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredDirections = this.directions.filter(d =>
                d.nom.toLowerCase().includes(term) ||
                d.code.toLowerCase().includes(term) ||
                (d.directeurNom && d.directeurNom.toLowerCase().includes(term))
            );
        }
    }

    // Afficher le formulaire d'ajout
    onAdd(): void {
        this.resetForm();
        this.isEditing = false;
        this.showForm = true;
    }

    // Afficher le formulaire d'édition
    onEdit(direction: DirectionResponse): void {
        this.isEditing = true;
        this.currentDirectionId = direction.id;
        this.directionForm.patchValue({
            code: direction.code,
            nom: direction.nom,
            description: direction.description
        });
        this.showForm = true;
    }

    // Annuler le formulaire
    onCancel(): void {
        this.resetForm();
        this.showForm = false;
        this.isEditing = false;
        this.currentDirectionId = undefined;
    }

    // Réinitialiser le formulaire
    private resetForm(): void {
        this.directionForm.reset();
        this.successMessage = '';
        this.errorMessage = '';
    }

    // Soumettre le formulaire
    onSubmit(): void {
        if (this.directionForm.invalid) {
            Object.keys(this.directionForm.controls).forEach(key => {
                this.directionForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.submitting = true;
        const direction: Direction = this.directionForm.value;

        if (this.isEditing && this.currentDirectionId) {
            // Mode édition
            this.directionService.updateDirection(this.currentDirectionId, direction).subscribe({
                next: (updated) => {
                    this.successMessage = 'Direction mise à jour avec succès';
                    this.loadDirections();
                    this.onCancel();
                    this.submitting = false;
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (error) => {
                    console.error('Erreur mise à jour', error);
                    this.errorMessage = 'Erreur lors de la mise à jour';
                    this.submitting = false;
                }
            });
        } else {
            // Mode création
            this.directionService.createDirection(direction).subscribe({
                next: (created) => {
                    this.successMessage = 'Direction créée avec succès';
                    this.loadDirections();
                    this.onCancel();
                    this.submitting = false;
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (error) => {
                    console.error('Erreur création', error);
                    this.errorMessage = 'Erreur lors de la création';
                    this.submitting = false;
                }
            });
        }
    }

    // Supprimer une direction
    onDelete(id: number, nom: string): void {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la direction "${nom}" ?`)) {
            this.directionService.deleteDirection(id).subscribe({
                next: () => {
                    this.successMessage = 'Direction supprimée avec succès';
                    this.loadDirections();
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (error) => {
                    console.error('Erreur suppression', error);
                    this.errorMessage = 'Erreur lors de la suppression';
                }
            });
        }
    }

    // Getters pour accéder facilement aux champs du formulaire
    get f() {
        return this.directionForm.controls;
    }
}

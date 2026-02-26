import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DirectionResponse, ServiceEntity, ServiceResponse } from '../../models/entities/entities';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DirectionService } from '../../services/Direction/direction.service';
import { ServiceService } from '../../services/service/service.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
    // États
    services: ServiceResponse[] = [];
    servicesData: ServiceEntity[] = [];
    filteredServices: ServiceResponse[] = [];
    directions: DirectionResponse[] = [];
    loading = false;
    searchTerm = '';

    // Formulaire
    serviceForm: FormGroup;
    isEditing = false;
    currentServiceId?: number;
    showForm = false;
    submitting = false;

    // Messages
    successMessage = '';
    errorMessage = '';

    // Filtre par direction
    selectedDirectionId: number | null = null;

    constructor(
        private serviceEntityService: ServiceService,
        private directionService: DirectionService,
        private fb: FormBuilder
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.loadDirections();
        this.loadServices();
    }

    private initForm(): void {
        this.serviceForm = this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(50)]],
            nom: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', Validators.maxLength(500)],
            directionId: ['', Validators.required]
        });
    }

    loadDirections(): void {
        this.directionService.getAllDirections().subscribe({
            next: (data) => {
                this.directions = data;
            },
            error: (error) => {
                console.error('Erreur chargement directions', error);
            }
        });
    }

    loadServices(): void {
        console.log('------LISTE SERVICE---------');
        this.loading = true;
        this.serviceEntityService.getAllServices().subscribe({
            next: (data) => {
                this.services = data;
                console.log('------LISTE SERVICE2---------',  this.servicesData);
                this.applyFilter();
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur chargement services', error);
                this.errorMessage = 'Erreur lors du chargement des services';
                this.loading = false;
            }
        });
    }

    applyFilter(): void {
        let filtered = this.services;

        // Filtre par recherche textuelle
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.nom.toLowerCase().includes(term) ||
                s.code.toLowerCase().includes(term) ||
                (s.directionNom && s.directionNom.toLowerCase().includes(term)) ||
                (s.chefServiceNom && s.chefServiceNom.toLowerCase().includes(term))
            );
        }

        // Filtre par direction
        if (this.selectedDirectionId) {
            filtered = filtered.filter(s => s.directionId === this.selectedDirectionId);
        }

        this.filteredServices = filtered;
    }

    onAdd(): void {
        this.resetForm();
        this.isEditing = false;
        this.showForm = true;
    }

    onEdit(service: ServiceResponse): void {
        this.isEditing = true;
        this.currentServiceId = service.id;
        this.serviceForm.patchValue({
            code: service.code,
            nom: service.nom,
            description: service.description,
            directionId: service.directionId
        });
        // Désactiver le code en mode édition
        this.serviceForm.get('code')?.disable();
        this.showForm = true;
    }

    onCancel(): void {
        this.resetForm();
        this.showForm = false;
        this.isEditing = false;
        this.currentServiceId = undefined;
        this.serviceForm.get('code')?.enable();
    }

    private resetForm(): void {
        this.serviceForm.reset();
        this.successMessage = '';
        this.errorMessage = '';
        this.serviceForm.get('code')?.enable();
    }

    onSubmit(): void {
        if (this.serviceForm.invalid) {
            Object.keys(this.serviceForm.controls).forEach(key => {
                this.serviceForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.submitting = true;
        // Réactiver le code pour la soumission
        this.serviceForm.get('code')?.enable();
        const service: ServiceEntity = this.serviceForm.value;

        if (this.isEditing && this.currentServiceId) {
            this.serviceEntityService.updateService(this.currentServiceId, service).subscribe({
                next: () => {
                    this.successMessage = 'Service mis à jour avec succès';
                    this.loadServices();
                    this.onCancel();
                    this.submitting = false;
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (error) => {
                    console.error('Erreur mise à jour', error);
                    this.errorMessage = 'Erreur lors de la mise à jour';
                    this.submitting = false;
                    this.serviceForm.get('code')?.disable();
                }
            });
        } else {
            this.serviceEntityService.createService(service).subscribe({
                next: () => {
                    this.successMessage = 'Service créé avec succès';
                    this.loadServices();
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

    onDelete(id: number, nom: string): void {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le service "${nom}" ?`)) {
            this.serviceEntityService.deleteService(id).subscribe({
                next: () => {
                    this.successMessage = 'Service supprimé avec succès';
                    this.loadServices();
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (error) => {
                    console.error('Erreur suppression', error);
                    this.errorMessage = 'Erreur lors de la suppression';
                }
            });
        }
    }

    filterByDirection(directionId: number | null): void {
        this.selectedDirectionId = directionId;
        this.applyFilter();
    }

    getDirectionName(directionId: number): string {
        const direction = this.directions.find(d => d.id === directionId);
        return direction ? direction.nom : 'Inconnue';
    }

    get f() {
        return this.serviceForm.controls;
    }
}

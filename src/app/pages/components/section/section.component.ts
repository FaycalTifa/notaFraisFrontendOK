import { Component, OnInit } from '@angular/core';
import {Section, SectionResponse, ServiceEntity, ServiceResponse} from '../../models/entities/entities';
import {SectionService} from '../../services/Section/section.service';
import {ServiceEntiteService} from '../../services/ServiceEntite/service-entite.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ServiceService} from '../../services/service/service.service';
import {EntityArrayResponseType} from '../../services/poste/poste.service';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements OnInit {
    // États
    sections: SectionResponse[] = [];
    sectionsData: Section[] = [];
    filteredSections: SectionResponse[] = [];
    services: ServiceResponse[] = [];
    loading = false;
    searchTerm = '';

    // Formulaire
    sectionForm: FormGroup;
    isEditing = false;
    currentSectionId?: number;
    showForm = false;
    submitting = false;

    // Messages
    successMessage = '';
    errorMessage = '';

    // Filtre par service
    selectedServiceId: number | null = null;

    constructor(
        private sectionService: SectionService,
        private serviceEntityService: ServiceService,
        private fb: FormBuilder
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.loadServices();
        this.loadSections();
    }

    private initForm(): void {
        this.sectionForm = this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(50)]],
            nom: ['', [Validators.required, Validators.maxLength(100)]],
            description: ['', Validators.maxLength(500)],
            serviceId: ['', Validators.required]
        });
    }

    loadServices(): void {
        this.serviceEntityService.getAllServices().subscribe({
            next: (data) => {
                this.sectionsData = data;
            },
            error: (error) => {
                console.error('Erreur chargement services', error);
            }
        });
    }

    loadSections(): void {
        this.loading = true;
        this.sectionService.getAllSections().subscribe({
            next: (data) => {
                this.sections = data;
                this.applyFilter();
                this.loading = false;
            },
            error: (error) => {
                console.error('Erreur chargement sections', error);
                this.errorMessage = 'Erreur lors du chargement des sections';
                this.loading = false;
            }
        });
    }

    applyFilter(): void {
        let filtered = this.sections;

        // Filtre par recherche textuelle
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.nom.toLowerCase().includes(term) ||
                s.code.toLowerCase().includes(term) ||
                (s.serviceNom && s.serviceNom.toLowerCase().includes(term)) ||
                (s.chefSectionNom && s.chefSectionNom.toLowerCase().includes(term))
            );
        }

        // Filtre par service
        if (this.selectedServiceId) {
            filtered = filtered.filter(s => s.serviceId === this.selectedServiceId);
        }

        this.filteredSections = filtered;
    }

    onAdd(): void {
        this.resetForm();
        this.isEditing = false;
        this.showForm = true;
    }

    onEdit(section: SectionResponse): void {
        this.isEditing = true;
        this.currentSectionId = section.id;
        this.sectionForm.patchValue({
            code: section.code,
            nom: section.nom,
            description: section.description,
            serviceId: section.serviceId
        });
        this.sectionForm.get('code')?.disable();
        this.showForm = true;
    }

    onCancel(): void {
        this.resetForm();
        this.showForm = false;
        this.isEditing = false;
        this.currentSectionId = undefined;
        this.sectionForm.get('code')?.enable();
    }

    private resetForm(): void {
        this.sectionForm.reset();
        this.successMessage = '';
        this.errorMessage = '';
        this.sectionForm.get('code')?.enable();
    }

    onSubmit(): void {
        if (this.sectionForm.invalid) {
            Object.keys(this.sectionForm.controls).forEach(key => {
                this.sectionForm.get(key)?.markAsTouched();
            });
            return;
        }

        this.submitting = true;
        this.sectionForm.get('code')?.enable();
        const section: Section = this.sectionForm.value;

        if (this.isEditing && this.currentSectionId) {
            this.sectionService.updateSection(this.currentSectionId, section).subscribe({
                next: () => {
                    this.successMessage = 'Section mise à jour avec succès';
                    this.loadSections();
                    this.onCancel();
                    this.submitting = false;
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (error) => {
                    console.error('Erreur mise à jour', error);
                    this.errorMessage = 'Erreur lors de la mise à jour';
                    this.submitting = false;
                    this.sectionForm.get('code')?.disable();
                }
            });
        } else {
            this.sectionService.createSection(section).subscribe({
                next: () => {
                    this.successMessage = 'Section créée avec succès';
                    this.loadSections();
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
        if (confirm(`Êtes-vous sûr de vouloir supprimer la section "${nom}" ?`)) {
            this.sectionService.deleteSection(id).subscribe({
                next: () => {
                    this.successMessage = 'Section supprimée avec succès';
                    this.loadSections();
                    setTimeout(() => this.successMessage = '', 3000);
                },
                error: (error) => {
                    console.error('Erreur suppression', error);
                    this.errorMessage = 'Erreur lors de la suppression';
                }
            });
        }
    }

    filterByService(serviceId: number | null): void {
        this.selectedServiceId = serviceId;
        this.applyFilter();
    }

    getServiceName(serviceId: number): string {
        const service = this.services.find(s => s.id === serviceId);
        return service ? service.nom : 'Inconnu';
    }

    get f() {
        return this.sectionForm.controls;
    }
}

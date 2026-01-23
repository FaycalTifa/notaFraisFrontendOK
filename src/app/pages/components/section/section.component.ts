import { Component, OnInit } from '@angular/core';
import {Section, ServiceEntite} from '../../models/entities/entities';
import {SectionService} from '../../services/Section/section.service';
import {ServiceEntiteService} from '../../services/ServiceEntite/service-entite.service';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ServiceService} from '../../services/service/service.service';
import {EntityArrayResponseType} from '../../services/poste/poste.service';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements OnInit {

    sections: Section[] = [];
    services: any[] = [];
    displayDialog = false;
    displayEditDialog = false;
    selectedSection: Section = {};
    newSection: Section = {};

    constructor(
        private sectionService: SectionService,
        private serviceEntiteService: ServiceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadSections();
        this.loadServices();
    }

    loadSections(): void {
        this.sectionService.getAllSections().subscribe(
            (sections) => {
                this.sections = sections;
                console.log('Sections chargées:', sections);
                // Debug détaillé
                sections.forEach((section, index) => {
                    console.log(`Section ${index}:`, {
                        code: section.code,
                        libelle: section.libelle,
                        service: section.service,
                        serviceLibelle: section.service?.libelle,
                        directionLibelle: section.service?.direction?.libelle
                    });
                });
            },
            (error) => {
                console.error('Erreur chargement sections:', error);
            }
        );
    }

    loadServices(): void {
        this.serviceEntiteService.getAllServices().subscribe(
            (services) => {
                this.services = services; // <== Ajoute cette ligne
                console.log('Services chargés :', this.services);
            },
            (error) => {
                console.error('Erreur chargement services:', error);
            }
        );
    }


    showAddDialog(): void {
        this.newSection = {};
        this.displayDialog = true;
    }

    showEditDialog(section: Section): void {
        this.selectedSection = { ...section };
        this.displayEditDialog = true;
    }

    hideDialog(): void {
        this.displayDialog = false;
        this.displayEditDialog = false;
    }

    createSection(): void {
        this.sectionService.createSection(this.newSection).subscribe(
            (section) => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Section créée avec succès' });
                this.loadSections();
                this.hideDialog();
            },
            (error) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la création' });
            }
        );
    }

    updateSection(): void {
        if (this.selectedSection.id) {
            this.sectionService.updateSection(this.selectedSection.id, this.selectedSection).subscribe(
                (section) => {
                    this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Section modifiée avec succès' });
                    this.loadSections();
                    this.hideDialog();
                },
                (error) => {
                    this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la modification' });
                }
            );
        }
    }

    confirmDelete(section: Section): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer la section ${section.libelle} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (section.id) {
                    this.deleteSection(section.id);
                }
            }
        });
    }

    deleteSection(id: number): void {
        this.sectionService.deleteSection(id).subscribe(
            () => {
                this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Section supprimée avec succès' });
                this.loadSections();
            },
            (error) => {
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Erreur lors de la suppression' });
            }
        );
    }

    getServiceLibelle(section: Section): string {
        if (section.service && section.service.libelle) {
            return section.service.libelle;
        }

        if (section.serviceId && this.services.length > 0) {
            const service = this.services.find(s => s.id === section.serviceId);
            return service ? service.libelle : 'Non assigné';
        }

        return 'Non assigné';
    }

    getDirectionLibelle(section: Section): string {
        // Si la relation complète est chargée
        if (section.service && section.service.direction && section.service.direction.libelle) {
            return section.service.direction.libelle;
        }

        // Si seulement service est chargé avec directionId
        if (section.service && section.service.directionId && this.services.length > 0) {
            const service = this.services.find(s => s.id === section.serviceId);
            if (service && service.direction) {
                return service.direction.libelle;
            }
        }

        return 'Non assignée';
    }

}

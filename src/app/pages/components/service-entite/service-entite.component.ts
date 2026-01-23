import { Component, OnInit } from '@angular/core';
import {Direction, ServiceEntite} from '../../models/entities/entities';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DirectionService} from '../../services/Direction/direction.service';
import {ServiceEntiteService} from '../../services/ServiceEntite/service-entite.service';
import {ServiceService} from '../../services/service/service.service';
import {HttpResponse} from '@angular/common/http';

@Component({
  selector: 'app-service-entite',
  templateUrl: './service-entite.component.html',
  styleUrls: ['./service-entite.component.scss']
})
export class ServiceEntiteComponent implements OnInit {

    services: ServiceEntite[] = [];
    directions: Direction[] = [];
    displayDialog = false;
    displayEditDialog = false;
    selectedService: ServiceEntite = {};
    newService: ServiceEntite = {};

    constructor(
        private serviceService: ServiceService, // Corrigez le nom du service
        private directionService: DirectionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit(): void {
        this.loadDirections(); // Charge d'abord les directions
        console.log('Token:', localStorage.getItem('authToken'));
        console.log('CurrentUser:', localStorage.getItem('currentUser'));
    }

    loadServices(): void {
        this.serviceService.getAllServices().subscribe({
            next: (services) => {
                this.services = services;
                console.log('Services chargés:', services);
                // Log détaillé pour debug
                services.forEach((service, index) => {
                    console.log(`Service ${index}:`, {
                        code: service.code,
                        libelle: service.libelle,
                        direction: service.direction,
                        directionId: service.directionId,
                        directionLibelle: this.getDirectionLibelle(service)
                    });
                });
            },
            error: (error) => {
                console.error('Erreur chargement services:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des services'
                });
            }
        });
    }

    loadDirections(): void {
        this.directionService.getAllDirection().subscribe({
            next: (directions) => {
                this.directions = directions;
                console.log('Directions chargées:', directions);
                // Maintenant chargez les services une fois les directions disponibles
                this.loadServices();
            },
            error: (error) => {
                console.error('Erreur chargement directions:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des directions'
                });
            }
        });
    }

    // Méthode pour obtenir le libellé de la direction
// service-entite.component.ts
    getDirectionLibelle(service: ServiceEntite): string {
        // Vérification en profondeur de l'objet direction
        if (service.direction && service.direction.libelle) {
            return service.direction.libelle;
        }

        // Si seulement directionId est disponible
        if (service.directionId && this.directions.length > 0) {
            const direction = this.directions.find(d => d.id === service.directionId);
            return direction ? direction.libelle : 'Non assignée';
        }

        // Si aucun des cas ci-dessus
        return 'Non assignée';
    }

    showAddDialog(): void {
        this.newService = {};
        this.displayDialog = true;
    }

    showEditDialog(service: ServiceEntite): void {
        this.selectedService = { ...service };
        this.displayEditDialog = true;
    }

    hideDialog(): void {
        this.displayDialog = false;
        this.displayEditDialog = false;
    }

    createService(): void {
        const serviceToCreate = {
            code: this.newService.code,
            libelle: this.newService.libelle,
            directionId: this.newService.directionId
        };

        this.serviceService.createService(serviceToCreate).subscribe({
            next: (service) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Service créé avec succès'
                });
                this.loadServices();
                this.hideDialog();
            },
            error: (error) => {
                console.error('Erreur création service:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la création: ' + (error.error?.message || error.message)
                });
            }
        });
    }

    updateService(): void {
        if (this.selectedService.id) {
            const serviceToUpdate = {
                code: this.selectedService.code,
                libelle: this.selectedService.libelle,
                directionId: this.selectedService.directionId
            };

            this.serviceService.updateService(this.selectedService.id, serviceToUpdate).subscribe({
                next: (service) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Service modifié avec succès'
                    });
                    this.loadServices();
                    this.hideDialog();
                },
                error: (error) => {
                    console.error('Erreur modification service:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erreur',
                        detail: 'Erreur lors de la modification'
                    });
                }
            });
        }
    }

    confirmDelete(service: ServiceEntite): void {
        this.confirmationService.confirm({
            message: `Êtes-vous sûr de vouloir supprimer le service ${service.libelle} ?`,
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (service.id) {
                    this.deleteService(service.id);
                }
            }
        });
    }

    deleteService(id: number): void {
        this.serviceService.deleteService(id).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Service supprimé avec succès'
                });
                this.loadServices();
            },
            error: (error) => {
                console.error('Erreur suppression service:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors de la suppression'
                });
            }
        });
    }
}

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Table} from 'primeng/table';
import {Direction} from '../../models/entities/entities';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DirectionService} from '../../services/Direction/direction.service';
import {HttpResponse} from '@angular/common/http';

@Component({
    selector: 'app-direction',
    templateUrl: './direction.component.html',
    styleUrls: ['./direction.component.scss']
})
export class DirectionComponent implements OnInit {

    loading = false;
    @ViewChild('dt') table: Table;
    @ViewChild('filter') filter: ElementRef;
    directions: Direction[] = [];
    displayDialogue = false;
    displayDialogueModification = false;
    displayDialogueDetail = false;

    // Objet pour le formulaire d'ajout
    newDirection: Direction = {
        code: '',
        libelle: '',
    };

    // Objet pour le formulaire de modification
    selectedDirection: Direction = {
        id: undefined,
        code: '',
        libelle: '',
    };

    constructor(
        private messageService: MessageService,
        protected directionService: DirectionService,
        private confirmationService: ConfirmationService) {
    }

    ngOnInit(): void {
        this.getAllDirections();
    }

    clear(table: Table) {
        table.clear();
        this.filter.nativeElement.value = '';
    }

    // Dans votre composant
    getAllDirections(): void {
        this.directionService.getAllDirection().subscribe({
            next: (directions) => {
                this.directions = directions;
                console.log('Directions chargées:', directions);
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

    successAlert(): void {
        this.messageService.add({severity: 'success', summary: 'Opération réussie!'});
    }

    errorAlert(message: string): void {
        this.messageService.add({severity: 'error', summary: 'Erreur', detail: message});
    }

    onDisplayDialogue(): void {
        this.newDirection = { code: '', libelle: '' }; // Réinitialise le formulaire
        this.displayDialogue = true;
    }

    onDisplayDialogueModif(direction: Direction): void {
        console.log('Direction à modifier:', direction);

        if (!direction.id) {
            this.errorAlert('ID de la direction non défini');
            return;
        }

        // Crée une copie de l'objet pour éviter les références
        this.selectedDirection = { ...direction };
        this.displayDialogueModification = true;
    }

    onHidenDialogue(): void {
        this.displayDialogue = false;
        this.displayDialogueModification = false;
        this.displayDialogueDetail = false;
    }

    onDisplayDialoguDetail(direction: Direction) {
        this.selectedDirection = { ...direction };
        this.displayDialogueDetail = true;
    }

    onHidenDialogueModif(): void {
        this.displayDialogueModification = false;
    }

    onSave(): void {
        this.directionService.createDirection(this.newDirection).subscribe(
            resp => {
                if (resp) {
                    this.onHidenDialogue();
                    this.successAlert();
                    this.getAllDirections();
                }
            },
            error => {
                console.error('Erreur lors de la création de la direction', error);
                this.errorAlert('Erreur lors de la création');
            }
        );
    }

    updateDirection(): void {
        console.log('Mise à jour de la direction:', this.selectedDirection);
        if (!this.selectedDirection.id) {
            this.errorAlert('ID de la direction non défini');
            return;
        }
        this.directionService.updateDirection(this.selectedDirection.id, this.selectedDirection).subscribe(
            response => {
                console.log('Direction mise à jour avec succès', response);
                this.successAlert();
                this.getAllDirections();
                this.onHidenDialogueModif();
            },
            error => {
                console.error('Erreur lors de la mise à jour de la direction:', error);
                this.errorAlert('Erreur lors de la mise à jour');
            }
        );
    }

    deleteDirection(direction: Direction): void {
        console.log('Suppression de la direction:', direction);

        if (!direction.id) {
            this.errorAlert('ID de la direction non défini');
            return;
        }
        this.confirmationService.confirm({
            target: event.target,
            message: 'Êtes-vous sûr de vouloir supprimer ' + direction.libelle + ' ?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.directionService.deleteDirection(direction.id, direction).subscribe(
                    response => {
                        console.log('Direction supprimée avec succès', response);
                        this.successAlert();
                        this.getAllDirections();
                    },
                    error => {
                        console.error('Erreur lors de la suppression de la direction:', error);
                        this.errorAlert('Erreur lors de la suppression');
                    }
                );
            },
            reject: () => {
                // Action annulée
            }
        });
    }
}

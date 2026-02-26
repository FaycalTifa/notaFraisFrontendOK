import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

    constructor(private messageService: MessageService) {}

    success(detail: string, summary: string = 'Succès'): void {
        this.messageService.add({
            severity: 'success',
            summary: summary,
            detail: detail,
            life: 3000
        });
    }

    error(detail: string, summary: string = 'Erreur'): void {
        this.messageService.add({
            severity: 'error',
            summary: summary,
            detail: detail,
            life: 5000
        });
    }

    info(detail: string, summary: string = 'Information'): void {
        this.messageService.add({
            severity: 'info',
            summary: summary,
            detail: detail,
            life: 3000
        });
    }

    warn(detail: string, summary: string = 'Attention'): void {
        this.messageService.add({
            severity: 'warn',
            summary: summary,
            detail: detail,
            life: 4000
        });
    }
}

import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-annulation-dialog',
  templateUrl: './annulation-dialog.component.html',
  styleUrls: ['./annulation-dialog.component.scss']
})
export class AnnulationDialogComponent implements OnInit {

    motif: string = '';
    commentaire: string = '';
    submitted = false;
    loading = false;

    titre: string;
    placeholder: string;
    actionLabel: string;
    afficherCommentaire: boolean;

    constructor(
        public ref: DynamicDialogRef,
        public config: DynamicDialogConfig,
        private messageService: MessageService
    ) {
        this.titre = config.data?.titre || 'Motif de l\'annulation';
        this.placeholder = config.data?.placeholder || 'Expliquez la raison...';
        this.actionLabel = config.data?.actionLabel || 'Confirmer';
        this.afficherCommentaire = config.data?.afficherCommentaire || false;
    }

    ngOnInit(): void {
      
    }

    valider(): void {
        this.submitted = true;

        if (!this.motif?.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Le motif est obligatoire'
            });
            return;
        }

        this.ref.close({
            motif: this.motif,
            commentaire: this.commentaire
        });
    }

    annuler(): void {
        this.ref.close();
    }
}

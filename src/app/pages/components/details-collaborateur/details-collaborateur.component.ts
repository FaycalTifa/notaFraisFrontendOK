import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Collaborateur } from '../../models/entities/entities';

@Component({
  selector: 'app-details-collaborateur',
  templateUrl: './details-collaborateur.component.html',
  styleUrls: ['./details-collaborateur.component.scss']
})
export class DetailsCollaborateurComponent implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    @Input() collaborateur: Collaborateur | null = null;
    @Output() onClose = new EventEmitter<void>();

    getRoleLabel(role: string): string {
        const labels: any = {
            'DIRECTEUR': 'Directeur',
            'CHEF_SERVICE': 'Chef de Service',
            'CHEF_SECTION': 'Chef de Section',
            'AGENT': 'Agent'
        };
        return labels[role] || role;
    }

    getRoleClass(role: string): string {
        const classes: any = {
            'DIRECTEUR': 'bg-purple-100 text-purple-800',
            'CHEF_SERVICE': 'bg-blue-100 text-blue-800',
            'CHEF_SECTION': 'bg-green-100 text-green-800',
            'AGENT': 'bg-gray-100 text-gray-800'
        };
        return classes[role] || 'bg-gray-100 text-gray-800';
    }

    close() {
        this.onClose.emit();
    }
}

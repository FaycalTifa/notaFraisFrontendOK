import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { CollaborateurService } from '../../services/collaborateur/collaborateur.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-hierarchie-view',
  templateUrl: './hierarchie-view.component.html',
  styleUrls: ['./hierarchie-view.component.scss']
})
export class HierarchieViewComponent implements OnInit {

    hierarchyData: TreeNode[] = [];
    selectedNode: TreeNode | null = null;
    loading = false;

    constructor(
        private collaborateurService: CollaborateurService,
        private authService: AuthService
    ) {}

    ngOnInit() {
      
    }

   /* loadHierarchy() {
        this.loading = true;
        this.collaborateurService.getHierarchie().subscribe({
            next: (response) => {
                this.buildHierarchy(response);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }*/

    private buildHierarchy(data: any) {
        const user = this.authService.getCurrentUser();

        if (user?.role === 'DIRECTEUR') {
            this.hierarchyData = this.buildDirectorHierarchy(data);
        } else if (user?.role === 'CHEF_SERVICE') {
            this.hierarchyData = this.buildServiceHierarchy(data);
        } else if (user?.role === 'CHEF_SECTION') {
            this.hierarchyData = this.buildSectionHierarchy(data);
        }
    }

    private buildDirectorHierarchy(data: any): TreeNode[] {
        // Construire l'arbre complet
        return [{
            label: 'Direction',
            expanded: true,
            type: 'root',
            children: [
                {
                    label: 'Direction des Systèmes',
                    expanded: true,
                    children: [
                        {
                            label: 'Service Informatique',
                            expanded: true,
                            children: [
                                {
                                    label: 'Section Développement',
                                    expanded: true,
                                    children: [
                                        { label: 'TRAORE Issa' },
                                        { label: 'DUBOIS Paul' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        }];
    }

    private buildServiceHierarchy(data: any): TreeNode[] {
        // Vue limitée au service
        return [{
            label: 'Mon Service',
            expanded: true,
            children: []
        }];
    }

    private buildSectionHierarchy(data: any): TreeNode[] {
        // Vue limitée à la section
        return [{
            label: 'Ma Section',
            expanded: true,
            children: []
        }];
    }

    onNodeSelect(event: any) {
        console.log('Node selected:', event.node);
    }

    getNodeIcon(node: any) {
        
    }
}

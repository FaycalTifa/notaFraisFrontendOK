import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

   /* registerDTO: RegisterDTO = {
        username: '',
        prenom: '',
        nom: '',
        password: '',
        confirmPassword: '',
        role: '',
        directionId: undefined,
        serviceId: undefined,
        sectionId: undefined,
        agentId: undefined
    };

    directions: Direction[] = [];
    services: ServiceEntite[] = [];
    sections: Section[] = [];
    agents: Agent[] = [];

    roles: any[] = [
        { label: 'Directeur', value: 'DIRECTEUR' },
        { label: 'Chef de Service', value: 'CHEF_SERVICE' },
        { label: 'Chef de Section', value: 'CHEF_SECTION' },
        { label: 'Agent', value: 'AGENT' }
    ];

    constructor(
        private authService: LoginService,
        private router: Router,
        private utilisateurService: LoginService,
        private hierarchieService: HierarchieService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadDirections();
        console.log('Token:', localStorage.getItem('authToken'));
        console.log('CurrentUser:', localStorage.getItem('currentUser'));
    }

    loadDirections(): void {
        this.hierarchieService.getDirections().subscribe({
            next: (directions) => {
                this.directions = directions;
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

    onRoleChange(): void {
        // Réinitialiser les sélections quand le rôle change
        this.registerDTO.directionId = undefined;
        this.registerDTO.serviceId = undefined;
        this.registerDTO.sectionId = undefined;
        this.registerDTO.agentId = undefined;
        this.services = [];
        this.sections = [];
        this.agents = [];
    }

    onDirectionChange(): void {
        this.registerDTO.serviceId = undefined;
        this.registerDTO.sectionId = undefined;
        this.registerDTO.agentId = undefined;
        this.services = [];
        this.sections = [];
        this.agents = [];

        if (this.registerDTO.directionId) {
            this.loadServicesByDirection(this.registerDTO.directionId);
        }
    }

    loadServicesByDirection(directionId: number): void {
        this.hierarchieService.getServicesByDirection(directionId).subscribe({
            next: (services) => {
                this.services = services;
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

    onServiceChange(): void {
        this.registerDTO.sectionId = undefined;
        this.registerDTO.agentId = undefined;
        this.sections = [];
        this.agents = [];

        if (this.registerDTO.serviceId) {
            this.loadSectionsByService(this.registerDTO.serviceId);
        }
    }

    loadSectionsByService(serviceId: number): void {
        this.hierarchieService.getSectionsByService(serviceId).subscribe({
            next: (sections) => {
                this.sections = sections;
            },
            error: (error) => {
                console.error('Erreur chargement sections:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des sections'
                });
            }
        });
    }

    onSectionChange(): void {
        this.registerDTO.agentId = undefined;
        this.agents = [];

        if (this.registerDTO.sectionId) {
            this.loadAgentsBySection(this.registerDTO.sectionId);
        }
    }

    loadAgentsBySection(sectionId: number): void {
        this.hierarchieService.getAgentsBySection(sectionId).subscribe({
            next: (agents) => {
                this.agents = agents;
            },
            error: (error) => {
                console.error('Erreur chargement agents:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des agents'
                });
            }
        });
    }

    register(): void {
        // Validation basique
        if (!this.registerDTO.username || this.registerDTO.username.length < 3) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Username doit contenir au moins 3 caractères'
            });
            return;
        }

        if (!this.registerDTO.password || this.registerDTO.password.length < 6) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Le mot de passe doit contenir au moins 6 caractères'
            });
            return;
        }

        if (this.registerDTO.password !== this.registerDTO.confirmPassword) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Les mots de passe ne correspondent pas'
            });
            return;
        }

        if (!this.registerDTO.role) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez sélectionner un rôle'
            });
            return;
        }

        // Validation selon le rôle
        if (!this.registerDTO.directionId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez sélectionner une direction'
            });
            return;
        }

        if (['CHEF_SERVICE', 'CHEF_SECTION', 'AGENT'].includes(this.registerDTO.role) && !this.registerDTO.serviceId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez sélectionner un service'
            });
            return;
        }

        if (['CHEF_SECTION', 'AGENT'].includes(this.registerDTO.role) && !this.registerDTO.sectionId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez sélectionner une section'
            });
            return;
        }

        if (this.registerDTO.role === 'AGENT' && !this.registerDTO.agentId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Veuillez sélectionner un agent'
            });
            return;
        }

        // Appel au service
        this.utilisateurService.registerUtilisateur(this.registerDTO).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Utilisateur créé avec succès'
                });
                // Réinitialiser le formulaire
                this.registerDTO = {
                    username: '',
                    prenom: '',
                    nom: '',
                    password: '',
                    confirmPassword: '',
                    role: '',
                    directionId: undefined,
                    serviceId: undefined,
                    sectionId: undefined,
                    agentId: undefined
                };
                this.services = [];
                this.sections = [];
                this.agents = [];
            },
            error: (error) => {
                const errorMessage = error.error?.message || error.error || 'Erreur lors de la création';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: errorMessage
                });
            }
        });
    }*/
}

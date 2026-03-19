import {Component, OnInit} from '@angular/core';
import {AppComponent} from './app.component';
import {KeycloakService} from 'keycloak-angular';
import {ConfirmationService} from 'primeng/api';
import {HttpResponse} from '@angular/common/http';
import { AuthService } from './pages/services/auth/auth.service';

@Component({
    selector: 'app-menu',
    template: `
        <ul class="layout-menu">
            <li app-menuitem *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true"></li>
        </ul>
    `
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];
    isLogin = false;

    constructor(
        public app: AppComponent,
        public confirmationService: ConfirmationService,
        public authService: AuthService
    ) {}

    ngOnInit() {
        this.buildMenu();

        // Reconstruire le menu quand l'utilisateur change (optionnel)
        this.authService.userChanged.subscribe(() => {
            this.buildMenu();
        });
    }

    buildMenu() {
        console.log('🔄 Construction du menu...');
        console.log('👤 Utilisateur connecté:', this.authService.getCurrentUser());

        // Menu de base visible par tous les utilisateurs connectés
        const baseMenu = [
            {
                label: 'TABLEAU DE BORD',
                icon: 'pi pi-fw pi-home',
                visible: this.authService.isAuthenticated(),
                items: [
                    {label: 'DASHBOARD', icon: 'pi pi-sitemap', routerLink: ['/dashboard']},
                ]
            }
        ];

        // Menu PARAMETRAGE (visible seulement pour ADMIN)
        const parametrageMenu = {
            label: 'PARAMÉTRAGE',
            icon: 'pi pi-fw pi-cog',
            visible: this.authService.isAdmin(),
            items: [
                {label: 'DIRECTIONS', icon: 'pi pi-sitemap', routerLink: ['/parametre/direction']},
                {label: 'SERVICES', icon: 'pi pi-briefcase', routerLink: ['/parametre/service']},
                {label: 'SECTIONS', icon: 'pi pi-th-large', routerLink: ['/parametre/section']},
                {label: 'ANNÉES EXERCICE', icon: 'pi pi-calendar', routerLink: ['/parametre/exercice']}
            ]
        };

        // Menu COLLABORATEURS - visible par TOUS
        const collaborateurMenu = {
            label: 'COLLABORATEURS',
            icon: 'pi pi-fw pi-users',
            visible: this.authService.isAuthenticated(),
            items: [
                {label: 'LISTE COLLABORATEURS', icon: 'pi pi-list', routerLink: ['/collaborateur']},
                {
                    label: 'CRÉER COLLABORATEUR',
                    icon: 'pi pi-user-plus',
                    routerLink: ['/creer-collaborateur'],
                    visible: this.authService.isAdmin()
                }
            ]
        };

        // Menu ÉVALUATIONS - visible par TOUS
        const evaluationMenu = {
            label: 'ÉVALUATIONS',
            icon: 'pi pi-fw pi-star',
            visible: this.authService.isAuthenticated(),
            items: [
                {label: 'LISTE ÉVALUATIONS', icon: 'pi pi-list', routerLink: ['/liste-evaluations']},
                {
                    label: 'CRÉER ÉVALUATION',
                    icon: 'pi pi-plus-circle',
                    routerLink: ['/evaluations/nouveau'],
                    visible: this.authService.hasAnyRole(['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION'])
                },
                {label: 'MES ÉVALUATIONS', icon: 'pi pi-user', routerLink: ['/mon-levaluations']}
            ]
        };

        // Menu MON ESPACE (visible pour tous)
        const monEspaceMenu = {
            label: 'MON ESPACE',
            icon: 'pi pi-fw pi-user',
            visible: this.authService.isAuthenticated(),
            items: [
                {label: 'MES ÉVALUATIONS', icon: 'pi pi-star', routerLink: ['/mon-levaluations']},
                {label: 'CHANGER MOT DE PASSE', icon: 'pi pi-lock', routerLink: ['/change-mot-passe']},
            ]
        };

        // Construire le menu en filtrant les éléments visibles
        const allMenus = [
            ...baseMenu,
            parametrageMenu,
            collaborateurMenu,
            evaluationMenu,
            monEspaceMenu,
        ];

        // Filtrer les menus principaux
        this.model = allMenus.filter(item => {
            const visible = item.visible !== false;
            console.log(`📌 Menu ${item.label}:`, visible);
            return visible;
        });

        console.log('✅ Menu final:', this.model);
    }
}

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
    }

    buildMenu() {
        // Menu de base visible par tous les utilisateurs connectés
        const baseMenu = [
            {
                label: 'TABLEAU DE BORD',
                icon: 'pi pi-fw pi-home',
                routerLink: ['/dashboard'],
                visible: this.authService.isAuthenticated()
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

        // Menu COLLABORATEURS (visible pour ADMIN, DIRECTEUR, CHEF_SERVICE, CHEF_SECTION)
        const collaborateurMenu = {
            label: 'COLLABORATEURS',
            icon: 'pi pi-fw pi-users',
            visible: this.authService.hasAnyRole(['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION']),
            items: [
                {label: 'LISTE COLLABORATEURS', icon: 'pi pi-list', routerLink: ['/collaborateur']},
                {label: 'CRÉER COLLABORATEUR', icon: 'pi pi-user-plus', routerLink: ['/creer-collaborateur'],
                    visible: this.authService.isAdmin()}
            ]
        };

        // Menu ÉVALUATIONS (visible pour ADMIN, DIRECTEUR, CHEF_SERVICE, CHEF_SECTION)
        const evaluationMenu = {
            label: 'ÉVALUATIONS',
            icon: 'pi pi-fw pi-star',
            visible: this.authService.hasAnyRole(['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION']),
            items: [
                {label: 'LISTE ÉVALUATIONS', icon: 'pi pi-list', routerLink: ['/liste-evaluations']},
                {label: 'CRÉER ÉVALUATION', icon: 'pi pi-plus-circle', routerLink: ['/evaluations/nouveau']},
                {label: 'MON ÉVALUATION', icon: 'pi pi-user', routerLink: ['/mon-levaluations']}
            ]
        };

        // Menu MES INFORMATIONS (visible pour tous)
        const monEspaceMenu = {
            label: 'MON ESPACE',
            icon: 'pi pi-fw pi-user',
            visible: this.authService.isAuthenticated(),
            items: [
                {label: 'MON ÉVALUATION', icon: 'pi pi-star', routerLink: ['/mon-levaluations']},
              //  {label: 'MES INFORMATIONS', icon: 'pi pi-id-card', routerLink: ['/info/personnel']}
            ]
        };

        // Menu ADMINISTRATION (visible seulement pour ADMIN)
        const adminMenu = {
            label: 'RECAP',
            icon: 'pi pi-fw pi-shield',
            visible: this.authService.hasAnyRole(['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION']),
            items: [
                {label: 'DASHBOARD', icon: 'pi pi-chart-line', routerLink: ['/dashboard']},
            ]
        };

        // Construire le menu en fonction des rôles
        this.model = [
            ...baseMenu,
            parametrageMenu,
            collaborateurMenu,
            evaluationMenu,
            monEspaceMenu,
            adminMenu
        ].filter(item => item.visible); // Filtrer les éléments non visibles
    }
}

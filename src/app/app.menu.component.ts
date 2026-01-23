import {Component, OnInit} from '@angular/core';
import {AppComponent} from './app.component';
import {KeycloakService} from 'keycloak-angular';
import {ConfirmationService} from 'primeng/api';
import {HttpResponse} from '@angular/common/http';

@Component({
    selector: 'app-menu',
    template: `
        <ul class="layout-menu">
            <li app-menuitem *ngFor="let item of model; let i = index;" [item]="item" [index]="i" [root]="true"></li>
        </ul>
    `
})
export class AppMenuComponent implements OnInit {
    model: any[];
    isLogin = false;
    userRole: string[] = [];
    IS_EMPLOYE = 'IS_EMPLOYE';
    IS_CHEF_SERVICE = 'IS_CHEF_SERVICE';
    IS_DG = 'IS_DG';
    IS_COMPTABILITE = 'IS_COMPTABILITE';
    IS_PARAMETRAGE_MANAGER = 'IS_PARAMETRAGE_MANAGER';
    IS_CHEF_PERSONNEL = 'IS_CHEF_PERSONNEL';
    IS_CHEF_COMPTABILITE = 'IS_CHEF_COMPTABILITE';
    IS_ADMIN = 'IS_ADMIN';
    IS_EMPLOYE_ROLE = '';
    IS_CHEF_SERVICE_ROLE = '';
    IS_DG_ROLE = '';
    IS_COMPTABILITE_ROLE = '';
    IS_PARAMETRAGE_MANAGER_ROLE = '';
    IS_CHEF_PERSONNEL_ROLE = '';
    IS_CHEF_COMPTABILITE_ROLE = '';
    IS_ADMIN_ROLE = '';
    keycloakUser = '';
    constructor(
        public app: AppComponent,
        public confirmationService: ConfirmationService,
        public keycloakService: KeycloakService,
    ) {}
    ngOnInit() {
       // this.toInitFunctions();
            this.model = [
                {label: 'LOGIN', icon: 'pi pi-star-fill', routerLink: ['/Login']},
                {
                    label: 'PARAMETRAGE', icon: 'pi pi-fw pi-star', routerLink: ['/parametre'],
                    items: [
                        {label: 'SERVICE', icon: 'pi pi-building', routerLink: ['/parametre/services']},
                        {label: 'SECTION', icon: 'pi pi-building', routerLink: ['/parametre/section']},
                        {label: 'AGENT', icon: 'pi pi-building', routerLink: ['/parametre/agent' + '']},
                        {label: 'DIRECTION', icon: 'pi pi-building', routerLink: ['/parametre/direction']},
                        {label: 'LOGIN', icon: 'pi pi-star-fill', routerLink: ['parametre/Login']},
                        {label: 'ANNEE EXERCICE ', icon: 'pi pi-star-fill', routerLink: ['parametre/exercice']},
                    ]

                },                {
                    label: 'EVALUATION', icon: 'pi pi-fw pi-star', routerLink: ['/parametre'],
                    items: [
                        {label: 'INFO', icon: 'pi pi-star-fill', routerLink: ['info/personnel']},
                    ]

                },
            ];

    }
    getUserLogedRole(): void {
        this.userRole = this.keycloakService.getUserRoles();
        this.IS_EMPLOYE_ROLE = this.userRole.find( role => role.startsWith(this.IS_EMPLOYE));
        this.IS_CHEF_SERVICE_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_SERVICE));
        this.IS_DG_ROLE = this.userRole.find( role => role.startsWith(this.IS_DG) );
        this.IS_COMPTABILITE_ROLE = this.userRole.find( role => role.startsWith(this.IS_COMPTABILITE));
        this.IS_PARAMETRAGE_MANAGER_ROLE = this.userRole.find( role => role.startsWith(this.IS_PARAMETRAGE_MANAGER));
        this.IS_CHEF_PERSONNEL_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_PERSONNEL));
        this.IS_CHEF_COMPTABILITE_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_COMPTABILITE));
        this.IS_ADMIN_ROLE = this.userRole.find( role => role.startsWith(this.IS_ADMIN));
    }
    getUserNameLoged(): void {
        this.keycloakUser = this.keycloakService.getUsername();
    }

    canActivate(): void {
        this.isLogin = !!this.keycloakService.isLoggedIn();
    }
    toInitFunctions(): void {
        this.getUserLogedRole();
        this.getUserNameLoged();
        this.canActivate();
    }


}

import {Component, OnInit} from '@angular/core';
import { trigger, style, transition, animate, AnimationEvent } from '@angular/animations';
import {ConfirmationService, MessageService} from 'primeng/api';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import {KeycloakService} from 'keycloak-angular';
import {HttpResponse} from '@angular/common/http';
import isOnline from 'is-online';
import {LoginService} from './pages/services/login/login.service';
import { AuthService } from './pages/services/auth/auth.service';
@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss'],
    animations: [
        trigger('topbarActionPanelAnimation', [
            transition(':enter', [
                style({opacity: 0, transform: 'scaleY(0.8)'}),
                animate('.12s cubic-bezier(0, 0, 0.2, 1)', style({ opacity: 1, transform: '*' })),
              ]),
              transition(':leave', [
                animate('.1s linear', style({ opacity: 0 }))
              ])
        ])
    ]
})
export class AppTopBarComponent implements OnInit {
   /* constructor(
                public confirmationService: ConfirmationService,
                public appMain: AppMainComponent,
                public app: AppComponent,
                private authServiceSS: LoginService,
                private authService: AuthService,
                public keycloakService: KeycloakService,
                public messageService: MessageService,
    ) {}
    keycloakUser = '';
    userRole: string[] = [];
    IS_EMPLOYE = 'IS_EMPLOYE';
    IS_CHEF_SERVICE = 'IS_CHEF_SERVICE';
    IS_CHEF_COMPTABILITE = 'IS_CHEF_COMPTABILITE';
    IS_DG = 'IS_DG';
    IS_COMPTABILITE = 'IS_COMPTABILITE';
    IS_PARAMETRAGE_MANAGER = 'IS_PARAMETRAGE_MANAGER';
    IS_CHEF_PERSONNEL = 'IS_CHEF_PERSONNEL';
    IS_ADMIN = 'IS_ADMIN';
    IS_EMPLOYE_ROLE = '';
    IS_CHEF_SERVICE_ROLE = '';
    IS_DG_ROLE = '';
    IS_COMPTABILITE_ROLE = '';
    IS_CHEF_COMPTABILITE_ROLE = '';
    IS_PARAMETRAGE_MANAGER_ROLE = '';
    IS_CHEF_PERSONNEL_ROLE = '';
    IS_ADMIN_ROLE = '';
    isLogin = false;
    nomComplet = '';
    lastName = '';
    userName: any;
    isCliked = false;
    allNeedsSendedByAgentToChefServiceLength = 0;
    allNeedsSendedByChefServiceToDgLenght = 0;
    allNeedsSendedByDgToChefComptableLenght = 0;
    allNeedsSendedByDgToCaisseLenght = 0;
    isChefServiceRole = false;
    isAgentRole = false;
    networkStatus = false;
    display = true;



    activeItem: number;
    ngOnInit(): void {
      // this.toInitFunctions();

        const user = this.authService.getCurrentUser();

        if (user) {
            this.nomComplet = user.nomComplet;
           // this.lastName = user.nom;
        }

    }
    networkChecked(){
        (async () => {
            this.networkStatus = await isOnline();
            if (this.networkStatus === true){
                this.display = false;
            }
            console.log('status',  this.networkStatus);
        })();
    }
    onLogout(): void {
        this.keycloakService.logout().then(() => this.keycloakService.clearToken());
    }
    onCkliced(event: Event): void {
        this.isCliked = true;
        this.onDoLogout(event);
    }
    onDoLogout(event: Event): void {
        if (this.isCliked){
            this.confirmationService.confirm(
                {
                    target: event.target,
                    message: ' Êtes-vous sûr de vouloir vous déconnecter ?' +  this.nomComplet,
                    accept: () => {
                        this.onLogout();
                    }
                });
        }
    }
    getUserLogedRole(): void {
        this.userRole = this.keycloakService.getUserRoles();
        this.IS_EMPLOYE_ROLE = this.userRole.find( role => role.startsWith(this.IS_EMPLOYE));
        this.IS_CHEF_SERVICE_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_SERVICE));
        this.IS_DG_ROLE = this.userRole.find( role => role.startsWith(this.IS_DG) );
        this.IS_COMPTABILITE_ROLE = this.userRole.find( role => role.startsWith(this.IS_COMPTABILITE));
        this.IS_PARAMETRAGE_MANAGER_ROLE = this.userRole.find( role => role.startsWith(this.IS_PARAMETRAGE_MANAGER));
        this.IS_CHEF_PERSONNEL_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_PERSONNEL));
    }
    getUserNameLoged(): void {
        this.keycloakUser = this.keycloakService.getUsername();
        this.keycloakService.loadUserProfile().then(profile => {
          this.nomComplet = profile.firstName;
          this.lastName = profile.lastName;
           // console.log(profile['attributes']); //gives you array of all attributes of user, extract what you need
        });
    }

    canActivate(): void {
        this.isLogin = !!this.keycloakService.isLoggedIn();
    }
    toInitFunctions(): void {
        this.getUserLogedRole();
        this.getUserNameLoged();
        this.canActivate();
        this.networkChecked();
    }
   
}
*/

    constructor(
        public confirmationService: ConfirmationService,
        public appMain: AppMainComponent,
        public app: AppComponent,
        private authService: AuthService,
        public messageService: MessageService,
    ) {}

    // Propriétés
    nomComplet = '';
    isCliked = false;
    allNeedsSendedByChefServiceToDgLenght = 0;
    IS_DG_ROLE = '';

    ngOnInit(): void {
        // Récupérer l'utilisateur connecté
        const user = this.authService.getCurrentUser();

        if (user) {
            // Adapter selon la structure de votre LoginResponse
            this.nomComplet = user.nomComplet || user.email || 'Utilisateur';
        }
    }

    /**
     * Méthode UNIQUE de déconnexion avec confirmation
     */
    // app.topbar.component.ts

    testLogout(): void {
        console.log('TEST - Déconnexion directe');
        this.authService.logout();
    }
    logout(): void {
        console.log('1. Bouton déconnexion cliqué');


                // Appel explicite
                this.authService.logout();

                console.log('4. Après authService.logout()');

                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Déconnexion réussie',
                    life: 2000
                });
            }



}

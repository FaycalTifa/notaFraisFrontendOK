import {Component, OnInit} from '@angular/core';
import { trigger, style, transition, animate, AnimationEvent } from '@angular/animations';
import {ConfirmationService, MessageService} from 'primeng/api';
import { AppComponent } from './app.component';
import { AppMainComponent } from './app.main.component';
import {KeycloakService} from 'keycloak-angular';
import {HttpResponse} from '@angular/common/http';
import isOnline from 'is-online';
import {LoginService} from './pages/services/login/login.service';
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
    constructor(
                public confirmationService: ConfirmationService,
                public appMain: AppMainComponent,
                public app: AppComponent,
                private authService: LoginService,
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
    firstName = '';
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


    /*
    onSeeNotifications(need: INeed[]) : any{
        this.needService.sawNotifications(need).subscribe((res: HttpResponse<INeed[]>) => {
            const data = res.body;
            data.forEach( isSawNotifications => isSawNotifications.isSaw = true)
            console.log("external need", data);

        });
        console.log("external need", need);
    }*/


/*    this.entreeService.deleteAll(this.selectedentrees).subscribe((res: HttpResponse<IEntree[]>) => {
    window.console.log(res.body);
    this.loadAll();
});
    */

    activeItem: number;
    ngOnInit(): void {
      // this.toInitFunctions();
        this.authService.loadUserFromStorage(); // charger au démarrage

        this.authService.user$.subscribe(user => {
            if (user) {
                this.firstName = user.username;
                this.lastName = user.password;
            }
        });

        const user = localStorage.getItem('username');
        if (user) {
            this.firstName = user;
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
                    message: ' Êtes-vous sûr de vouloir vous déconnecter ?' +  this.firstName,
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
          this.firstName = profile.firstName;
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
    // model: MegaMenuItem[] = [
    //     {
    //         label: 'UI KIT',
    //         items: [
    //             [
    //                 {
    //                     label: 'UI KIT 1',
    //                     items: [
    //                         { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
    //                         { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
    //                         { label: 'Float Label', icon: 'pi pi-fw pi-bookmark', routerLink: ['/uikit/floatlabel'] },
    //                         { label: 'Button', icon: 'pi pi-fw pi-mobile', routerLink: ['/uikit/button'] },
    //                         { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] }
    //                     ]
    //                 }
    //             ],
    //             [
    //                 {
    //                     label: 'UI KIT 2',
    //                     items: [
    //                         { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
    //                         { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
    //                         { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
    //                         { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
    //                         { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] }
    //                     ]
    //                 }
    //             ],
    //             [
    //                 {
    //                     label: 'UI KIT 3',
    //                     items: [
    //                         { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
    //                         { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
    //                         { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
    //                         { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
    //                         { label: 'Misc', icon: 'pi pi-fw pi-circle-off', routerLink: ['/uikit/misc'] }
    //                     ]
    //                 }
    //             ]
    //         ]
    //     },
    //     {
    //         label: 'UTILITIES',
    //         items: [
    //             [
    //                 {
    //                     label: 'UTILITIES 1',
    //                     items: [
    //                         { label: 'Icons', icon: 'pi pi-fw pi-prime', routerLink: ['utilities/icons'] },
    //                         { label: 'PrimeFlex', icon: 'pi pi-fw pi-desktop', url: 'https://www.primefaces.org/primeflex/', target: '_blank' }
    //                     ]
    //                 }
    //             ],

    //         ]
    //     }
    // ];
    // @ViewChild('searchInput') searchInputViewChild: ElementRef;
    // onSearchAnimationEnd(event: AnimationEvent) {
    //     switch(event.toState) {
    //         case 'visible':
    //             this.searchInputViewChild.nativeElement.focus();
    //         break;
    //     }
    // }
}

import {Component, AfterViewInit, Renderer2, OnInit, OnDestroy} from '@angular/core';
import { MenuService } from './app.menu.service';
import {ConfirmationService, MessageService, PrimeNGConfig} from 'primeng/api';
import { AppComponent } from './app.component';
import {KeycloakService} from 'keycloak-angular';
import {LoginService} from './pages/services/login/login.service';

@Component({
    selector: 'app-main',
    templateUrl: './app.main.component.html',
    styleUrls: ['./app.component.scss'] // ou .scss
})
export class AppMainComponent implements AfterViewInit, OnInit, OnDestroy {

    topbarMenuActive: boolean;

    menuActive: boolean;

    staticMenuDesktopInactive: boolean;

    mobileMenuActive: boolean;

    menuClick: boolean;

    mobileTopbarActive: boolean;

    topbarRightClick: boolean;

    topbarItemClick: boolean;

    activeTopbarItem: string;

    documentClickListener: () => void;

    configActive: boolean;

    configClick: boolean;

    rightMenuActive: boolean;

    menuHoverActive = false;

    searchClick = false;

    search = false;

    currentInlineMenuKey: string;

    firstName = '';
    lastName = '';

    inlineMenuActive: any[] = [];

    inlineMenuClick: boolean;

    isLogin = false;
    userRole: string[] = [];
    IS_EMPLOYE = 'IS_EMPLOYE';
    IS_CHEF_SERVICE = 'IS_CHEF_SERVICE';
    IS_DG = 'IS_DG';
    IS_COMPTABILITE = 'IS_COMPTABILITE';
    IS_PARAMETRAGE_MANAGER = 'IS_PARAMETRAGE_MANAGER';
    IS_CHEF_PERSONNEL = 'IS_CHEF_PERSONNEL';
    IS_CHEF_COMPTABILITE = 'IS_CHEF_COMPTABILITE';
    IS_EMPLOYE_ROLE = '';
    IS_CHEF_SERVICE_ROLE = '';
    IS_DG_ROLE = '';
    IS_COMPTABILITE_ROLE = '';
    IS_PARAMETRAGE_MANAGER_ROLE = '';
    IS_CHEF_PERSONNEL_ROLE = '';
    IS_CHEF_COMPTABILITE_ROLE = '';
    keycloakUser = '';

    constructor(
        public confirmationService: ConfirmationService,
        public keycloakService: KeycloakService,
        private authService: LoginService,
        public renderer: Renderer2, private menuService: MenuService, private primengConfig: PrimeNGConfig,
        public app: AppComponent) { }

    ngOnInit() {
       // this.toInitFunctions();
        this.menuActive = this.isStatic() && !this.isMobile();
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
    getUserLogedRole(): void {
        this.userRole = this.keycloakService.getUserRoles();
        this.IS_EMPLOYE_ROLE = this.userRole.find( role => role.startsWith(this.IS_EMPLOYE));
        this.IS_CHEF_SERVICE_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_SERVICE));
        this.IS_DG_ROLE = this.userRole.find( role => role.startsWith(this.IS_DG) );
        this.IS_COMPTABILITE_ROLE = this.userRole.find( role => role.startsWith(this.IS_COMPTABILITE));
        this.IS_PARAMETRAGE_MANAGER_ROLE = this.userRole.find( role => role.startsWith(this.IS_PARAMETRAGE_MANAGER));
        this.IS_CHEF_PERSONNEL_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_PERSONNEL));
        this.IS_CHEF_COMPTABILITE_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_COMPTABILITE));
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


    ngAfterViewInit() {
        // hides the horizontal submenus or top menu if outside is clicked
        this.documentClickListener = this.renderer.listen('body', 'click', () => {
            if (!this.topbarItemClick) {
                this.activeTopbarItem = null;
                this.topbarMenuActive = false;
            }

            if (!this.menuClick && (this.isHorizontal() || this.isSlim())) {
                this.menuService.reset();
            }

            if (this.configActive && !this.configClick) {
                this.configActive = false;
            }

            if (!this.menuClick) {
                if (this.mobileMenuActive) {
                    this.mobileMenuActive = false;
                }

                if (this.isOverlay()) {
                    this.menuActive = false;
                }

                this.menuHoverActive = false;
                this.unblockBodyScroll();
            }

            if (!this.searchClick) {
                this.search = false;
            }

            if (this.inlineMenuActive[this.currentInlineMenuKey] && !this.inlineMenuClick) {
                this.inlineMenuActive[this.currentInlineMenuKey] = false;
            }

            this.inlineMenuClick = false;
            this.searchClick = false;
            this.configClick = false;
            this.topbarItemClick = false;
            this.topbarRightClick = false;
            this.menuClick = false;
        });
    }

    onMenuButtonClick(event) {
        this.menuActive = !this.menuActive;
        this.topbarMenuActive = false;
        this.topbarRightClick = true;
        this.menuClick = true;

        if (this.isDesktop()) {
            this.staticMenuDesktopInactive = !this.staticMenuDesktopInactive;
        } else {
            this.mobileMenuActive = !this.mobileMenuActive;
            if (this.mobileMenuActive) {
                this.blockBodyScroll();
            } else {
                this.unblockBodyScroll();
            }
        }

        event.preventDefault();
    }

    onTopbarMobileButtonClick(event) {
        this.mobileTopbarActive = !this.mobileTopbarActive;
        event.preventDefault();
    }

    onRightMenuButtonClick(event) {
        this.rightMenuActive = !this.rightMenuActive;
        event.preventDefault();
    }

    onMenuClick($event) {
        this.menuClick = true;

        if (this.inlineMenuActive[this.currentInlineMenuKey] && !this.inlineMenuClick) {
            this.inlineMenuActive[this.currentInlineMenuKey] = false;
        }
    }

    onSearchKeydown(event) {
        if (event.keyCode === 27) {
            this.search = false;
        }
    }

    onInlineMenuClick(event, key) {
        if (key !== this.currentInlineMenuKey) {
            this.inlineMenuActive[this.currentInlineMenuKey] = false;
        }

        this.inlineMenuActive[key] = !this.inlineMenuActive[key];
        this.currentInlineMenuKey = key;
        this.inlineMenuClick = true;
    }

    onTopbarItemClick(event, item) {
        this.topbarItemClick = true;

        if (this.activeTopbarItem === item) {
            this.activeTopbarItem = null;
        }
        else {
            this.activeTopbarItem = item;
        }

        if (item === 'search') {
            this.search = !this.search;
            this.searchClick = !this.searchClick;
        }

        event.preventDefault();
    }

    onTopbarSubItemClick(event) {
        event.preventDefault();
    }

    onRTLChange(event) {
        this.app.isRTL = event.checked;
    }

    onRippleChange(event) {
        this.app.ripple = event.checked;
        this.primengConfig.ripple = event.checked;
    }

    onConfigClick(event) {
        this.configClick = true;
    }

    isDesktop() {
        return window.innerWidth > 991;
    }

    isMobile() {
        return window.innerWidth <= 991;
    }

    isOverlay() {
        return this.app.menuMode === 'overlay';
    }

    isStatic() {
        return this.app.menuMode === 'static';
    }

    isHorizontal() {
        return this.app.menuMode === 'horizontal';
    }

    isSlim() {
        return this.app.menuMode === 'slim';
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' +
                'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    ngOnDestroy() {
        if (this.documentClickListener) {
            this.documentClickListener();
        }
    }
}

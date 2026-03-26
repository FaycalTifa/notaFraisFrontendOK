import {APP_INITIALIZER, LOCALE_ID, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {BrowserModule} from '@angular/platform-browser';
import {DatePipe, HashLocationStrategy, LocationStrategy} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppRoutingModule} from './app-routing.module';

import {AccordionModule} from 'primeng/accordion';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {AvatarModule} from 'primeng/avatar';
import {AvatarGroupModule} from 'primeng/avatargroup';
import {BadgeModule} from 'primeng/badge';
import {BreadcrumbModule} from 'primeng/breadcrumb';
import {ButtonModule} from 'primeng/button';
import {CalendarModule} from 'primeng/calendar';
import {CardModule} from 'primeng/card';
import {CarouselModule} from 'primeng/carousel';
import {CascadeSelectModule} from 'primeng/cascadeselect';
import {ChartModule} from 'primeng/chart';
import {CheckboxModule} from 'primeng/checkbox';
import {ChipModule} from 'primeng/chip';
import {ChipsModule} from 'primeng/chips';
import {CodeHighlighterModule} from 'primeng/codehighlighter';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {DialogModule} from 'primeng/dialog';
import {ConfirmPopupModule} from 'primeng/confirmpopup';
import {ColorPickerModule} from 'primeng/colorpicker';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DataViewModule} from 'primeng/dataview';

import {DividerModule} from 'primeng/divider';
import {DropdownModule} from 'primeng/dropdown';
import {FieldsetModule} from 'primeng/fieldset';
import {FileUploadModule} from 'primeng/fileupload';
import {FullCalendarModule} from '@fullcalendar/angular';
import {GalleriaModule} from 'primeng/galleria';
import {ImageModule} from 'primeng/image';
import {InplaceModule} from 'primeng/inplace';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputMaskModule} from 'primeng/inputmask';
import {InputSwitchModule} from 'primeng/inputswitch';
import {InputTextModule} from 'primeng/inputtext';
import {InputTextareaModule} from 'primeng/inputtextarea';
import {KnobModule} from 'primeng/knob';
import {LightboxModule} from 'primeng/lightbox';
import {ListboxModule} from 'primeng/listbox';
import {MegaMenuModule} from 'primeng/megamenu';
import {MenuModule} from 'primeng/menu';
import {MenubarModule} from 'primeng/menubar';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import {MultiSelectModule} from 'primeng/multiselect';
import {OrderListModule} from 'primeng/orderlist';
import {OrganizationChartModule} from 'primeng/organizationchart';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {PaginatorModule} from 'primeng/paginator';
import {PanelModule} from 'primeng/panel';
import {PanelMenuModule} from 'primeng/panelmenu';
import {PasswordModule} from 'primeng/password';
import {PickListModule} from 'primeng/picklist';
import {ProgressBarModule} from 'primeng/progressbar';
import {RadioButtonModule} from 'primeng/radiobutton';
import {RatingModule} from 'primeng/rating';
import {RippleModule} from 'primeng/ripple';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {ScrollTopModule} from 'primeng/scrolltop';
import {SelectButtonModule} from 'primeng/selectbutton';
import {SidebarModule} from 'primeng/sidebar';
import {SkeletonModule} from 'primeng/skeleton';
import {SlideMenuModule} from 'primeng/slidemenu';
import {SliderModule} from 'primeng/slider';
import {SplitButtonModule} from 'primeng/splitbutton';
import {SplitterModule} from 'primeng/splitter';
import {StepsModule} from 'primeng/steps';
import {TabMenuModule} from 'primeng/tabmenu';
import {TableModule} from 'primeng/table';
import {TabViewModule} from 'primeng/tabview';
import {TagModule} from 'primeng/tag';
import {TerminalModule} from 'primeng/terminal';
import {TieredMenuModule} from 'primeng/tieredmenu';
import {TimelineModule} from 'primeng/timeline';
import {ToastModule} from 'primeng/toast';
import {ToggleButtonModule} from 'primeng/togglebutton';
import {ToolbarModule} from 'primeng/toolbar';
import {TooltipModule} from 'primeng/tooltip';
import {TreeModule} from 'primeng/tree';
import {TreeTableModule} from 'primeng/treetable';
import {VirtualScrollerModule} from 'primeng/virtualscroller';

import {AppComponent} from './app.component';
import {AppMainComponent} from './app.main.component';
import {AppConfigComponent} from './app.config.component';
import {AppMenuComponent} from './app.menu.component';
import {AppMenuitemComponent} from './app.menuitem.component';

import {MenuService} from './app.menu.service';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { PosteComponent } from './pages/components/poste/poste.component';
import { ServiceComponent } from './pages/components/service/service.component';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import {NgxPrintModule} from 'ngx-print';
registerLocaleData(localeFr, 'fr');
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AppTopBarComponent } from './app.topbar.component';
import { LoginComponent } from './pages/components/login/login.component';
import {ConfirmationService, MessageService} from 'primeng/api';
import {KeycloakService} from 'keycloak-angular';
import { CreateUserComponent } from './pages/components/create-user/create-user.component';
import { DirectionComponent } from './pages/components/direction/direction.component';
import { SectionComponent } from './pages/components/section/section.component';
import { ServiceEntiteComponent } from './pages/components/service-entite/service-entite.component';
import { AgentComponent } from './pages/components/agent/agent.component';
import { InfoEntrepriseComponent } from './pages/components/info-entreprise/info-entreprise.component';
import { AnneeExerciceComponent } from './pages/components/annee-exercice/annee-exercice.component';
import { EvaluationComponent } from './pages/components/evaluation/evaluation.component';
import { JwtModule } from '@auth0/angular-jwt';
import { ListeCollaborateursComponent } from './pages/components/liste-collaborateurs/liste-collaborateurs.component';
import { FormCollaborateurComponent } from './pages/components/form-collaborateur/form-collaborateur.component';
import { HierarchieViewComponent } from './pages/components/hierarchie-view/hierarchie-view.component';
import { RoleLabelPipe } from './pages/pipe/RoleLabel/role-label.pipe';
import { ListeEvaluationsComponent } from './pages/components/liste-evaluations/liste-evaluations.component';
import { AuthIntercepInterceptor } from './pages/interceptor/authInterceptor/auth-intercep.interceptor';
import { DetailsCollaborateurComponent } from './pages/components/details-collaborateur/details-collaborateur.component';
import { DashboardComponent } from './pages/components/dashboard/dashboard.component';
import { RouterModule } from '@angular/router';
import { CollaborateurEvaluationsComponentComponent } from './pages/components/collaborateur-evaluations-component/collaborateur-evaluations-component.component';
import { SafeUrlPipePipe } from './pages/pipe/SafeUrlPipe/safe-url-pipe.pipe';
import { AnnulationDialogComponent } from './pages/components/annulation-dialog/annulation-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
import { ChangePasswordComponent } from './pages/components/change-password/change-password.component';
import { FormulaireEvaluationComponent } from './pages/components/formulaire-evaluation/formulaire-evaluation.component';
import { FooterComponent } from './footer/footer.component';

FullCalendarModule.registerPlugins([
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin
]);

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule,
        AccordionModule,
        AutoCompleteModule,
        AvatarModule,
        AvatarGroupModule,
        BadgeModule,
        BreadcrumbModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        CarouselModule,
        CascadeSelectModule,
        ReactiveFormsModule,
        JwtModule,
        ChartModule,
        CheckboxModule,
        RouterModule,
        InputTextareaModule,
        ChipModule,
        ChipsModule,
        CodeHighlighterModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ColorPickerModule,
        ContextMenuModule,
        DataViewModule,
        DialogModule,
        DividerModule,
        DropdownModule,
        FieldsetModule,
        FileUploadModule,
        FullCalendarModule,
        GalleriaModule,
        ImageModule,
        InplaceModule,
        InputNumberModule,
        InputMaskModule,
        InputSwitchModule,
        InputTextModule,
        InputTextareaModule,
        KnobModule,
        LightboxModule,
        ListboxModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        OrderListModule,
        OrganizationChartModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        PanelMenuModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        RadioButtonModule,
        RatingModule,
        RippleModule,
        ScrollPanelModule,
        ScrollTopModule,
        SelectButtonModule,
        SidebarModule,
        SkeletonModule,
        SlideMenuModule,
        SliderModule,
        SplitButtonModule,
        SplitterModule,
        StepsModule,
        TableModule,
        TabMenuModule,
        TabViewModule,
        TagModule,
        TerminalModule,
        TimelineModule,
        TieredMenuModule,
        ToastModule,
        ToggleButtonModule,
        ToolbarModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        VirtualScrollerModule,
        NgxPrintModule,
    ],
    declarations: [
        AppComponent,
        AppMainComponent,
        AppTopBarComponent,
        AppConfigComponent,
        AppMenuComponent,
        AppMenuitemComponent,
        PosteComponent,
        ServiceComponent,
        LoginComponent,
        CreateUserComponent,
        DirectionComponent,
        SectionComponent,
        ServiceEntiteComponent,
        AgentComponent,
        InfoEntrepriseComponent,
        AnneeExerciceComponent,
        EvaluationComponent,
        ListeCollaborateursComponent,
        FormCollaborateurComponent,
        HierarchieViewComponent,
        RoleLabelPipe,
        ListeEvaluationsComponent,
        FormulaireEvaluationComponent,
        DetailsCollaborateurComponent,
        DashboardComponent,
        CollaborateurEvaluationsComponentComponent,
        SafeUrlPipePipe,
        AnnulationDialogComponent,
        ChangePasswordComponent,
        FooterComponent,
        
    ],
    providers: [
        {provide: LocationStrategy, useClass: HashLocationStrategy},
        MessageService,
        MenuService,
        DialogService,
        ConfirmationService,
        DatePipe,
        [ { provide: LOCALE_ID, useValue: 'fr-FR' }],
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthIntercepInterceptor, // ← Utilisez le nom exact de votre classe
            multi: true
        },
        KeycloakService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}

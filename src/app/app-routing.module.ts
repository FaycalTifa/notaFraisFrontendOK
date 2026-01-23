import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import { AppMainComponent } from './app.main.component';
import {LoginComponent} from './pages/components/login/login.component';
import {PosteComponent} from './pages/components/poste/poste.component';
import {ServiceComponent} from './pages/components/service/service.component';
import {CreateUserComponent} from './pages/components/create-user/create-user.component';
import {ServiceEntiteComponent} from './pages/components/service-entite/service-entite.component';
import {DirectionComponent} from './pages/components/direction/direction.component';
import {ServiceEntiteService} from './pages/services/ServiceEntite/service-entite.service';
import {AgentComponent} from './pages/components/agent/agent.component';
import {SectionComponent} from './pages/components/section/section.component';
import { InfoEntrepriseComponent } from './pages/components/info-entreprise/info-entreprise.component';
import { AnneeExerciceComponent } from './pages/components/annee-exercice/annee-exercice.component';
import { EvaluationComponent } from './pages/components/evaluation/evaluation.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            // route par défaut → login
            { path: '', redirectTo: 'login', pathMatch: 'full' },

            // login sans AppMainComponent (donc sans menu)
            { path: 'login', component: LoginComponent },
            { path: 'create-users', component: CreateUserComponent },

            // routes principales avec AppMainComponent (menu inclus)
            {
                path: '', component: AppMainComponent,
                children: [
                    { path: 'parametre/services', component: ServiceEntiteComponent },
                    { path: 'parametre/agent', component: AgentComponent },
                    { path: 'parametre/section', component: SectionComponent },
                    { path: 'parametre/direction', component: DirectionComponent },
                    { path: 'parametre/exercice', component: AnneeExerciceComponent },
                    { path: 'parametre/evaluation', component: EvaluationComponent },
                    { path: 'info/personnel', component: InfoEntrepriseComponent },
                ]
            },

            // page not found → retour login
            { path: '**', redirectTo: 'login' },
        ], { scrollPositionRestoration: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }

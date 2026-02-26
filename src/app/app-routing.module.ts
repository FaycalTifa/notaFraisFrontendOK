import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import { AppMainComponent } from './app.main.component';
import {LoginComponent} from './pages/components/login/login.component';
import {PosteComponent} from './pages/components/poste/poste.component';
import {ServiceComponent} from './pages/components/service/service.component';
import {ServiceEntiteComponent} from './pages/components/service-entite/service-entite.component';
import {DirectionComponent} from './pages/components/direction/direction.component';
import {ServiceEntiteService} from './pages/services/ServiceEntite/service-entite.service';
import {AgentComponent} from './pages/components/agent/agent.component';
import {SectionComponent} from './pages/components/section/section.component';
import { InfoEntrepriseComponent } from './pages/components/info-entreprise/info-entreprise.component';
import { AnneeExerciceComponent } from './pages/components/annee-exercice/annee-exercice.component';
import { EvaluationComponent } from './pages/components/evaluation/evaluation.component';
import { ListeCollaborateursComponent } from './pages/components/liste-collaborateurs/liste-collaborateurs.component';
import { FormCollaborateurComponent } from './pages/components/form-collaborateur/form-collaborateur.component';
import { ListeEvaluationsComponent } from './pages/components/liste-evaluations/liste-evaluations.component';
import { FormulaireEvaluationComponent } from './pages/components/formulaire-evaluation/formulaire-evaluation.component';
import { DashboardComponent } from './pages/components/dashboard/dashboard.component';
import { CollaborateurEvaluationsComponentComponent } from './pages/components/collaborateur-evaluations-component/collaborateur-evaluations-component.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            // route par défaut → login
            { path: '', redirectTo: 'collaborateur', pathMatch: 'full' },
            // login sans AppMainComponent (donc sans menu)
            { path: 'login', component: LoginComponent },
            { path: 'creer-collaborateur', component: FormCollaborateurComponent },
            { path: 'List Direction', component: DirectionComponent  },

            // routes principales avec AppMainComponent (menu inclus)
            {
                path: '', component: AppMainComponent,
                children: [
                    { path: 'dashboard', component: DashboardComponent },
                    { path: 'collaborateur', component: ListeCollaborateursComponent },
                    { path: 'liste-evaluations', component: ListeEvaluationsComponent },

                    // Routes pour les évaluations (CORRIGÉES)
                    { path: 'evaluations/nouveau', component: FormulaireEvaluationComponent },
                    { path: 'evaluations/:id', component: FormulaireEvaluationComponent },  // ← Voir détails
                    { path: 'mon-levaluations', component: CollaborateurEvaluationsComponentComponent },  // ← Voir détails
                    { path: 'evaluations/editer/:id', component: FormulaireEvaluationComponent },  // ← Modifier                    { path: 'parametre/exercice', component: AnneeExerciceComponent },
                    { path: 'form-evaluation', component: FormulaireEvaluationComponent },
                    { path: 'parametre/direction', component: DirectionComponent },
                    { path: 'parametre/section', component: SectionComponent },
                    { path: 'parametre/service', component: ServiceComponent },
                ]
            },

            // page not found → retour login
            { path: '**', redirectTo: 'login' },
        ], { scrollPositionRestoration: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }

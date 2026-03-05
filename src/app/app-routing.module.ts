import { RouterModule } from '@angular/router';
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
import { RoleGuardsGuard } from './pages/guards/roleGuards/role-guards.guard';
import { AuthGuardsGuard } from './pages/guards/authGuards/auth-guards.guard';

// @ts-ignore
@NgModule({
    imports: [
        RouterModule.forRoot([
            // Route publique - login (sans menu)
            { path: 'login', component: LoginComponent },

            // Routes protégées avec AppMainComponent (menu inclus)
            {
                path: '', component: AppMainComponent,
                canActivate: [AuthGuardsGuard], // Vérifie que l'utilisateur est connecté
                children: [
                    // Dashboard - accessible à tous les utilisateurs connectés
                    {
                        path: 'dashboard',
                        component: DashboardComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION', 'COLLABORATEUR'] }
                    },

                    // Collaborateurs - accessible aux responsables
                    {
                        path: 'collaborateur',
                        component: ListeCollaborateursComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION'] }
                    },
                    {
                        path: 'creer-collaborateur',
                        component: FormCollaborateurComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN'] } // Seul l'admin peut créer
                    },

                    // Évaluations
                    {
                        path: 'liste-evaluations',
                        component: ListeEvaluationsComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION'] }
                    },
                    {
                        path: 'evaluations/nouveau',
                        component: FormulaireEvaluationComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION'] }
                    },
                    {
                        path: 'evaluations/:id',
                        component: FormulaireEvaluationComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION', 'COLLABORATEUR'] }
                    },
                    {
                        path: 'evaluations/editer/:id',
                        component: FormulaireEvaluationComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION'] }
                    },
                    {
                        path: 'form-evaluation',
                        component: FormulaireEvaluationComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION'] }
                    },
                    {
                        path: 'mon-levaluations',
                        component: CollaborateurEvaluationsComponentComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION', 'COLLABORATEUR'] }
                    },

                    // Paramétrage - accessible seulement à l'admin
                    {
                        path: 'parametre/direction',
                        component: DirectionComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN'] }
                    },
                    {
                        path: 'parametre/service',
                        component: ServiceComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN'] }
                    },
                    {
                        path: 'parametre/section',
                        component: SectionComponent,
                        canActivate: [RoleGuardsGuard],
                        data: { roles: ['ADMIN'] }
                    },
                    {
                        path: 'parametre/exercice',
                        component: AnneeExerciceComponent,
                        canActivate:  [RoleGuardsGuard],
                        data: { roles: ['ADMIN'] }
                    },

                    // Info personnel - accessible à tous
                    {
                        path: 'info/personnel',
                        component: InfoEntrepriseComponent,
                        canActivate:  [RoleGuardsGuard],
                        data: { roles: ['ADMIN', 'DIRECTEUR', 'CHEF_SERVICE', 'CHEF_SECTION', 'COLLABORATEUR'] }
                    },

                    // Redirection par défaut
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
                ]
            },

            // Page non trouvée → redirection vers login
            { path: '**', redirectTo: 'login' },
        ], { scrollPositionRestoration: 'enabled' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }

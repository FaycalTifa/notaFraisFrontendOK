import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {Collaborateur, LoginRequest, Utilisateur} from '../../models/entities/entities';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { Role } from '../../models/enum/role';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {


    credentials: LoginRequest = {
        email: '',
        password: ''
    };
    loading = false;
    submitted = false;      // Pour savoir si le formulaire a été soumis
    errorMessage = '';      // Pour afficher un message d'erreur personnalisé
    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        // ✅ Vérifier si l'utilisateur est déjà connecté
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        }
    }

    onLogin(): void {
        // Validation des champs
        if (!this.credentials.email || !this.credentials.email.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Champ requis',
                detail: 'Veuillez saisir votre email',
                life: 5000
            });
            return;
        }

        if (!this.credentials.password || !this.credentials.password.trim()) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Champ requis',
                detail: 'Veuillez saisir votre mot de passe',
                life: 5000
            });
            return;
        }

        console.log('🔄 Tentative de connexion pour:', this.credentials.email);
        this.loading = true;

        this.authService.login(this.credentials).subscribe({
            next: (response) => {
                console.log('✅ Connexion réussie:', response);
                this.loading = false;

                // Message de bienvenue
                this.messageService.add({
                    severity: 'success',
                    summary: 'Connexion réussie',
                    detail: `Bienvenue ${response.nomComplet || response.email}`,
                    life: 3000
                });

                // Redirection vers le dashboard
                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 500);
            },
            error: (error) => {
                console.error('❌ Erreur de connexion:', error);
                this.loading = false;

                // ✅ Gestion des différents types d'erreurs
                let errorMessage = 'Email ou mot de passe incorrect';
                let errorTitle = 'Échec de connexion';

                // Erreur 401 - Non autorisé
                if (error.status === 401) {
                    errorMessage = 'Email ou mot de passe incorrect. Veuillez réessayer.';
                    errorTitle = 'Authentification échouée';
                }
                // Erreur 400 - Mauvaise requête
                else if (error.status === 400) {
                    errorMessage = 'Données de connexion invalides. Vérifiez vos informations.';
                    errorTitle = 'Données invalides';
                }
                // Erreur 404 - Utilisateur non trouvé
                else if (error.status === 404) {
                    errorMessage = 'Aucun compte trouvé avec cet email.';
                    errorTitle = 'Compte introuvable';
                }
                // Erreur 500 - Erreur serveur
                else if (error.status === 500) {
                    errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
                    errorTitle = 'Erreur technique';
                }
                // Message personnalisé du backend
                else if (error.error && typeof error.error === 'string') {
                    errorMessage = error.error;
                }
                else if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                }
                // Erreur réseau
                else if (error.status === 0) {
                    errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
                    errorTitle = 'Erreur réseau';
                }

                this.messageService.add({
                    severity: 'error',
                    summary: errorTitle,
                    detail: errorMessage,
                    life: 5000,
                    sticky: false
                });

                // ✅ Réinitialiser le mot de passe pour sécurité
                this.credentials.password = '';
            }
        });
    }

    // ✅ Méthode pour réinitialiser le formulaire
    resetForm(): void {
        this.credentials = {
            email: '',
            password: ''
        };
    }

    // login.component.ts

    forgotPassword(): void {
        this.messageService.add({
            severity: 'info',
            summary: 'Mot de passe oublié',
            detail: 'Veuillez contacter votre administrateur pour réinitialiser votre mot de passe.',
            life: 5000
        });
    }
}

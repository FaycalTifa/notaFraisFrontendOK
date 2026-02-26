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

    constructor(
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {

    }

    // ✅ SUPPRIMEZ complètement cette méthode qui cause l'erreur
    // ngOnInit(): void {
    //     throw new Error('Method not implemented.');
    // }

    onLogin(): void {
        // Validation
        if (!this.credentials.email || !this.credentials.password) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Attention',
                detail: 'Veuillez remplir tous les champs'
            });
            return;
        }

        console.log('🔄 Tentative de connexion pour:', this.credentials.email);
        this.loading = true;

        this.authService.login(this.credentials).subscribe({
            next: (response) => {
                console.log('✅ Connexion réussie:', response);
                this.loading = false;

                // Redirection selon le rôle
                if (response.role === 'ADMIN') {
                    this.router.navigate(['/dashboard']);
                } else {
                    this.router.navigate(['/dashboard']);
                }

                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Bienvenue ${response.nomComplet}`
                });
            },
            error: (error) => {
                console.error('❌ Erreur de connexion:', error);
                this.loading = false;

                let errorMessage = 'Email ou mot de passe incorrect';

                if (error.error && typeof error.error === 'string') {
                    errorMessage = error.error;
                } else if (error.error && error.error.message) {
                    errorMessage = error.error.message;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: errorMessage
                });
            }
        });
    }
}

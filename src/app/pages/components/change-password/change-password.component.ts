import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { CollaborateurService } from '../../services/collaborateur/collaborateur.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

    passwordForm: FormGroup;
    loading = false;
    submitted = false;
    currentUser: any;
    showCurrentPassword = false;
    showNewPassword = false;
    showConfirmPassword = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private collaborateurService: CollaborateurService,
        private messageService: MessageService,
        private router: Router
    ) {
        this.currentUser = this.authService.getCurrentUser();
        this.initForm();
    }

    ngOnInit(): void {
        if (!this.currentUser) {
            this.router.navigate(['/login']);
        }
    }

    private initForm(): void {
        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required, Validators.minLength(6)]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validator: this.passwordMatchValidator
        });
    }

    // Validateur personnalisé pour vérifier que les mots de passe correspondent
    passwordMatchValidator(group: FormGroup) {
        const newPassword = group.get('newPassword')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;

        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
            return { passwordMismatch: true };
        }
        return null;
    }

    // Getter pour faciliter l'accès aux champs
    get f() {
        return this.passwordForm.controls;
    }

    onSubmit(): void {
        this.submitted = true;

        if (this.passwordForm.invalid) {
            return;
        }

        this.loading = true;

        const passwordData = {
            currentPassword: this.f['currentPassword'].value,
            newPassword: this.f['newPassword'].value
        };

        // Appel au service pour changer le mot de passe
        this.collaborateurService.changePassword(this.currentUser.id, passwordData).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Votre mot de passe a été modifié avec succès',
                    life: 3000
                });

                this.loading = false;
                this.passwordForm.reset();
                this.submitted = false;

                // Redirection après 2 secondes
                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 2000);
            },
            error: (error) => {
                console.error('Erreur changement mot de passe:', error);

                let errorMessage = 'Erreur lors du changement de mot de passe';

                if (error.status === 400) {
                    errorMessage = error.error?.message || 'Mot de passe actuel incorrect';
                } else if (error.status === 401) {
                    errorMessage = 'Vous n\'êtes pas autorisé à effectuer cette action';
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: errorMessage,
                    life: 5000
                });

                this.loading = false;
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/dashboard']);
    }
}

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {FormBuilder, FormGroup,  Validators } from '@angular/forms';
import { CollaborateurService } from '../../services/collaborateur/collaborateur.service';
import { NotificationService } from '../../services/notification/notification.service';
import { AuthService } from '../../services/auth/auth.service';
import { Collaborateur, CollaborateurRequest, Direction, Section } from '../../models/entities/entities';
// @ts-ignore
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Service } from '../../models/service/service';
import { RoleLabels } from '../../models/enum/role';
import { DirectionService } from '../../services/Direction/direction.service';
import { ServiceService } from '../../services/service/service.service';
import { SectionService } from '../../services/Section/section.service';
import { HierarchieService } from '../../services/Hierarchie/hierarchie.service';

interface DropdownOption {
    label: string;
    value: any;
}
@Component({
  selector: 'app-form-collaborateur',
  templateUrl: './form-collaborateur.component.html',
  styleUrls: ['./form-collaborateur.component.scss']
})
export class FormCollaborateurComponent implements OnInit {
    
    // Formulaire
    collaborateurForm: FormGroup;
    isEdit = false;
    collaborateurId?: number;
    loading = false;
    saving = false;
    activeStep = 0;
    // Ajouter ces propriétés
    uploadedSignature: any = null;
    signatureFileName: string = '';
    signatureBase64: string = '';

    // Options
    roleOptions = Object.entries(RoleLabels).map(([value, label]) => ({ label, value }));

    // Données
    directions: Direction[] = [];
    services: Service[] = [];
    sections: Section[] = [];
    responsables: any[] = [];

    // États des dropdowns
    servicesLoading = false;
    sectionsLoading = false;
    responsablesLoading = false;

    steps = [
        { label: 'Informations personnelles' },
        { label: 'Rôle et organisation' }
    ];

    constructor(
        private fb: FormBuilder,
        private collaborateurService: CollaborateurService,
        private directionService: DirectionService,
        private serviceEntityService: ServiceService,
        private sectionService: SectionService,
        private responsableService: HierarchieService,
        private route: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.loadDirections();
        this.loadAllResponsables();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEdit = true;
                this.collaborateurId = +params['id'];
                this.loadCollaborateur(this.collaborateurId);
            }
        });
    }

    private initForm(): void {
        this.collaborateurForm = this.fb.group({
            nom: ['', [Validators.required, Validators.maxLength(100)]],
            prenoms: ['', [Validators.required, Validators.maxLength(150)]],
            matricule: ['', [Validators.required, Validators.maxLength(50)]],
            email: ['', [Validators.required, Validators.email]],
            telephone: ['', Validators.maxLength(20)],
            dateEmbauche: [new Date()],
            posteActuel: ['', Validators.maxLength(200)],
            role: ['COLLABORATEUR', Validators.required],
            directionId: [null],
            serviceId: [null],
            sectionId: [null],
            responsableDirectId: [null],
            password: ['']
        });

        // Écouter les changements de direction
        this.collaborateurForm.get('directionId')?.valueChanges.subscribe(directionId => {
            if (directionId) {
                this.loadServicesByDirection(directionId);
                this.loadResponsablesByDirection(directionId);
            } else {
                this.services = [];
                this.sections = [];
            }
            this.collaborateurForm.patchValue({
                serviceId: null,
                sectionId: null
            }, { emitEvent: false });
        });

        // Écouter les changements de service
        this.collaborateurForm.get('serviceId')?.valueChanges.subscribe(serviceId => {
            if (serviceId) {
                this.loadSectionsByService(serviceId);
                this.loadResponsablesByService(serviceId);
            } else {
                this.sections = [];
            }
            this.collaborateurForm.patchValue({
                sectionId: null
            }, { emitEvent: false });
        });
    }

    // Méthode pour gérer l'upload de signature
   /* onSignatureUpload(event: any): void {
        const file = event.files[0];
        if (file) {
            this.signatureFileName = file.name;

            // Convertir en Base64
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.signatureBase64 = e.target.result;
                console.log('Signature chargée:', this.signatureFileName);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Signature chargée avec succès'
                });
            };
            reader.readAsDataURL(file);
        }
    }*/

    // Dans form-collaborateur.component.ts

    onSignatureUpload(event: any): void {
        const file = event.files[0];
        if (file) {
            this.signatureFileName = file.name;

            // Afficher un message de traitement
            this.messageService.add({
                severity: 'info',
                summary: 'Traitement',
                detail: 'Compression de la signature en cours...',
                life: 2000
            });

            // Compresser l'image avant de l'afficher
            this.compressAndResizeSignature(file, 300, 100, 0.7).then(compressedBase64 => {
                this.signatureBase64 = compressedBase64;

                // Calculer la réduction de taille
                const originalSize = Math.round(file.size / 1024);
                const compressedSize = Math.round((compressedBase64.length * 3) / 4 / 1024); // Approximation

                console.log(`Signature compressée: ${originalSize}Ko -> ${compressedSize}Ko`);

                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: `Signature compressée (${originalSize}Ko → ${compressedSize}Ko)`,
                    life: 3000
                });
            }).catch(error => {
                console.error('Erreur compression:', error);
                // Fallback: conversion sans compression
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    this.signatureBase64 = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        }
    }

    /**
     * Compresse et redimensionne une signature
     * @param file Le fichier image
     * @param maxWidth Largeur maximale (300px pour l'affichage)
     * @param maxHeight Hauteur maximale (100px pour l'affichage)
     * @param quality Qualité de compression (0.7 = 70%)
     */
    compressAndResizeSignature(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e: any) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    // Créer un canvas
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Calculer les nouvelles dimensions pour que la signature soit lisible
                    // mais pas trop grande
                    const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);

                    canvas.width = width;
                    canvas.height = height;

                    // Dessiner l'image redimensionnée
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir en JPEG avec qualité réduite
                    const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
                    resolve(compressedBase64);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }


// Méthode pour supprimer la signature
    removeSignature(): void {
        this.uploadedSignature = null;
        this.signatureFileName = '';
        this.signatureBase64 = '';
    }

    // Chargement des directions
    loadDirections(): void {
        this.directionService.getAllDirections().subscribe({
            next: (directions) => {
                this.directions = directions;
                console.log('Directions chargées:', directions);
            },
            error: (error) => {
                console.error('Erreur chargement directions:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des directions'
                });
            }
        });
    }

    // Chargement des services par direction
    loadServicesByDirection(directionId: number): void {
        this.servicesLoading = true;
        this.serviceEntityService.getServicesByDirection(directionId).subscribe({
            next: (services) => {
                this.services = services;
                this.servicesLoading = false;
            },
            error: (error) => {
                console.error('Erreur chargement services:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des services'
                });
                this.servicesLoading = false;
            }
        });
    }

    // Chargement des sections par service
    loadSectionsByService(serviceId: number): void {
        this.sectionsLoading = true;
        this.sectionService.getSectionsByService(serviceId).subscribe({
            next: (sections) => {
                this.sections = sections;
                this.sectionsLoading = false;
            },
            error: (error) => {
                console.error('Erreur chargement sections:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Erreur lors du chargement des sections'
                });
                this.sectionsLoading = false;
            }
        });
    }

    // Chargement de tous les responsables
    loadAllResponsables(): void {
        this.responsablesLoading = true;
        this.responsableService.getAllResponsables().subscribe({
            next: (responsables) => {
                this.responsables = responsables;
                this.responsablesLoading = false;
            },
            error: (error) => {
                console.error('Erreur chargement responsables:', error);
                this.responsablesLoading = false;
            }
        });
    }

    // Chargement des responsables par direction
    loadResponsablesByDirection(directionId: number): void {
        this.responsablesLoading = true;
        this.responsableService.getResponsablesByDirection(directionId).subscribe({
            next: (responsables) => {
                this.responsables = responsables;
                this.responsablesLoading = false;
            },
            error: (error) => {
                console.error('Erreur chargement responsables:', error);
                this.responsablesLoading = false;
            }
        });
    }

    // Chargement des responsables par service
    loadResponsablesByService(serviceId: number): void {
        this.responsablesLoading = true;
        this.responsableService.getResponsablesByService(serviceId).subscribe({
            next: (responsables) => {
                // Fusionner avec les responsables existants sans doublons
                const existingIds = new Set(this.responsables.map(r => r.id));
                const newResponsables = responsables.filter(r => !existingIds.has(r.id));
                this.responsables = [...this.responsables, ...newResponsables];
                this.responsablesLoading = false;
            },
            error: (error) => {
                console.error('Erreur chargement responsables:', error);
                this.responsablesLoading = false;
            }
        });
    }

    // Chargement d'un collaborateur pour édition
    loadCollaborateur(id: number): void {
        this.loading = true;
        this.collaborateurService.getCollaborateurById(id).subscribe({
            next: (data) => {
                // Charger les données liées
                if (data.directionId) {
                    this.loadServicesByDirection(data.directionId);
                    this.loadResponsablesByDirection(data.directionId);
                }
                if (data.serviceId) {
                    this.loadSectionsByService(data.serviceId);
                }

                // Mettre à jour le formulaire
                this.collaborateurForm.patchValue({
                    nom: data.nom,
                    prenoms: data.prenoms,
                    matricule: data.matricule,
                    email: data.email,
                    telephone: data.telephone,
                    dateEmbauche: data.dateEmbauche ? new Date(data.dateEmbauche) : new Date(),
                    posteActuel: data.posteActuel,
                    role: data.role,
                    directionId: data.directionId,
                    serviceId: data.serviceId,
                    sectionId: data.sectionId,
                    responsableDirectId: data.responsableDirectId
                });

                this.loading = false;
            },
            error: (error) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: 'Impossible de charger les données du collaborateur'
                });
                this.router.navigate(['/collaborateurs']);
            }
        });
    }

    // Navigation
    nextStep(): void {
        if (this.activeStep === 0) {
            // Valider l'étape 1 avant de passer à l'étape 2
            if (this.validateStep1()) {
                this.activeStep++;
            }
        } else {
            this.activeStep++;
        }
    }

    prevStep(): void {
        if (this.activeStep > 0) {
            this.activeStep--;
        }
    }

    // Validation de l'étape 1
    private validateStep1(): boolean {
        const controls = ['nom', 'prenoms', 'matricule', 'email'];
        for (const control of controls) {
            if (this.collaborateurForm.get(control)?.invalid) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Validation',
                    detail: 'Veuillez remplir correctement tous les champs obligatoires de l\'étape 1'
                });
                return false;
            }
        }
        return true;
    }

    // Sauvegarde
    // form-collaborateur.component.ts
  /*  save(): void {
        if (this.collaborateurForm.invalid) {
            Object.keys(this.collaborateurForm.controls).forEach(key => {
                this.collaborateurForm.get(key)?.markAsTouched();
            });
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Veuillez remplir tous les champs obligatoires'
            });
            return;
        }

        this.saving = true;
        const collaborateurData = this.collaborateurForm.value;

        // Pour la création, si pas de mot de passe fourni, utiliser le matricule
        if (!this.isEdit && !collaborateurData.password) {
            collaborateurData.password = collaborateurData.matricule;
        }

        if (this.isEdit && this.collaborateurId) {
            // Mode édition
            this.collaborateurService.updateCollaborateur(this.collaborateurId, collaborateurData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Collaborateur mis à jour avec succès',
                        life: 3000
                    });
                    setTimeout(() => this.router.navigate(['/collaborateurs']), 1500);
                },
                error: (error) => {
                    this.saving = false;
                    this.handleError(error);
                }
            });
        } else {
            // Mode création
            this.collaborateurService.createCollaborateur(collaborateurData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Collaborateur créé avec succès',
                        life: 3000
                    });
                    setTimeout(() => this.router.navigate(['/collaborateurs']), 1500);
                },
                error: (error) => {
                    this.saving = false;
                    this.handleError(error);
                }
            });
        }
    }*/

    save(): void {
        if (this.collaborateurForm.invalid) {
            Object.keys(this.collaborateurForm.controls).forEach(key => {
                this.collaborateurForm.get(key)?.markAsTouched();
            });
            this.messageService.add({
                severity: 'warn',
                summary: 'Validation',
                detail: 'Veuillez remplir tous les champs obligatoires'
            });
            return;
        }

        this.saving = true;
        const collaborateurData = this.collaborateurForm.value;

        // Pour la création, si pas de mot de passe fourni, utiliser le matricule
        if (!this.isEdit && !collaborateurData.password) {
            collaborateurData.password = collaborateurData.matricule;
        }

        // ✅ AJOUTER LA SIGNATURE AUX DONNÉES
        if (this.signatureBase64) {
            collaborateurData.signature = this.signatureBase64;
        }

        console.log('Données envoyées:', collaborateurData);

        if (this.isEdit && this.collaborateurId) {
            // Mode édition
            this.collaborateurService.updateCollaborateur(this.collaborateurId, collaborateurData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Collaborateur mis à jour avec succès',
                        life: 3000
                    });
                    setTimeout(() => this.router.navigate(['/collaborateurs']), 1500);
                },
                error: (error) => {
                    this.saving = false;
                    this.handleError(error);
                }
            });
        } else {
            // Mode création
            this.collaborateurService.createCollaborateur(collaborateurData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Succès',
                        detail: 'Collaborateur créé avec succès',
                        life: 3000
                    });
                    setTimeout(() => this.router.navigate(['/collaborateurs']), 1500);
                },
                error: (error) => {
                    this.saving = false;
                    this.handleError(error);
                }
            });
        }
    }

    private handleError(error: any): void {
        console.error('Erreur détaillée:', error);

        let errorMessage = 'Erreur lors de l\'opération';

        if (error.error && typeof error.error === 'string') {
            // Si l'erreur est une string
            errorMessage = error.error;
        } else if (error.error && error.error.message) {
            // Si l'erreur a une propriété message
            errorMessage = error.error.message;
        } else if (error.status === 400) {
            if (error.error && error.error.includes('email')) {
                errorMessage = 'Cet email est déjà utilisé par un autre collaborateur';
            } else {
                errorMessage = 'Données invalides. Vérifiez les informations saisies.';
            }
        } else if (error.status === 409) {
            errorMessage = 'Un collaborateur avec ce matricule ou cet email existe déjà';
        } else if (error.status === 500) {
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: errorMessage,
            life: 5000
        });
    }

    cancel(): void {
        this.router.navigate(['/collaborateurs']);
    }

    // Getters pour accéder facilement aux champs
    get f() {
        return this.collaborateurForm.controls;
    }
}

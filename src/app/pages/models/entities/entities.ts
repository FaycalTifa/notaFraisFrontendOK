import { Role } from "../enum/role";


export interface Utilisateur {
    id?: number;
    username?: string;
    prenom?: string;
    nom?: string;
    password?: string;
    passwordConfirme?: string;
}

// Interface pour la requête de login
export interface LoginRequest {
    email: string;
    password: string;
}

// Interface pour la réponse de login
export interface LoginResponse {
    token: string;
    type: string;
    id: number;
    email: string;
    nomComplet: string;
    role: string;
    direction?: string;
    service?: string;
    section?: string;
}

// Interface pour un collaborateur
export interface Collaborateur {
    id?: number;
    nom: string;
    prenoms: string;
    nomComplet?: string;
    matricule: string;
    email: string;
    telephone?: string;
    dateEmbauche?: Date;
    posteActuel?: string;
    experienceCumulee?: string;
    role: 'ADMIN' | 'DIRECTEUR' | 'CHEF_SERVICE' | 'CHEF_SECTION' | 'COLLABORATEUR';
    actif: boolean;

    // Relations
    directionId?: number;
    directionNom?: string;
    serviceId?: number;
    serviceNom?: string;
    sectionId?: number;
    sectionNom?: string;
    responsableDirectId?: number;
    responsableDirectNom?: string;
    responsableHierarchiqueId?: number;
    responsableHierarchiqueNom?: string;

    [key: string]: string | number | boolean | Date | undefined; // Index signature
}

// Interface pour la création d'un collaborateur
export interface CollaborateurRequest {
    nom: string;
    prenoms: string;
    matricule: string;
    email: string;
    password?: string;
    telephone?: string;
    dateEmbauche?: Date;
    posteActuel?: string;
    role: string;
    directionId?: number;
    serviceId?: number;
    sectionId?: number;
    responsableDirectId?: number;

    [key: string]: string | number | Date | undefined; // Index signature
}

export interface Direction {
    id?: number;
    code: string;
    nom: string;
    description?: string;
    directeurId?: number;
    directeurNom?: string;
    nombreServices?: number;
    nombreCollaborateurs?: number;
}

export interface DirectionResponse {
    id: number;
    code: string;
    nom: string;
    description: string;
    directeurId: number;
    directeurNom: string;
    nombreServices: number;
    nombreCollaborateurs: number;
}



export interface Section {
    id?: number;
    code: string;
    nom: string;
    description?: string;
    serviceId?: number;
    serviceNom?: string;
    chefSectionId?: number;
    chefSectionNom?: string;
    nombreCollaborateurs?: number;
}

export interface SectionResponse {
    id: number;
    code: string;
    nom: string;
    description: string;
    serviceId: number;
    serviceNom: string;
    chefSectionId: number;
    chefSectionNom: string;
    nombreCollaborateurs: number;
}

export interface ServiceEntity {
    id?: number;
    code: string;
    nom: string;
    description?: string;
    directionId?: number;
    directionNom?: string;
    chefServiceId?: number;
    chefServiceNom?: string;
    nombreSections?: number;
    nombreCollaborateurs?: number;
}

export interface ServiceResponse {
    id: number;
    code: string;
    nom: string;
    description?: string;        // ← Rendre optionnel
    directionId: number;
    directionNom: string;
    chefServiceId?: number;       // ← Optionnel
    chefServiceNom?: string;      // ← Optionnel
    nombreSections: number;
    nombreCollaborateurs: number;
}

export interface Agent {
    id?: number;
    code?: string;
    libelle?: string;
    deleted?: boolean;
    section?: Section;
    sectionId?: number;
}

export interface RegisterDTO {
    username?: string;
    prenom?: string;
    nom?: string;
    password?: string;
    confirmPassword?: string; // Ajout de la confirmation
    role?: string;
    directionId?: number;
    serviceId?: number;
    sectionId?: number;
    agentId?: number;
}

export interface AnneeExercice {
    id?: number;
    annee: number;
    isActived: boolean;
}

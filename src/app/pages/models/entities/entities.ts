
export interface Utilisateur {
    id?: number;
    username?: string;
    prenom?: string;
    nom?: string;
    password?: string;
    passwordConfirme?: string;
}


export interface Direction {
    id?: number;
    code?: string;
    libelle?: string;
    deleted?: boolean;
}

export interface Evaluation {
    id?: number;
    niveau?: string;
    deleted?: boolean;
}

export interface Section {
    id?: number;
    code?: string;
    libelle?: string;
    deleted?: boolean;
    service?: ServiceEntite;
    serviceId?: number;
}

export interface ServiceEntite {
    id?: number;
    code?: string;
    libelle?: string;
    deleted?: boolean;
    direction?: Direction;
    directionId?: number;
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

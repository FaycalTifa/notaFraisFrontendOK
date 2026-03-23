import { Collaborateur } from "./entities";


// models/entities/evaluation.ts

export interface Evaluation {
    evaluateur: any;
    collaborateur: any;
    id?: number;
    annee: number;
    dateCreation?: Date;
    dateEntretien?: Date;
    dateValidation?: Date;
    statut?: 'BROUILLON' | 'A_APPROUVER' | 'APPROUVEE' | 'A_VALIDER_SERVICE' | 'A_VALIDER_DIRECTEUR' | 'EN_COURS' | 'VALIDEE' | 'REFUSEE' | 'ANNULEE';
    // Relations
    collaborateurId?: number;
    dateRefus?: Date;
    motifRefus?: string;
    refuseParNom?: string;
    collaborateurNom?: string;
    evaluateurId?: number;
    evaluateurNom?: string;

    motifAnnulation?: string;
    dateAnnulation?: Date;
    annulePar?: string;
    annuleParId?: number;

    dateSignatureResponsable?: Date;    // ✅ Date de signature responsable
    dateSignatureCollaborateur?: Date;  // ✅ Date de signature collaborateur

    signatureResponsableBoolean?: boolean;      // true si signé, false ou undefined sinon
    signatureCollaborateurBoolean?: boolean;     // true si signé, false ou undefined sinon

    // Sections
    faitsMarquants?: string[];  // Gardez pour la compatibilité
    faitsMarquantsSelection?: FaitMarquant[];  // Nouveau champ pour les faits structurés
    objectifs?: ObjectifEvaluation[];
    noteGlobaleObjectifs?: number;

    // Tenue du poste
    respectEngagements?: number;
    qualiteMethodesTravail?: number;
    capacitesAdaptationOrganisation?: number;
    encadrement?: number;
    espritInitiativeInnovation?: number;
    relationPresentation?: number;
    ponctualite?: number;
    respectReglementInterieur?: number;
    noteGlobaleTenuePoste?: number;

    // Maîtrise
    niveauTechnique?: string;
    niveauExperience?: string;
    niveauEncadrement?: string;
    commentairesMaitrise?: string;

    // Objectifs futurs
    objectifsFuturs?: ObjectifFutur[];

    // Formations
    souhaitsFormations?: SouhaitFormation[];

    // Commentaires et signatures
    noteGlobaleFinale?: number;
    commentaireResponsable?: string;
    commentaireCollaborateur?: string;
    commentaireN2?: string;
    commentaireN3?: string;
    signatureResponsable?: string;
    signatureCollaborateur?: string;
    notesAnterieures?: number[];

    // Métadonnées
    createdBy?: number;
    updatedBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface EvaluationRequest {
    annee: number;
    collaborateurId: number;
    dateEntretien?: Date;
    faitsMarquants?: string[];
    objectifs?: ObjectifEvaluation[];
    respectEngagements?: number;
    qualiteMethodesTravail?: number;
    capacitesAdaptationOrganisation?: number;
    encadrement?: number;
    motifRefus?: string;
    espritInitiativeInnovation?: number;
    relationPresentation?: number;
    ponctualite?: number;
    respectReglementInterieur?: number;
    niveauTechnique?: string;
    dateRefus?: Date;
    refuseParId?: number;          // ID de la personne qui a refusé
    refuseParNom?: string;
    niveauExperience?: string;
    niveauEncadrement?: string;
    commentairesMaitrise?: string;
    objectifsFuturs?: ObjectifFutur[];
    souhaitsFormations?: SouhaitFormation[];
    faitsMarquantsSelection?: FaitMarquant[];  // Nouveau champ pour les faits structurés
    faitsMarquantsStruct?: FaitMarquant[];
    commentaireResponsable?: string;
    commentaireCollaborateur?: string;
    commentaireN2?: string;
    commentaireN3?: string;
}

export interface AnnulationRequest {
    motif: string;
    commentaire?: string;
}

export interface FaitMarquant {
    type: 'CHANGEMENT_POSTE' | 'MISSION_SPECIFIQUE' | 'MUTATION' | 'PROMOTION' | 'FORMATION' | 'AUTRE';
    description?: string;
    date?: Date;
}

export interface ObjectifEvaluation {
    id?: number;
    libelle: string;
    appreciationCollaborateur?: string;
    appreciationResponsable?: string;
    niveauAtteinte?: 'EXCELLENT' | 'BIEN' | 'PASSABLE' | 'INSUFFISANT' | 'FAIBLE';
    cotation?: number;
    tauxAtteinte?: number;
}

export interface ObjectifFutur {
    id?: number;
    libelle: string;
    planAction?: string;
    moyens?: string;
    indicateursSuivi?: string;
    type: 'ANNUEL' | 'TENUE_POSTE';
}

export interface SouhaitFormation {
    id?: number;
    theme: string;
    objectifs?: string;
    resultatsAttendus?: string;
    delaisEvaluation?: string;
}

export const StatutLabels: { [key: string]: string } = {
    'BROUILLON': 'Brouillon',
    'A_APPROUVER': 'À approuver',
    'APPROUVEE': 'Approuvée',
    'A_VALIDER_SERVICE': 'À valider (Chef service)',
    'A_VALIDER_DIRECTEUR': 'À valider (Directeur)',
    'VALIDEE': 'Validée',
    'REFUSEE': 'Refusée',
    'ANNULEE': 'Annulée'
};

export const StatutColors: { [key: string]: string } = {
    'BROUILLON': 'warning',
    'A_APPROUVER': 'info',
    'APPROUVEE': 'success',
    'A_VALIDER_SERVICE': 'help',
    'A_VALIDER_DIRECTEUR': 'help',
    'VALIDEE': 'success',
    'REFUSEE': 'danger',
    'ANNULEE': 'secondary'
};

import { Collaborateur } from "./entities";


// evaluation.ts
export interface Evaluation {
    id?: number;
    annee: number;
    dateCreation?: Date;
    dateEntretien?: Date;
    dateValidation?: Date;
    statut?: 'BROUILLON' | 'EN_COURS' | 'A_VALIDER' | 'VALIDEE' | 'REFUSEE';

    // Relations
    collaborateurId?: number;
    collaborateurNom?: string;
    evaluateurId?: number;
    evaluateurNom?: string;

    // Sections
    faitsMarquants?: string[];
    objectifs?: ObjectifEvaluation[];
    noteGlobaleObjectifs?: number;  // ← Assurez-vous que c'est number, pas string

    // Tenue du poste
    respectEngagements?: number;
    qualiteMethodesTravail?: number;
    capacitesAdaptationOrganisation?: number;
    encadrement?: number;
    espritInitiativeInnovation?: number;
    relationPresentation?: number;
    ponctualite?: number;
    respectReglementInterieur?: number;
    noteGlobaleTenuePoste?: number;  // ← Assurez-vous que c'est number

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
    noteGlobaleFinale?: number;  // ← Assurez-vous que c'est number
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
    espritInitiativeInnovation?: number;
    relationPresentation?: number;
    ponctualite?: number;
    respectReglementInterieur?: number;
    niveauTechnique?: string;
    niveauExperience?: string;
    niveauEncadrement?: string;
    commentairesMaitrise?: string;
    objectifsFuturs?: ObjectifFutur[];
    souhaitsFormations?: SouhaitFormation[];
    commentaireResponsable?: string;
    commentaireCollaborateur?: string;
    commentaireN2?: string;
    commentaireN3?: string;
}

/*export interface ObjectifEvaluation {
    id?: number;
    libelle: string;
    appreciationCollaborateur?: string;
    appreciationResponsable?: string;
    niveauAtteinte?: string;
    cotation?: number;
    tauxAtteinte?: number;
}*/

/*export interface ObjectifFutur {
    id?: number;
    libelle: string;
    planAction?: string;
    moyens?: string;
    indicateursSuivi?: string;
    type?: string;
}*/

export interface SouhaitFormation {
    id?: number;
    theme: string;
    objectifs?: string;
    resultatsAttendus?: string;
    delaisEvaluation?: string;
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
    'EN_COURS': 'En cours',
    'A_SIGNER': 'À signer',
    'VALIDEE': 'Validée',
    'ARCHIVEE': 'Archivée'
};

export const StatutColors: { [key: string]: string } = {
  //  'BROUILLON': 'secondary',
    //'EN_COURS': 'info',
   // 'A_SIGNER': 'warning',
    'VALIDEE': 'success',
   // 'ARCHIVEE': 'danger'
};

export const NiveauAtteinteLabels: { [key: string]: string } = {
    'EXCELLENT': 'Excellent (>100%)',
    'BIEN': 'Bien (80-100%)',
    'PASSABLE': 'Passable (55-75%)',
    'INSUFFISANT': 'Insuffisant (35-50%)',
    'FAIBLE': 'Faible (≤30%)'
};

export const NiveauMaitriseLabels: { [key: string]: string } = {
    'DEBUTANT': 'Débutant(e)',
    'INTERMEDIAIRE': 'Intermédiaire',
    'CONFIRME': 'Confirmé(e)',
    'EXPERT': 'Expert(e)'
};

export const TypeObjectifLabels: { [key: string]: string } = {
    'ANNUEL': 'Objectif Annuel',
    'TENUE_POSTE': 'Tenue du poste'
};


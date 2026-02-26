// models/role.enum.ts
export enum Role {
    ADMIN = 'ADMIN',
    DIRECTEUR = 'DIRECTEUR',
    CHEF_SERVICE = 'CHEF_SERVICE',
    CHEF_SECTION = 'CHEF_SECTION',
    COLLABORATEUR = 'COLLABORATEUR'
}

export const RoleLabels: Record<Role, string> = {
    [Role.ADMIN]: 'Administrateur',
    [Role.DIRECTEUR]: 'Directeur',
    [Role.CHEF_SERVICE]: 'Chef de Service',
    [Role.CHEF_SECTION]: 'Chef de Section',
    [Role.COLLABORATEUR]: 'Agent'
};

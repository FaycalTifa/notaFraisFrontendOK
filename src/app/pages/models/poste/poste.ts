import {IService} from "../service/service";

export interface IPoste {
    id?: number;
    serviceId?: number;
    libelle?: string;
    description?: string;
    services?: IService;
    serviceLibelle?: string;
    serviceDescription?: string;
    deleted?: boolean;
}
export class Poste implements IPoste{
    constructor(
        public id?: number,
        public serviceId?: number,
        public libelle?: string,
        public description?: string,
        public serviceLibelle?: string,
        public serviceDescription?: string,
        public services?: IService,
        public deleted?: boolean,

    ){
        this.deleted = this.deleted ?? false;
    }
}
export function getPosteIdentifier(poste: IPoste): number | undefined {
    return poste.id;
}

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Table} from "primeng/table";
import {IPoste, Poste} from "../../models/poste/poste";
import {ConfirmationService, MessageService} from "primeng/api";
import {PosteService} from "../../services/poste/poste.service";
import {HttpResponse} from "@angular/common/http";
import {IService} from "../../models/service/service";
import {ServiceService} from "../../services/service/service.service";
import {KeycloakService} from "keycloak-angular";
@Component({
  selector: 'app-poste',
  templateUrl: './poste.component.html',
  styleUrls: ['./poste.component.scss']
})
export class PosteComponent implements OnInit {
    ngOnInit(): void {
    }
 /* loading:boolean = false;
  @ViewChild('dt') table: Table;
  @ViewChild('filter') filter: ElementRef;
  postes?: IPoste[];
  services?: IService[];
  displayDialogue: boolean;
  poste: IPoste = new Poste();
  keycloakUser: string = '';
  userRole :string[] = [];
  IS_EMPLOYE ='IS_EMPLOYE';
  IS_CHEF_SERVICE ='IS_CHEF_SERVICE';
  IS_CHEF_COMPTABILITE ='IS_CHEF_COMPTABILITE';
  IS_DG ='IS_DG';
  IS_COMPTABILITE = 'IS_COMPTABILITE';
  IS_PARAMETRAGE_MANAGER = 'IS_PARAMETRAGE_MANAGER';
  IS_CHEF_PERSONNEL = 'IS_CHEF_PERSONNEL';
  IS_EMPLOYE_ROLE: string ='';
  IS_CHEF_SERVICE_ROLE: string ='';
  IS_DG_ROLE: string = '';
  IS_COMPTABILITE_ROLE: string = '';
  IS_CHEF_COMPTABILITE_ROLE: string = '';
  IS_PARAMETRAGE_MANAGER_ROLE: string = '';
  IS_CHEF_PERSONNEL_ROLE: string = '';
  isLogin: boolean = false;
  IS_ADMIN_ROLE : string = '';
  IS_ADMIN = 'IS_ADMIN';
  serviceId: number;

  constructor(
      private messageService: MessageService,
      protected posteService: PosteService,
      protected serviceService: ServiceService,
      protected keycloakService: KeycloakService,
      private confirmationService: ConfirmationService,) {}

  ngOnInit(): void {
    this.getAllPostes();
    this.getAllServices();
   // this.toInitFunctions();
  }

  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
  getAllServices(): void {
    this.serviceService.getAllServices().subscribe((res: HttpResponse<IService[]>) => {
      const data = res.body ?? [];
      this.services = data;
    });
  }
  getAllPostes(): void {
    this.posteService.getAllPostes().subscribe((res: HttpResponse<IPoste[]>) => {
      const data = res.body ?? [];
      this.postes = data;
    });
  }
  confirmPosteDelete(poste : IPoste): void {
    this.posteService.deletePoste(poste.id).subscribe(
      resp =>{
        if(resp){
          this.successAlert();
          this.getAllPostes();
          this.ngOnInit();
        }
      }
    );
  }
  successAlert(): void {
    this.messageService.add({severity:'success', summary:'Opération réussie!'});
  }
  onDisplayDialogue(poste :IPoste): void {
    this.poste = poste;
    this.displayDialogue = true;
  }
  onHidenDialogue(): void {
    this.displayDialogue = false;
  }
  onDeletePoste(event: Event, poste : IPoste) {
    this.confirmationService.confirm(
        {
          target: event.target,
          message: 'Êtes-vous sûr de vouloir supprimer '+ poste.libelle + ' ?',
          accept: () => {
            this.confirmPosteDelete(poste);
            this.getAllPostes();
            this.ngOnInit();
          }
        });
    this.getAllPostes();
    this.ngOnInit();
  }
  onSelectedService(service: IService): void{
    this.serviceId = service.id;
  }
  onSave(poste : IPoste): void {
    if (poste.id !== undefined) {
      poste.serviceId = this.serviceId;
      this.posteService.updatePoste(this.poste).subscribe(
        resp=>{
          if(resp){
            this.poste = new Poste();
            this.onHidenDialogue();
            this.successAlert();
            this.getAllPostes();
          }
        }
      );
    } else {
      poste.serviceId = this.serviceId;
      this.posteService.createPoste(poste).subscribe(
        resp=>{
          if(resp){
            this.poste = new Poste();
            this.onHidenDialogue();
            this.successAlert();
            this.getAllPostes();
          }
        }
      );
    }
  }
  getUserRole() : void {
    this.userRole = this.keycloakService.getUserRoles();
    this.IS_EMPLOYE_ROLE = this.userRole.find( role => role.startsWith(this.IS_EMPLOYE) );
    this.IS_CHEF_SERVICE_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_SERVICE));
    this.IS_DG_ROLE = this.userRole.find( role => role.startsWith(this.IS_DG) );
    this.IS_COMPTABILITE_ROLE = this.userRole.find( role => role.startsWith(this.IS_COMPTABILITE));
    this.IS_PARAMETRAGE_MANAGER_ROLE = this.userRole.find( role => role.startsWith(this.IS_PARAMETRAGE_MANAGER));
    this.IS_CHEF_PERSONNEL_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_PERSONNEL));
    this.IS_CHEF_COMPTABILITE_ROLE = this.userRole.find( role => role.startsWith(this.IS_CHEF_COMPTABILITE));
    this.IS_ADMIN_ROLE = this.userRole.find( role => role.startsWith(this.IS_ADMIN));
  }
  canActivate() : void {
    this.isLogin = !!this.keycloakService.isLoggedIn();
  }
  toInitFunctions() :void {
    this.getUserRole();
    this.canActivate();
    this.getAllPostes();
  }*/
}

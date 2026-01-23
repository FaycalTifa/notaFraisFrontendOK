import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.scss']
})
export class ServiceComponent implements OnInit {
    ngOnInit(): void {
    }
 /* loading: boolean = false;
  @ViewChild('dt') table: Table;
  @ViewChild('filter') filter: ElementRef;
  services?:  IService[];
  postesOfService?:  any = 0;
  postesOfServiceLength?:  number = 0;
  displayDialogue: boolean;
  service: IService = new Service();
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
  cannotDelete: boolean = false;
  IS_ADMIN_ROLE : string = '';
  IS_ADMIN = 'IS_ADMIN';
  constructor(
      private messageService: MessageService,
      protected serviceService: ServiceService,
      protected keycloakService: KeycloakService,
      private confirmationService: ConfirmationService,) {}

  ngOnInit(): void {
    this.getAllServices();
  //  this.toInitFunctions();
  }
  clear(table: Table) {
    table.clear();
    this.filter.nativeElement.value = '';
  }
  getAllServices(): void {
    this.serviceService.getAllServices().subscribe((res: HttpResponse<IService[]>) => {
      const data = res.body ?? [];
      this.services = data;
      this.postesOfService = data.filter( postesOfService => postesOfService.postes);
      //this.postesOfServiceLength = this.postesOfService.length;
    });
  }
  confirmServiceDelete(service : IService): void {
    this.serviceService.deleteService(service.id).subscribe();
    this.successAlert();
    this.getAllServices();
    this.ngOnInit();
    }
  successAlert() {
    this.messageService.add({severity:'success', summary:'Opération réussie!'});
  }
  onDisplayDialogue(service :IService): void {
    this.service = service;
    this.displayDialogue = true;
  }
  onHidenDialogue(): void {
    this.displayDialogue = false;
  }
  onDeleteService(event: Event, service: IService) {
    if(this.postesOfServiceLength <=0){
      this.confirmationService.confirm(
          {
            target: event.target,
            message: 'Êtes-vous sûr de vouloir supprimer ' + service.libelle + ' ?',
            accept: () => {
              this.confirmServiceDelete(service);
              this.getAllServices();
              this.ngOnInit();
            }
          });
      this.getAllServices();
      this.ngOnInit();
    } else {
      this.cannotDelete = true;
    }
  }
  onSave(service : IService): void {
    if (service.id !== undefined) {
      this.serviceService.updateService(service).subscribe();
      this.getAllServices();
    } else {
      this.serviceService.createService(service).subscribe();
      this.getAllServices();
    }
    this.service = new Service();
    this.onHidenDialogue();
    this.successAlert();
    this.getAllServices();
    this.ngOnInit();
  }
  getUserRole(): void {
    this.userRole = this.keycloakService.getUserRoles();
    this.IS_EMPLOYE_ROLE = this.userRole.find( role => role.startsWith(this.IS_EMPLOYE));
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
  toInitFunctions(): void {
    this.getUserRole();
    this.canActivate();
  }*/
}

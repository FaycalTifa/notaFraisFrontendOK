import { Component, OnInit } from '@angular/core';
import {Direction, ServiceEntity} from '../../models/entities/entities';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DirectionService} from '../../services/Direction/direction.service';
import {ServiceEntiteService} from '../../services/ServiceEntite/service-entite.service';
import {ServiceService} from '../../services/service/service.service';
import {HttpResponse} from '@angular/common/http';

@Component({
  selector: 'app-service-entite',
  templateUrl: './service-entite.component.html',
  styleUrls: ['./service-entite.component.scss']
})
export class ServiceEntiteComponent implements OnInit {


    ngOnInit(): void {
        
    }
   
}

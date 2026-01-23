import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Agent, Direction, Section, ServiceEntite} from '../../models/entities/entities';

@Injectable({
  providedIn: 'root'
})
export class HierarchieService {

    private apiUrl = 'http://localhost:8080/api';

    constructor(private http: HttpClient) { }

    // Récupérer toutes les directions
    getDirections(): Observable<Direction[]> {
        return this.http.get<Direction[]>(`${this.apiUrl}/direction`);
    }

    // Récupérer les services d'une direction
    getServicesByDirection(directionId: number): Observable<ServiceEntite[]> {
        return this.http.get<ServiceEntite[]>(`${this.apiUrl}/services/direction/${directionId}`);
    }

    // Récupérer les sections d'un service
    getSectionsByService(serviceId: number): Observable<Section[]> {
        console.log('===== getSectionsByService ========', serviceId);
        return this.http.get<Section[]>(`${this.apiUrl}/sections/service/${serviceId}`);
    }

    // Récupérer les agents d'une section
    getAgentsBySection(sectionId: number): Observable<Agent[]> {
        return this.http.get<Agent[]>(`${this.apiUrl}/agents/section/${sectionId}`);
    }
}

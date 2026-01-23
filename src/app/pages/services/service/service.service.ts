import { Injectable } from '@angular/core';
import {environment} from '../../../../environments/environment';
import {getServiceIdentifier, IService} from '../../models/service/service';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {Observable} from 'rxjs';
import {ServiceEntite} from '../../models/entities/entities';

export type EntityResponseType = HttpResponse<IService>;
export type EntityArrayResponseType = HttpResponse<IService[]>;

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
    private apiUrl = 'http://localhost:8080/api/services';

    constructor(private http: HttpClient) { }

    createService(service: ServiceEntite): Observable<ServiceEntite> {
        return this.http.post<ServiceEntite>(this.apiUrl, service);
    }

    updateService(id: number, service: ServiceEntite): Observable<ServiceEntite> {
        return this.http.put<ServiceEntite>(`${this.apiUrl}/${id}`, service);
    }

    deleteService(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getAllServices(): Observable<ServiceEntite[]> {
        return this.http.get<ServiceEntite[]>(this.apiUrl);
    }

    getServiceById(id: number): Observable<ServiceEntite> {
        return this.http.get<ServiceEntite>(`${this.apiUrl}/${id}`);
    }

    getServicesByDirection(directionId: number): Observable<ServiceEntite[]> {
        return this.http.get<ServiceEntite[]>(`${this.apiUrl}/direction/${directionId}`);
    }
}
